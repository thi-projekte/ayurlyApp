import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import styles from './MyAyurlyPage.module.css';
import Calendar from '../components/MyAyurly/Calendar';
import RoutineDetailModal from '../components/MyAyurly/RoutineDetailModal'
import PreferencesModal from '../components/MyAyurly/PreferencesModal';
import { FaEnvelope, FaCog, FaUser, FaSignOutAlt, FaTasks, FaExclamationTriangle, FaRegThumbsUp, FaThumbsUp, FaRegClock } from 'react-icons/fa';
import FullRecipeCard from '../components/MyAyurly/FullRecipeCard';
import FullYogaCard from '../components/MyAyurly/FullYogaCard';
import myAyurlyService from '../services/myAyurlyService';
import myAyurlyHistoryService from '../services/myAyurlyHistoryService';
import recipeService from '../services/recipeService';
import yogaExerciseService from '../services/yogaExerciseService';
import microhabitService from '../services/microhabitService';
import HistoryGraph from '../components/MyAyurly/HistoryGraph';

const getLocalDateString = (date) => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const MyAyurlyPage = () => {
  const { userProfile, doshaType, accountManagementUrl, logout, loadingKeycloak, updateUserPreferences } = useUser();

  const [activeModalData, setActiveModalData] = useState(null);
  const [isPreferencesModalOpen, setIsPreferencesModalOpen] = useState(false);

  const [likingId, setLikingId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(getLocalDateString(new Date()));
  const [dashboardContent, setDashboardContent] = useState(null);
  const [status, setStatus] = useState('loading');
  const [monthlyProgress, setMonthlyProgress] = useState([]);
  const [calendarViewDate, setCalendarViewDate] = useState(new Date());
  
  const [reshufflingTiles, setReshufflingTiles] = useState([]);
  const [pollingInterval, setPollingInterval] = useState(null);

  const selectedDateRef = useRef(selectedDate);
  useEffect(() => {
    selectedDateRef.current = selectedDate;
  }, [selectedDate]);

  const openModal = (tileKey, title, content) => {
    setActiveModalData({
      key: tileKey,
      title: title,
      content: sortDashboardItems(content || [])
    });
  };

  const closeModal = () => setActiveModalData(null);

  const stopPolling = useCallback(() => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
  }, [pollingInterval]);

  const handleDateSelect = useCallback((date) => {
    setSelectedDate(getLocalDateString(date));
  }, []);

  const triggerContentGeneration = useCallback(async (date) => {
    setStatus('generating');
    setDashboardContent(null);
    try {
      await myAyurlyService.generateDashboardContent(date);
      const intervalId = setInterval(() => {
        // Diese innere Funktion ruft den Service direkt auf, um Abhängigkeitsprobleme zu umgehen
        myAyurlyService.getDashboardContent(date)
          .then(result => {
            if (date === selectedDateRef.current && result.status !== 'NO_CONTENT_FOUND') {
              stopPolling();
              setDashboardContent(result);
              setStatus('success');
            } else if (date !== selectedDateRef.current) {
              console.log("Veraltetes Polling-Ergebnis für die Generierung ignoriert.");
              stopPolling(); // Alten Poller anhalten
            }
          }).catch(err => {
            console.error("Polling-Fehler:", err);
            setStatus('error');
            stopPolling();
          });
      }, 3000);
      setPollingInterval(intervalId);
    } catch (err) {
      console.error("Fehler beim Starten der Content-Generierung:", err);
      setStatus('error');
      stopPolling();
    }
  }, [stopPolling]);


  useEffect(() => {
    if (loadingKeycloak || !userProfile) return;

    let intervalId = null; // Lokale Variable für den Timer

    const triggerContentGeneration = async (date) => {
      setStatus('generating');
      setDashboardContent(null);
      try {
        await myAyurlyService.generateDashboardContent(date);
        intervalId = setInterval(async () => {
          const result = await myAyurlyService.getDashboardContent(date);
          if (result.status !== 'NO_CONTENT_FOUND') {
            clearInterval(intervalId);
            setDashboardContent(result);
            setStatus('success');
          }
        }, 3000);
      } catch (err) {
        console.error("Fehler beim Starten der Content-Generierung:", err);
        setStatus('error');
      }
    };


    myAyurlyService.getDashboardContent(selectedDate)
      .then(result => {
        if (result.status === 'NO_CONTENT_FOUND') {
          const isPastDate = new Date(selectedDate) < new Date(getLocalDateString(new Date()));
          if (isPastDate) {
            setDashboardContent(null);
            setStatus('success');
          } else {
            triggerContentGeneration(selectedDate);
          }
        } else {
          setDashboardContent(result);
          setStatus('success');
        }
      })
      .catch(err => {
        console.error("Fehler beim Laden des Dashboard Contents:", err);
        setStatus('error');
      });

    return () => {
      if (intervalId) clearInterval(intervalId); 
    };
  }, [selectedDate, userProfile, loadingKeycloak]);

  useEffect(() => {
    if (!userProfile) return;

    const fetchProgress = async () => {
        try {
            const year = calendarViewDate.getFullYear();
            const month = calendarViewDate.getMonth() + 1;
            const data = await myAyurlyHistoryService.getMonthlySummary(year, month);
            setMonthlyProgress(data);
        } catch (error) {
            console.error("Fehler beim Laden der Monatsübersicht:", error);
        }
    };
    fetchProgress();
  }, [calendarViewDate, userProfile]);

  useEffect(() => {
    if (activeModalData && dashboardContent) {
      const camelCaseKey = activeModalData.key.toLowerCase().replace(/_([a-z])/g, g => g[1].toUpperCase());
      const updatedContent = dashboardContent[camelCaseKey];
      if (updatedContent) {
        setActiveModalData(prevData => ({ ...prevData, content: sortDashboardItems(updatedContent) }));
      }
    }
  }, [dashboardContent]);

  const capitalizedDosha = doshaType ? doshaType.charAt(0).toUpperCase() + doshaType.slice(1).toLowerCase() : 'Unbekannt';
  const doshaDetails = {
    Vata: { icon: "🌀", description: "Du bist kreativ, beweglich, aber manchmal unruhig." },
    Pitta: { icon: "🔥", description: "Du bist zielstrebig, energiegeladen, aber manchmal auch hitzköpfig." },
    Kapha: { icon: "🌱", description: "Du bist stabil, liebevoll, aber neigst zur Trägheit." },
    Unbekannt: { icon: "❔", description: "Mache den Test, um dein Dosha zu entdecken." },
  };
  const currentDosha = doshaDetails[capitalizedDosha];

  const handleOpenAccountManagement = () => {
    if (accountManagementUrl) window.open(accountManagementUrl, '_blank');
  };

  const handleReshuffle = async (tileKey) => {
    const confirmed = window.confirm("Möchtest du die Inhalte für diese Kachel wirklich neu laden? Dein bisheriger Fortschritt für diese Aufgaben an diesem Tag geht dabei verloren.");
    if (!confirmed) return;

    setReshufflingTiles(prev => [...prev, tileKey]);
    closeModal();

    const camelCaseKey = tileKey.toLowerCase().replace(/_([a-z])/g, g => g[1].toUpperCase());
    const oldContentIds = new Set(dashboardContent[camelCaseKey]?.map(item => item.contentItemId) || []);


    try {
      await myAyurlyService.startReshuffleProcess(selectedDate, tileKey);

      const intervalId = setInterval(async () => {
        const result = await myAyurlyService.getDashboardContent(selectedDate);

        if (result.status !== 'NO_CONTENT_FOUND') {
          const newTileContent = result[camelCaseKey];

          // 2. Prüfe, ob die neuen Inhalte tatsächlich anders sind als die alten.
          if (newTileContent) {
            const newContentIds = new Set(newTileContent.map(item => item.contentItemId));

            const hasChanged = oldContentIds.size !== newContentIds.size || [...oldContentIds].some(id => !newContentIds.has(id));

            if (hasChanged) {
              clearInterval(intervalId);
              setDashboardContent(result);
              setReshufflingTiles(prev => prev.filter(key => key !== tileKey));
            }
          }
        }
      }, 3000);
      setTimeout(() => {
        clearInterval(intervalId);
        setReshufflingTiles(prev => prev.filter(key => key !== tileKey));
      }, 60000);
    } catch (error) {
      if (error.status === 409) {
        console.log("Reshuffle-Prozess läuft bereits, Polling wird fortgesetzt.");
      } else {
        console.error(`Fehler beim Starten des Reshuffle-Prozesses für ${tileKey}:`, error);
        alert("Ein Fehler ist aufgetreten. Die Inhalte konnten nicht neu geladen werden.");
        setReshufflingTiles(prev => prev.filter(key => key !== tileKey));
        return;
      }
    }
  };

  const handleToggleDone = async (myAyurlyContentId, event) => {
    if (event) event.stopPropagation();
    setDashboardContent(currentContent => {
      const newContent = JSON.parse(JSON.stringify(currentContent));
      Object.keys(newContent).forEach(flowKey => {
        if (Array.isArray(newContent[flowKey])) {
          const itemIndex = newContent[flowKey].findIndex(item => item.myAyurlyContentId === myAyurlyContentId);
          if (itemIndex > -1) {
            newContent[flowKey][itemIndex].isDone = !newContent[flowKey][itemIndex].isDone;
          }
        }
      });
      return newContent;
    });

    try {
      await myAyurlyService.toggleDoneStatus(myAyurlyContentId);
    } catch (error) {
      console.error("Fehler beim Umschalten des Status:", error);
      myAyurlyService.getDashboardContent(selectedDate).then(setDashboardContent);
    }
  };

  const handleLikeToggle = async (item, event) => {
    if (event) event.stopPropagation();
    setLikingId(item.contentItemId);

    let likeService, likeMethod, unlikeMethod;

    switch (item.contentType) {
      case 'RECIPE':
        likeService = recipeService; likeMethod = 'likeRecipe'; unlikeMethod = 'unlikeRecipe'; break;
      case 'YOGA_EXERCISE':
        likeService = yogaExerciseService; likeMethod = 'likeYogaExercise'; unlikeMethod = 'unlikeYogaExercise'; break;
      case 'MICROHABIT':
        likeService = microhabitService; likeMethod = 'likeMicrohabit'; unlikeMethod = 'unlikeMicrohabit'; break;
      default:
        console.error("Unbekannter Content-Typ für Like-Aktion:", item.contentType); return;
    }

    try {
      const updatedItem = await (item.likedByCurrentUser
        ? likeService[unlikeMethod](item.contentItemId)
        : likeService[likeMethod](item.contentItemId));

      setDashboardContent(currentContent => {
        const newContent = JSON.parse(JSON.stringify(currentContent));
        Object.keys(newContent).forEach(flowKey => {
          if (Array.isArray(newContent[flowKey])) {
            const itemIndex = newContent[flowKey].findIndex(i => i.contentItemId === item.contentItemId);
            if (itemIndex > -1) {
              newContent[flowKey][itemIndex].likeCount = updatedItem.likeCount;
              newContent[flowKey][itemIndex].likedByCurrentUser = updatedItem.likedByCurrentUser;
            }
          }
        });
        return newContent;
      });

    } catch (error) {
      console.error("Fehler bei der Like-Aktion:", error);
    } finally {
      setLikingId(null);
    }
  };

  const isToggleDisabled = (item) => {
    const today = getLocalDateString(new Date());
    if (selectedDate > today) return true;
    if (status === 'loading' || status === 'generating' || !item) return true;

    return false;
  };

  const sortDashboardItems = (items) => {
    if (!items) return [];
    return [...items].sort((a, b) => {
      const isAMainItem = a.contentType === 'RECIPE' || a.contentType === 'YOGA_EXERCISE';
      const isBMainItem = b.contentType === 'RECIPE' || b.contentType === 'YOGA_EXERCISE';

      if (isAMainItem && !isBMainItem) return 1;
      if (!isAMainItem && isBMainItem) return -1;
      return 0;
    });
  };

  const renderDashboardItem = (item) => {
    const props = {
      item,
      handleToggleDone,
      isToggleDisabled,
      handleLikeToggle,
      likingId
    };

    switch (item.contentType) {
      case 'RECIPE':
        return <RecipePreviewCard key={item.myAyurlyContentId} {...props} />;
      case 'YOGA_EXERCISE':
        return <YogaPreviewCard key={item.myAyurlyContentId} {...props} />;
      case 'MICROHABIT':
        return <MicrohabitPreview key={item.myAyurlyContentId} {...props} />;
      default:
        return null;
    }
  };

  return (
    <>
      <div className={styles.myAyurlyContainer}>
        <section className={styles.topSection}>
          <div className={styles.profileAndDosha}>
            <div className={styles.doshaCard}>
              <div className={styles.doshaIcon}><span>{currentDosha.icon}</span></div>
              <p className={styles.doshaName}>{capitalizedDosha}</p>
              <p className={styles.doshaDescription}>{currentDosha.description}</p>
              <Link to="/dosha-test" className={styles.redoTestLink}>
                {doshaType ? 'Test wiederholen' : 'Test machen'}
              </Link>
            </div>
            <div className={styles.profileCard}>
              <img src="/img/account/profile.png" alt="Profil Icon" className={styles.profileImage} />
              <div className={styles.profileWrapper}>
                <div className={styles.profileContent}>
                  <div className={styles.name}>
                    <h2>{userProfile?.firstName || 'Dein'}</h2>
                    <h2>{userProfile?.lastName || 'Name'}</h2>
                  </div>
                  <div className={styles.userInfo}><FaUser /><p>{userProfile?.username || 'dein_username'}</p></div>
                  <div className={styles.userInfo}><FaEnvelope /><p>{userProfile?.email || 'deine@email.com'}</p></div>
                </div>
                <div className={styles.profileContent}>
                  <div className={styles.settings} onClick={handleOpenAccountManagement} title="Keycloak Account-Einstellungen"><FaCog /><span>Profil bearbeiten</span></div>
                  <div className={styles.settings} onClick={() => setIsPreferencesModalOpen(true)} title="Anzeige-Präferenzen"><FaTasks /><span>Präferenzen</span></div>
                  <button className={styles.logoutButton} onClick={logout}><FaSignOutAlt /> Logout</button>
                </div>
              </div>
            </div>
          </div>
        </section>
        <h2 className={styles.spacer}>MyAyurly Dashboard</h2>
        <Calendar 
                onDateSelect={handleDateSelect} 
                selectedDate={new Date(selectedDate)} 
                monthlyProgress={monthlyProgress}
                onMonthChange={setCalendarViewDate}
            />
        <div className={styles.statusContainer}>
          {status === 'error' && (
            <div className={`${styles.statusMessage} ${styles.errorMessage}`}>
              <FaExclamationTriangle />
              <span>Leider können aktuell keine Inhalte geladen werden.</span>
            </div>
          )}
        </div>
        <section className={styles.dashboard}>
          <div className={styles.row}>
            <div className={`${styles.routineCard} ${!userProfile?.showMorningFlow ? styles.disabledCard : ''}`} onClick={() => userProfile?.showMorningFlow && openModal('MORNING_FLOW', '🌞 MorningFlow', dashboardContent?.morningFlow)}>
              <h4 className={styles.cardTitle}>🌞 MorningFlow {(reshufflingTiles.includes('MORNING_FLOW') || (status === 'generating')) && <span className={styles.loader}></span>}</h4>
              <div className={styles.cardContent}>
                {sortDashboardItems(dashboardContent?.morningFlow).map(renderDashboardItem)}
              </div>
            </div>
            <div className={`${styles.routineCard} ${!userProfile?.showEveningFlow ? styles.disabledCard : ''}`} onClick={() => userProfile?.showEveningFlow && openModal('EVENING_FLOW', '🌙 EveningFlow', dashboardContent?.eveningFlow)}>
              <h4 className={styles.cardTitle}>🌙 EveningFlow {(reshufflingTiles.includes('EVENING_FLOW') || (status === 'generating')) && <span className={styles.loader}></span>}</h4>
              <div className={styles.cardContent}>
                {sortDashboardItems(dashboardContent?.eveningFlow).map(renderDashboardItem)}
              </div>
            </div>
            <div className={`${styles.routineCard} ${!userProfile?.showRestCycle ? styles.disabledCard : ''}`} onClick={() => userProfile?.showRestCycle && openModal('REST_CYCLE', '💤 RestCycle', dashboardContent?.restCycle)}>
              <h4 className={styles.cardTitle}>💤 RestCycle {(reshufflingTiles.includes('REST_CYCLE') || (status === 'generating')) && <span className={styles.loader}></span>}</h4>
              <div className={styles.cardContent}>
                {sortDashboardItems(dashboardContent?.restCycle).map(renderDashboardItem)}
              </div>
            </div>
          </div>
          <div className={styles.row}>
            <div className={`${styles.routineCard} ${!userProfile?.showZenMove ? styles.disabledCard : ''}`} onClick={() => userProfile?.showZenMove && openModal('ZEN_MOVE', '🧘‍♀️ ZenMove', dashboardContent?.zenMove)}>
              <h4 className={styles.cardTitle}>🧘‍♀️ ZenMove {(reshufflingTiles.includes('ZEN_MOVE') || (status === 'generating')) && <span className={styles.loader}></span>}</h4>
              <div className={styles.cardContent}>
                {sortDashboardItems(dashboardContent?.zenMove).map(renderDashboardItem)}
              </div>
            </div>
            <div className={`${styles.routineCard} ${!userProfile?.showNourishCycle ? styles.disabledCard : ''}`} onClick={() => userProfile?.showNourishCycle && openModal('NOURISH_CYCLE', '🍽️ NourishCycle', dashboardContent?.nourishCycle)}>
              <h4 className={styles.cardTitle}>🍽️ NourishCycle {(reshufflingTiles.includes('NOURISH_CYCLE') || (status === 'generating')) && <span className={styles.loader}></span>}</h4>
              <div className={styles.cardContent}>
                {sortDashboardItems(dashboardContent?.nourishCycle).map(renderDashboardItem)}
              </div>
            </div>
          </div>
        </section>
          <HistoryGraph />
      </div>
          

      {activeModalData && (
        <RoutineDetailModal
          show={!!activeModalData}
          onClose={closeModal}
          modalData={activeModalData}
          onReshuffle={handleReshuffle}
          handleToggleDoneInModal={handleToggleDone}
          handleLikeToggleInModal={handleLikeToggle}
          likingId={likingId}
          selectedDate={selectedDate}
          isToggleDisabled={isToggleDisabled}
        />
      )}
      <PreferencesModal
        show={isPreferencesModalOpen}
        onClose={() => setIsPreferencesModalOpen(false)} />
    </>
  );
};

