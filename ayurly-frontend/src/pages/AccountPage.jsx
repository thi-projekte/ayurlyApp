// src/pages/AccountPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './AccountPage.module.css'; // Geänderter Import

const AccountPage = () => {
  const [userDosha, setUserDosha] = useState('Pitta');
  const [doshaDescription, setDoshaDescription] = useState('');
  const [doshaIcon, setDoshaIcon] = useState('');
  const [routineTipp, setRoutineTipp] = useState('');
  const [checkboxes, setCheckboxes] = useState([]);
  const [progressPercent, setProgressPercent] = useState(0);
  const [progressSuccessMessage, setProgressSuccessMessage] = useState('');

  useEffect(() => {
    const storedDosha = localStorage.getItem("selectedDosha") || "Pitta";
    const capitalizedDosha = storedDosha.charAt(0).toUpperCase() + storedDosha.slice(1).toLowerCase();
    setUserDosha(capitalizedDosha);

    let description = "";
    let icon = "";
    let tipp = "";
    let currentRoutinesConfig = []; // Renamed to avoid conflict

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
      default: // Pitta
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
    }
    setDoshaDescription(description);
    setDoshaIcon(icon);
    setRoutineTipp(tipp);

    const initialCheckboxes = currentRoutinesConfig.map((routine, index) => {
      const savedState = localStorage.getItem(`routine-${capitalizedDosha}-${index}`);
      return { ...routine, checked: savedState === "true" };
    });
    setCheckboxes(initialCheckboxes);
  }, []);

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
    localStorage.setItem(`routine-${userDosha}-${index}`, updatedCheckboxes[index].checked.toString());
  };

  const getDoshaSpecificRoutines = () => {
    if (!userDosha || checkboxes.length === 0) return null;
    // Hier verwenden wir Klassen aus styles-Objekt
    return (
      <div className={styles.routineCard} data-dosha={userDosha}>
        <h3>{doshaIcon} {userDosha}</h3>
        {checkboxes.map((routine, index) => (
          <label key={routine.id} className={styles.checkboxLabel}> {/* Beispiel für eine neue spezifische Klasse */}
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
    // Verwende Klassennamen aus dem importierten 'styles'-Objekt
    // Bindeestrich-Klassen werden zu CamelCase (styles.doshaStatus) oder mit Klammern (styles['dosha-status'])
    <div className={styles.accountPageContainer}>
      <section className={styles.doshaStatus}>
        <h2>Dein aktueller Dosha-Typ</h2>
        <div className={styles.doshaStatusCard}>
          {doshaIcon && <span className={styles.doshaIcon}>{doshaIcon}</span>}
          <div>
            <p><strong>{userDosha}</strong> – {doshaDescription}</p>
            <Link to="/dosha-test" className={styles.retakeLink}>Dosha-Test erneut machen</Link>
          </div>
        </div>
      </section>

      <section className={styles.tagesroutineVorschlag}>
        <h2>Dein Tagesroutine-Tipp</h2>
        <div className={styles.routineCard}>
            <p dangerouslySetInnerHTML={{ __html: routineTipp }}></p>
        </div>
      </section>

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
          {/* <p className={styles.doshaDisplay} style={{ textAlign: 'center', color: '#3c7f7f', fontWeight: 500 }}>
             Wird nicht mehr direkt benötigt
          </p> */}
          <section className={styles.routineGrid}>
            {getDoshaSpecificRoutines()}
          </section>
        </div>
      </section>
    </div>
  );
};

export default AccountPage;