// src/pages/DoshaTestPage.jsx
import React, { useState } from 'react'; // useEffect nicht mehr benötigt für diese Logik
import { useNavigate } from 'react-router-dom';
import styles from './DoshaTestPage.module.css';
import { useUser } from '../contexts/UserContext';

const questions = [
    {
      question: "Wie ist deine Energie über den Tag?",
      answers: { vata: "Schwankt stark", pitta: "Stabil mit Mittagshoch ", kapha: "Langsam, aber konstant " }
    },
    {
      question: "Wie ist deine Verdauung?",
      answers: { vata: "Unregelmäßig, Blähungen ", pitta: "Stark, manchmal Übersäuerung ", kapha: "Langsam, schweres Gefühl " }
    },
    {
      question: "Wie reagierst du auf Stress?",
      answers: { vata: "Ängstlich, unruhig ", pitta: "Wütend, gereizt ", kapha: "Zurückgezogen, ruhig " }
    },
    {
      question: "Wie ist dein Schlafverhalten?",
      answers: { vata: "Leicht, oft unterbrochen", pitta: "Durchschnittlich, oft mit Träumen", kapha: "Tief und lang" }
    },
    {
      question: "Wie ist deine körperliche Konstitution?",
      answers: { vata: "Schlank, zierlich", pitta: "Mittel, athletisch", kapha: "Kräftig, stämmig" }
    },
    {
      question: "Wie ist deine Hautbeschaffenheit?",
      answers: { vata: "Trocken, rau", pitta: "Empfindlich, rötlich", kapha: "Weich, ölig" }
    },
    {
      question: "Wie gehst du mit Veränderungen um?",
      answers: { vata: "Unsicher, nervös", pitta: "Zielgerichtet, ehrgeizig", kapha: "Gelassen, manchmal träge" }
    },
    {
      question: "Wie ist dein Appetit?",
      answers: { vata: "Unregelmäßig, vergisst zu essen", pitta: "Stark, regelmäßig", kapha: "Eher gering, isst aus Gewohnheit" }
    },
    {
      question: "Wie ist dein Redeverhalten?",
      answers: { vata: "Schnell, sprunghaft", pitta: "Deutlich, überzeugend", kapha: "Langsam, bedacht" }
    },
    {
      question: "Wie reagierst du auf kaltes Wetter?",
      answers: { vata: "Empfindlich, friert leicht", pitta: "Erfrischend", kapha: "Erträgt es gut, wird träge" }
    },
    {
      question: "Wie gehst du mit Konflikten um?",
      answers: { vata: "Vermeidet sie, wird ängstlich", pitta: "Stellt sich ihnen direkt", kapha: "Zieht sich zurück, meidet Diskussionen" }
    },
    {
      question: "Wie ist dein Energielevel am Morgen?",
      answers: { vata: "Braucht Zeit zum Wachwerden", pitta: "Sofort wach und aktiv", kapha: "Schwerfällig, müde" }
    },
    {
      question: "Wie ist deine Denkweise?",
      answers: { vata: "Kreativ, sprunghaft", pitta: "Analytisch, scharf", kapha: "Beständig, langsam" }
    }
];

