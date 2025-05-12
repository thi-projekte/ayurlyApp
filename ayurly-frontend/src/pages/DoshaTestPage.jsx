// src/pages/DoshaTestPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Um nach dem Test weiterzuleiten
import '../styles/doshaTestStyles.css'; // Korrekter Pfad

const questions = [
    {
      question: "Wie ist deine Energie über den Tag?",
      answers: { vata: "Schwankt stark", pitta: "Stabil mit Mittagshoch ", kapha: "Langsam, aber konstant " }
    },
    {
      question: "Wie ist deine Verdauung?",
      answers: { vata: "Unregelmäßig, Blähungen ", pitta: "Stark, manchmal Übersäuerung ", kapha: "Langsam, schweres Gefühl " } // Leerzeichen am Ende korrigiert
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
  const [doshaCounts, setDoshaCounts] = useState({ vata: 0, pitta: 0, kapha: 0 });
  const [showResult, setShowResult] = useState(false);
  const [resultText, setResultText] = useState('');
  const navigate = useNavigate();

  const progressPercent = Math.round(((currentQuestionIndex) / questions.length) * 100); // currentQuestionIndex statt currentQuestion

  const handleAnswer = (doshaType) => {
    setDoshaCounts(prevCounts => ({
      ...prevCounts,
      [doshaType]: prevCounts[doshaType] + 1,
    }));

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
    } else {
      calculateResult();
      setShowResult(true);
    }
  };

  const calculateResult = () => {
    // Die Logik aus showResult im Originalskript
    // Finde den Dosha-Typ mit den meisten Punkten
    const maxDosha = Object.entries(doshaCounts).reduce((a, b) => (a[1] > b[1] ? a : b))[0];
    let text = "Du bist hauptsächlich: ";
    switch (maxDosha) {
      case "vata":
        text += "🌀 Vata – kreativ, beweglich, aber manchmal unruhig.";
        break;
      case "pitta":
        text += "🔥 Pitta – zielstrebig, stark, aber schnell reizbar.";
        break;
      case "kapha":
        text += "🌱 Kapha – stabil, liebevoll, aber neigt zur Trägheit.";
        break;
      default:
        text = "Ergebnis konnte nicht ermittelt werden.";
    }
    setResultText(text);
    localStorage.setItem("selectedDosha", maxDosha); // Speichere Ergebnis für Account-Seite
  };

  const restartTest = () => {
    setCurrentQuestionIndex(0);
    setDoshaCounts({ vata: 0, pitta: 0, kapha: 0 });
    setShowResult(false);
    setResultText('');
    // Optional: localStorage.removeItem("selectedDosha");
  };

  if (showResult) {
    return (
      <div className="dosha-test-page-container content-wrapper"> {/* content-wrapper für Zentrierung etc. */}
         <div className="intro-box"> {/* Wiederverwendung der Intro-Box für Konsistenz */}
            <h2>🧘‍♀️ Dein Ergebnis</h2>
        </div>
        <div className="quiz-wrapper"> {/* Wiederverwendung des quiz-wrapper für Styling */}
            <div className="gamification-card" id="result-container"> {/* id für styling beibehalten */}
            <h2>Dein Ergebnis:</h2>
            <p id="result-text">{resultText}</p> {/* id für styling beibehalten */}
            <button className="neu-starten-button" onClick={restartTest}>
                Neu starten
            </button>
            <button className="neu-starten-button" onClick={() => navigate('/account')} style={{marginLeft: '10px'}}>
                Zum Account
            </button>
            </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="dosha-test-page-container content-wrapper">
      <div className="intro-box">
        <h2>🧘‍♀️ Finde dein inneres Gleichgewicht</h2>
        <p>
          Beantworte ein paar kurze Fragen, um herauszufinden, welcher Dosha-Typ
          dich am besten beschreibt. So kannst du gezielt Routinen und
          Empfehlungen erhalten, die dich wirklich unterstützen.
        </p>
      </div>

      <div className="quiz-wrapper">
        <div className="gamification-card" id="quiz-container">
          <div className="level-info">
            <span className="level-badge">Dosha-Test</span>
            {/* <span className="xp" id="progress-label"></span>  Wird nicht direkt im Original verwendet */}
          </div>

          <div className="progress-container">
            <div className="progress-bar" id="progress-bar" style={{ width: `${progressPercent}%` }}>
              {progressPercent}%
            </div>
          </div>

          <div id="question-text">
            Frage {currentQuestionIndex + 1}: {currentQuestion.question}
          </div>
          <div id="answer-buttons">
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