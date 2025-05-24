import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './AccountPage.module.css'; 
import { useUser } from '../contexts/UserContext';

const AccountPage = () => {
  const { doshaType: contextDoshaType } = useUser(); 
  const [userDosha, setUserDosha] = useState('Unbekannt'); 
  const [doshaDescription, setDoshaDescription] = useState('');
  const [doshaIcon, setDoshaIcon] = useState('');
  const [routineTipp, setRoutineTipp] = useState('');
  const [checkboxes, setCheckboxes] = useState([]);
  const [progressPercent, setProgressPercent] = useState(0);
  const [progressSuccessMessage, setProgressSuccessMessage] = useState('');
  const [isInitialDoshaKnown, setIsInitialDoshaKnown] = useState(false);
  

  useEffect(() => {
    const currentEffectiveDosha = contextDoshaType || null; 
    
    if (contextDoshaType && contextDoshaType !== "Unbekannt") {
        setIsInitialDoshaKnown(true);
    } else {
        setIsInitialDoshaKnown(false);
    }

    const capitalizedDosha = currentEffectiveDosha 
        ? currentEffectiveDosha.charAt(0).toUpperCase() + currentEffectiveDosha.slice(1).toLowerCase()
        : "Unbekannt"; // Fallback direkt hier
    setUserDosha(capitalizedDosha);

    let description = "";
    let icon = "";
    let tipp = "";
    let currentRoutinesConfig = []; 

    switch (capitalizedDosha) {
      case "Vata":
        description = "kreativ, beweglich, aber manchmal unruhig.";
        icon = "🌀";
        tipp = "<strong>Vata-Ausgleich:</strong> Beginne den Tag mit warmem Wasser, einer ruhigen Meditation und einem stabilen Tagesablauf.";
        currentRoutinesConfig = [
          { id: 'vata1', label: 'Warmes Wasser am Morgen' },
          { id: 'vata2', label: 'Ölziehen mit Sesamöl' },
          { id: 'vata3', label: 'Beruhigende Meditation' },
          { id: 'vata4', label: 'Leicht verdauliches Frühstück' },
          { id: 'vata5', label: 'Wärmende Gewürztees' },
          { id: 'vata6', label: 'Regelmäßiger Tagesablauf' },
        ];
        break;
      case "Kapha":
        description = "strukturiert, ruhig, kann schwer in Gang kommen.";
        icon = "🌱";
        tipp = "<strong>Kapha-Ausgleich:</strong> Starte aktiv in den Tag – mit Trockenbürsten, Bewegung und anregendem Frühstück.";
        currentRoutinesConfig = [
          { id: 'kapha1', label: 'Frühes Aufstehen' },
          { id: 'kapha2', label: 'Trockenbürsten' },
          { id: 'kapha3', label: 'Aktivierende Bewegung' },
          { id: 'kapha4', label: 'Leichte, warme Mahlzeiten' },
          { id: 'kapha5', label: 'Atemübungen zur Belebung' },
          { id: 'kapha6', label: 'Vermeidung von schweren Speisen' },
        ];
        break;
      case "Pitta":
        description = "zielstrebig, energiegeladen, manchmal hitzköpfig.";
        icon = "🔥";
        tipp = "<strong>Pitta-Ausgleich:</strong> Starte deinen Tag mit einer kühlenden Atemübung wie <em>Sheetali Pranayama</em> und trinke warmes Wasser mit frischer Minze.";
        currentRoutinesConfig = [
          { id: 'pitta1', label: 'Kühlendes Wasser mit Minze' },
          { id: 'pitta2', label: 'Sheetali-Pranayama' },
          { id: 'pitta3', label: 'Spaziergang im Schatten' },
          { id: 'pitta4', label: 'Kühle Mahlzeiten bevorzugen' },
          { id: 'pitta5', label: 'Entspannende Musik hören' },
          { id: 'pitta6', label: 'Vermeidung von scharfen Gewürzen' },
        ];
        break;
      default: 
        description = "noch nicht bestimmt. Mache den Dosha-Test!";
        icon = "❔";
        tipp = "Mache unseren Dosha-Test, um personalisierte Tipps zu erhalten.";
        currentRoutinesConfig = [];
        setUserDosha("Unbekannt"); 
        break;
    }
    setDoshaDescription(description);
    setDoshaIcon(icon);
    setRoutineTipp(tipp);

    // Lade den Speicherstatus der Checkboxen basierend auf dem *effektiven* userDosha
    // Stelle sicher, dass `capitalizedDosha` hier den korrekten Wert hat (Vata, Pitta, Kapha, oder der Fallback)
    const storageRelevantDosha = (capitalizedDosha === "Unbekannt" || !currentRoutinesConfig.length) ? "" : capitalizedDosha;

    if (storageRelevantDosha) {
        const initialCheckboxes = currentRoutinesConfig.map((routine, index) => {
            const storageKey = `routine-${storageRelevantDosha}-${index}`;
            const savedState = localStorage.getItem(storageKey);
            return { ...routine, checked: savedState === "true" };
        });
        setCheckboxes(initialCheckboxes);
    } else {
        setCheckboxes([]); 
    }


  }, [contextDoshaType]); 

  useEffect(() => {
    if (checkboxes.length === 0) {
      setProgressPercent(0);
      setProgressSuccessMessage('');
      return;
    }
    const checkedCount = checkboxes.filter(cb => cb.checked).length;
    const totalCount = checkboxes.length;
    const percent = totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0;
    setProgressPercent(percent);
    setProgressSuccessMessage(percent === 100 ? "Super gemacht! Du hast heute alle Routinen geschafft 🎉" : '');
  }, [checkboxes]);

  const handleCheckboxChange = (index) => {
    const updatedCheckboxes = checkboxes.map((cb, i) =>
      i === index ? { ...cb, checked: !cb.checked } : cb
    );
    setCheckboxes(updatedCheckboxes);
    if (userDosha && userDosha !== "Unbekannt") {
        localStorage.setItem(`routine-${userDosha}-${index}`, updatedCheckboxes[index].checked.toString());
    }
  };

  const getDoshaSpecificRoutines = () => {
    if (!userDosha || userDosha === "Unbekannt" || checkboxes.length === 0) {
        return null;
    }
    return (
      <div className={styles.routineCard} data-dosha={userDosha}>
        <h3>{doshaIcon} {userDosha}</h3>
        {checkboxes.map((routine, index) => (
          <label key={routine.id} className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={routine.checked}
              onChange={() => handleCheckboxChange(index)}
            />
            {routine.label}
          </label>
        ))}
      </div>
    );
  };

  return (
    <div className={styles.accountPageContainer}>
      <section className={styles.doshaStatus}>
        <h2>Dein aktueller Dosha-Typ</h2>
        <div className={styles.doshaStatusCard}>
          {doshaIcon && <span className={styles.doshaIcon}>{doshaIcon}</span>}
          <div>
            <p><strong>{userDosha}</strong> – {doshaDescription}</p>
            <Link to="/dosha-test" className={styles.retakeLink}>
              {isInitialDoshaKnown ? "Dosha-Test erneut machen" : "Dosha-Test machen"}
            </Link>
          </div>
        </div>
      </section>

      {userDosha !== "Unbekannt" && (
        <section className={styles.tagesroutineVorschlag}>
            <h2>Dein Tagesroutine-Tipp</h2>
            <div className={styles.routineCard}>
                <p dangerouslySetInnerHTML={{ __html: routineTipp }}></p>
            </div>
        </section>
      )}

      {userDosha !== "Unbekannt" && checkboxes.length > 0 && (
        <section>
            <div className={styles.dashboardContainer}>
            <div className={styles.progressSection}>
                <h3 style={{ textAlign: 'center' }}>Tagesfortschritt</h3>
                <div className={styles.progressContainer}>
                <div className={styles.progressBar} style={{ width: `${progressPercent}%` }}>
                    {progressPercent}%
                </div>
                </div>
                {progressSuccessMessage && <p className={styles.progressSuccess} >{progressSuccessMessage}</p>}
            </div>

            <h2 style={{ textAlign: 'center', marginTop: '40px' }}>
                Deine ayurvedischen Routinen
            </h2>
            <section className={styles.routineGrid}>
                {getDoshaSpecificRoutines()}
            </section>
            </div>
        </section>
      )}
      
      {userDosha === "Unbekannt" && (
           <section className={styles.tagesroutineVorschlag} style={{ marginTop: '30px' }}> 
             <div className={styles.routineCard}>
                <p>Mache den <Link to="/dosha-test" className={styles.callToActionLink}>Dosha-Test</Link>, um deine personalisierten Routinen und Tipps zu sehen!</p>
             </div>
           </section>
      )}
    </div>
  );
};

export default AccountPage;