const DoshaTestPage = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [doshaCounts, setDoshaCounts] = useState(() => {
      // Sicherere Initialisierung
      if (questions.length === 0 || !questions[0]) return {};
      return Object.keys(questions[0].answers).reduce((acc, key) => ({ ...acc, [key]: 0 }), {});
  });
  const [showResult, setShowResult] = useState(false);
  const [resultText, setResultText] = useState('');
  const navigate = useNavigate();
  const { updateUserDosha } = useUser();

  const progressPercent = questions.length > 0 ? Math.round(((currentQuestionIndex) / questions.length) * 100) : 0;

  // Ergebnisberechnung ausgelagert
  const calculateAndSetResult = async (finalCounts) => {
      const sortedDoshas = Object.entries(finalCounts).sort(([, a], [, b]) => b - a);

      if (sortedDoshas.length === 0 || sortedDoshas[0][1] === 0) {
          setResultText("Fehler bei der Ergebnisermittlung. Bitte neu starten.");
          localStorage.removeItem("selectedDosha");
          return;
      }

      const maxDosha = sortedDoshas[0][0];
      let text = "Du bist hauptsächlich: ";
      switch (maxDosha) {
          case "vata": text += "🌀 Vata – kreativ, beweglich, aber manchmal unruhig."; break;
          case "pitta": text += "🔥 Pitta – zielstrebig, stark, aber schnell reizbar."; break;
          case "kapha": text += "🌱 Kapha – stabil, liebevoll, aber neigt zur Trägheit."; break;
          default: text = "Ergebnis konnte nicht ermittelt werden.";
      }
      setResultText(text);
      // Den ermittelten Dosha-Typ über den Context aktualisieren
      try {
        await updateUserDosha(maxDosha); // Ruft die Funktion aus dem UserContext auf
        console.log(`Dosha-Test: Ergebnis '${maxDosha}' an UserContext übergeben.`);
      } catch (error) {
        console.error("Dosha-Test: Fehler beim Aktualisieren des Dosha-Typs über Context:", error);
        // Hier könnte eine Fehlermeldung für den Benutzer angezeigt werden
      }
  };


  const handleAnswer = (doshaType) => {
    const currentCount = doshaCounts[doshaType] || 0;
    const updatedCounts = {
        ...doshaCounts,
        [doshaType]: currentCount + 1,
    };
    setDoshaCounts(updatedCounts);

    if (currentQuestionIndex < questions.length - 1) {
        // Nächste Frage
        setCurrentQuestionIndex(prevIndex => prevIndex + 1);
    } else {
        // Letzte Frage beantwortet
        calculateResult(updatedCounts); // Ergebnis berechnen

        // Ergebnisansicht nach kleiner Verzögerung aktivieren
        setTimeout(() => {
            setShowResult(true);
        }, 150);
    }
  };


  const restartTest = () => {
    setCurrentQuestionIndex(0);
    setDoshaCounts(questions[0] ? Object.keys(questions[0].answers).reduce((acc, key) => ({ ...acc, [key]: 0 }), {}) : {});
    setShowResult(false);
    setResultText('');
  };


  // ==================== JSX RENDERING ====================

  // Ergebnis-Ansicht
  if (showResult) {
    return (
      <div className={styles.contentWrapper}>
         <div className={styles.introBox}>
            <h2>🧘‍♀️ Dein Ergebnis</h2>
         </div>
         <div className={styles.quizWrapper}>
             <div className={styles.gamificationCard} id="result-container">
                 <h2>Dein Ergebnis:</h2>
                 <p className={styles.resultText} id="result-text">{resultText || 'Ergebnis wird geladen...'}</p>
                 <button className={styles.neuStartenButton} onClick={restartTest}>
                     Neu starten
                 </button>
                 <button className={styles.neuStartenButton} onClick={() => navigate('/account')} style={{marginLeft: '10px'}}>
                     Zum Account
                 </button>
             </div>
         </div>
      </div>
    );
  }

  // Fehlerbehandlung, falls keine Fragen geladen wurden
  if (questions.length === 0 || !questions[currentQuestionIndex]) {
      return <div className={styles.contentWrapper}>Fragen werden geladen oder Test ist nicht verfügbar.</div>;
  }

  // Aktuelle Frage holen
  const currentQuestion = questions[currentQuestionIndex];

  // Quiz-Ansicht
  return (
    <div className={styles.contentWrapper}>
      <div className={styles.introBox}>
        <h2>🧘‍♀️ Finde dein inneres Gleichgewicht</h2>
        <p>
          Beantworte ein paar kurze Fragen, um herauszufinden, welcher Dosha-Typ
          dich am besten beschreibt. So kannst du gezielt Routinen und
          Empfehlungen erhalten, die dich wirklich unterstützen.
        </p>
      </div>

      <div className={styles.quizWrapper}>
        <div className={styles.gamificationCard} id="quiz-container">
          <div className={styles.levelInfo}>
            <span className={styles.levelBadge}>Dosha-Test</span>
          </div>

          <div className={styles.progressContainer}>
            <div
                className={styles.progressBar}
                id="progress-bar"
                style={{ width: `${progressPercent}%` }}
            >
              {progressPercent}%
            </div>
          </div>

          <div className={styles.questionText} id="question-text">
            Frage {currentQuestionIndex + 1}: {currentQuestion.question}
          </div>
          <div className={styles.answerButtons} id="answer-buttons">
            {Object.entries(currentQuestion.answers).map(([doshaKey, answerText]) => (
              <button key={doshaKey} onClick={() => handleAnswer(doshaKey)}>
                {answerText}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoshaTestPage;