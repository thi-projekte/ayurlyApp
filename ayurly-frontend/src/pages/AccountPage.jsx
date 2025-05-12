import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Für den Link zum Dosha-Test
import '../styles/accountStyles.css'; // Korrekter Pfad von pages/ zu styles/

const AccountPage = () => {
  const [userDosha, setUserDosha] = useState('Pitta'); // Default, falls nichts im localStorage ist
  const [doshaDescription, setDoshaDescription] = useState('');
  const [doshaIcon, setDoshaIcon] = useState('');
  const [routineTipp, setRoutineTipp] = useState('');
  const [checkboxes, setCheckboxes] = useState([]); // Wird dynamisch basierend auf Dosha gefüllt
  const [progressPercent, setProgressPercent] = useState(0);
  const [progressSuccessMessage, setProgressSuccessMessage] = useState('');

  // Lade und setze Dosha-spezifische Daten
  useEffect(() => {
    const storedDosha = localStorage.getItem("selectedDosha") || "Pitta";
    const capitalizedDosha = storedDosha.charAt(0).toUpperCase() + storedDosha.slice(1).toLowerCase();
    setUserDosha(capitalizedDosha);

    let description = "";
    let icon = "";
    let tipp = "";
    let currentRoutines = [];

    switch (capitalizedDosha) {
      case "Vata":
        description = "kreativ, beweglich, aber manchmal unruhig.";
        icon = "🌀";
        tipp = "<strong>Vata-Ausgleich:</strong> Beginne den Tag mit warmem Wasser, einer ruhigen Meditation und einem stabilen Tagesablauf.";
        currentRoutines = [
          { id: 'vata1', label: 'Warmes Wasser am Morgen', checked: false },
          { id: 'vata2', label: 'Ölziehen mit Sesamöl', checked: false },
          { id: 'vata3', label: 'Beruhigende Meditation', checked: false },
          { id: 'vata4', label: 'Leicht verdauliches Frühstück', checked: false },
          { id: 'vata5', label: 'Wärmende Gewürztees', checked: false },
          { id: 'vata6', label: 'Regelmäßiger Tagesablauf', checked: false },
        ];
        break;
      case "Kapha":
        description = "strukturiert, ruhig, kann schwer in Gang kommen.";
        icon = "🌱";
        tipp = "<strong>Kapha-Ausgleich:</strong> Starte aktiv in den Tag – mit Trockenbürsten, Bewegung und anregendem Frühstück.";
        currentRoutines = [
          { id: 'kapha1', label: 'Frühes Aufstehen', checked: false },
          { id: 'kapha2', label: 'Trockenbürsten', checked: false },
          { id: 'kapha3', label: 'Aktivierende Bewegung', checked: false },
          { id: 'kapha4', label: 'Leichte, warme Mahlzeiten', checked: false },
          { id: 'kapha5', label: 'Atemübungen zur Belebung', checked: false },
          { id: 'kapha6', label: 'Vermeidung von schweren Speisen', checked: false },
        ];
        break;
      default: // Pitta
        description = "zielstrebig, energiegeladen, manchmal hitzköpfig.";
        icon = "🔥";
        tipp = "<strong>Pitta-Ausgleich:</strong> Starte deinen Tag mit einer kühlenden Atemübung wie <em>Sheetali Pranayama</em> und trinke warmes Wasser mit frischer Minze.";
        currentRoutines = [
          { id: 'pitta1', label: 'Kühlendes Wasser mit Minze', checked: false },
          { id: 'pitta2', label: 'Sheetali-Pranayama', checked: false },
          { id: 'pitta3', label: 'Spaziergang im Schatten', checked: false },
          { id: 'pitta4', label: 'Kühle Mahlzeiten bevorzugen', checked: false },
          { id: 'pitta5', label: 'Entspannende Musik hören', checked: false },
          { id: 'pitta6', label: 'Vermeidung von scharfen Gewürzen', checked: false },
        ];
        break;
    }
    setDoshaDescription(description);
    setDoshaIcon(icon);
    setRoutineTipp(tipp);

    // Lade Checkbox-Status aus localStorage
    const initialCheckboxes = currentRoutines.map((routine, index) => {
      const savedState = localStorage.getItem(`routine-${capitalizedDosha}-${index}`);
      return { ...routine, checked: savedState === "true" };
    });
    setCheckboxes(initialCheckboxes);

  }, []); // Einmal beim Mounten ausführen

  // Aktualisiere Fortschritt, wenn sich Checkboxen ändern
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

    if (percent === 100) {
      setProgressSuccessMessage("Super gemacht! Du hast heute alle Routinen geschafft 🎉");
    } else {
      setProgressSuccessMessage('');
    }
  }, [checkboxes]);

  const handleCheckboxChange = (index) => {
    const updatedCheckboxes = checkboxes.map((cb, i) =>
      i === index ? { ...cb, checked: !cb.checked } : cb
    );
    setCheckboxes(updatedCheckboxes);
    // Speichere in localStorage
    localStorage.setItem(`routine-${userDosha}-${index}`, updatedCheckboxes[index].checked.toString());
  };

  const getDoshaSpecificRoutines = () => {
    // Diese Funktion gibt die JSX für die spezifischen Routinen-Checkboxes zurück.
    // Sie wird jetzt durch den `checkboxes` State direkt im JSX gehandhabt.
    // Die `routine-card` div mit data-dosha wird jetzt durch bedingtes Rendern ersetzt,
    // oder wir zeigen einfach immer die Routinen für den `userDosha`.

    if (!userDosha || checkboxes.length === 0) return null;

    return (
      <div className="routine-card" data-dosha={userDosha}> {/* data-dosha für Styling beibehalten, falls genutzt */}
        <h3>{doshaIcon} {userDosha}</h3>
        {checkboxes.map((routine, index) => (
          <label key={routine.id}>
            <input
              type="checkbox"
              checked={routine.checked}
              onChange={() => handleCheckboxChange(index)}
            />{' '}
            {routine.label}
          </label>
        ))}
      </div>
    );
  };


  return (
    <div className="account-page-container"> {/* Eigene Klasse für die Seite */}
      <section className="dosha-status">
        <h2>Dein aktueller Dosha-Typ</h2>
        <div className="dosha-status-card">
          {doshaIcon && <span className="dosha-icon">{doshaIcon}</span>}
          <div>
            <p><strong>{userDosha}</strong> – {doshaDescription}</p>
            <Link to="/dosha-test" className="retake-link">Dosha-Test erneut machen</Link>
          </div>
        </div>
      </section>

      <section className="tagesroutine-vorschlag">
        <h2>Dein Tagesroutine-Tipp</h2>
        {/* Original HTML hatte hier eine .routine-card, die dynamisch gefüllt wurde.
            Der Inhalt kommt jetzt aus dem state `routineTipp`.
            Die Klasse .routine-card wird hier wiederverwendet für Konsistenz. */}
        <div className="routine-card">
            {/* dangerouslySetInnerHTML wird verwendet, da dein Tipp HTML-Tags wie <strong> enthält.
                Sei vorsichtig damit, wenn der Inhalt von externen Quellen kommt (Security-Risiko).
                Da dieser Tipp von uns intern generiert wird, ist es hier vertretbar. */}
            <p dangerouslySetInnerHTML={{ __html: routineTipp }}></p>
            {/* Link zu einer detaillierteren Routinen-Seite, falls vorhanden.
                Deine HTML hatte "Mehr Routinen ansehen" mit href="routine.html".
                Wir können das für später vorsehen. */}
            {/* <Link to="/routinen-detail" className="retake-link">Mehr Routinen ansehen</Link> */}
        </div>
      </section>

      <section>
        <div className="dashboard-container">
          <div className="progress-section">
            <h3 style={{ textAlign: 'center' }}>Tagesfortschritt</h3>
            <div className="progress-container">
              <div className="progress-bar" id="progress-bar" style={{ width: `${progressPercent}%` }}>
                {progressPercent}%
              </div>
            </div>
            {progressSuccessMessage && <p id="progress-success" style={{ textAlign: 'center', marginTop: '10px', color: 'green' }}>{progressSuccessMessage}</p>}
          </div>

          <h2 style={{ textAlign: 'center', marginTop: '40px' }}>
            Deine ayurvedischen Routinen
          </h2>
          <p id="dosha-display" style={{ textAlign: 'center', color: '#3c7f7f', fontWeight: 500 }}>
            {/* Wird nicht mehr direkt benötigt, da der Dosha-Typ oben angezeigt wird */}
          </p>
          <section className="routine-grid">
            {/* Die Routine-Karten werden jetzt dynamisch basierend auf dem userDosha gerendert */}
            {getDoshaSpecificRoutines()}
          </section>
        </div>
      </section>
    </div>
  );
};

export default AccountPage;