const MicrohabitPreview = ({ item, handleToggleDone, isToggleDisabled }) => (
  <div className={styles.contentItem} onClick={(e) => e.stopPropagation()}>
    <input
      type="checkbox"
      id={`item-preview-${item.myAyurlyContentId}`}
      className={styles.checkbox}
      checked={item.isDone || false}
      onChange={() => handleToggleDone(item.myAyurlyContentId)}
      disabled={isToggleDisabled(item)}
    />
    <label htmlFor={`item-preview-${item.myAyurlyContentId}`} className={styles.itemTitle}>
      {item.title}
    </label>
  </div>
);

const RecipePreviewCard = ({ item, handleToggleDone, isToggleDisabled, handleLikeToggle, likingId }) => (
  <div className={styles.cardItemWrapper} onClick={(e) => e.stopPropagation()}>
    <input
      type="checkbox"
      id={`item-${item.myAyurlyContentId}`}
      className={styles.checkbox}
      checked={item.isDone || false}
      onChange={() => handleToggleDone(item.myAyurlyContentId)}
      disabled={isToggleDisabled(item)}
    />
    <FullRecipeCard
      item={item}
      onLikeToggle={handleLikeToggle}
      likingId={likingId}
    />
  </div>
);

const YogaPreviewCard = ({ item, handleToggleDone, isToggleDisabled, handleLikeToggle, likingId }) => (
  <div className={styles.cardItemWrapper} onClick={(e) => e.stopPropagation()}>
    <input
      type="checkbox"
      id={`item-${item.myAyurlyContentId}`}
      className={styles.checkbox}
      checked={item.isDone || false}
      onChange={() => handleToggleDone(item.myAyurlyContentId)}
      disabled={isToggleDisabled(item)}
    />
    <FullYogaCard
      item={item}
      onLikeToggle={handleLikeToggle}
      likingId={likingId}
    />
  </div>
);

export default MyAyurlyPage;