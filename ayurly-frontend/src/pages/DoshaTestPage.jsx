import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styles from './DoshaTestPage.module.css';
import { useUser } from '../contexts/UserContext';
import Modal from '../components/UI/Modal'; 
import TipsCarousel from '../components/UI/TipsCarousel';



const questions = [
  {
    question: "Wie ist deine Energie über den Tag?",
    answers: { Vata: "Schwankt stark", Pitta: "Stabil mit Mittagshoch ", Kapha: "Langsam, aber konstant " }
  },
  {
    question: "Wie ist deine Verdauung?",
    answers: { Vata: "Unregelmäßig bis Blähungen ", Pitta: "Stark bis manchmal Übersäuerung ", Kapha: "Langsam bis schweres Gefühl " }
  },
  {
    question: "Wie reagierst du auf Stress?",
    answers: { Vata: "Ängstlich bis unruhig ", Pitta: "Wütend bis gereizt ", Kapha: "Zurückgezogen bis ruhig " }
  },
  {
    question: "Wie ist dein Schlafverhalten?",
    answers: { Vata: "Leicht, oft unterbrochen", Pitta: "Durchschnittlich, oft mit Träumen", Kapha: "Tief und lang" }
  },
  {
    question: "Wie ist deine körperliche Konstitution?",
    answers: { Vata: "Schlank bis zierlich", Pitta: "Mittel bis athletisch", Kapha: "Kräftig bis stämmig" }
  },
  {
    question: "Wie ist deine Hautbeschaffenheit?",
    answers: { Vata: "Trocken bis rau", Pitta: "Empfindlich bis rötlich", Kapha: "Weich bis ölig" }
  },
  {
    question: "Wie gehst du mit Veränderungen um?",
    answers: { Vata: "Unsicher bis nervös", Pitta: "Zielgerichtet, ehrgeizig", Kapha: "Gelassen, manchmal träge" }
  },
  {
    question: "Wie ist dein Appetit?",
    answers: { Vata: "Unregelmäßig, vergisst zu essen", Pitta: "Stark, regelmäßig", Kapha: "Eher gering, isst aus Gewohnheit" }
  },
  {
    question: "Wie ist dein Redeverhalten?",
    answers: { Vata: "Schnell, sprunghaft", Pitta: "Deutlich, überzeugend", Kapha: "Langsam, bedacht" }
  },
  {
    question: "Wie reagierst du auf kaltes Wetter?",
    answers: { Vata: "Empfindlich, friert leicht", Pitta: "Erfrischend", Kapha: "Erträgt es gut, wird träge" }
  },
  {
    question: "Wie gehst du mit Konflikten um?",
    answers: { Vata: "Vermeidet sie, wird ängstlich", Pitta: "Stellt sich ihnen direkt", Kapha: "Zieht sich zurück, meidet Diskussionen" }
  },
  {
    question: "Wie ist dein Energielevel am Morgen?",
    answers: { Vata: "Braucht Zeit zum Wachwerden", Pitta: "Sofort wach und aktiv", Kapha: "Schwerfällig, müde" }
  },
  {
    question: "Wie ist deine Denkweise?",
    answers: { Vata: "Kreativ, sprunghaft", Pitta: "Analytisch, scharf", Kapha: "Beständig, langsam" }
  }
];

const vataTips = [
    { title: "Regelmäßiger Tagesablauf", text: "Feste Zeiten für Schlaf, Mahlzeiten und Arbeit helfen, Stabilität zu schaffen." },
    { title: "Warme, gekochte Mahlzeiten", text: "Bevorzuge warme Speisen wie Suppen, Eintöpfe und gekochtes Gemüse." },
    { title: "Ausreichend Ruhe", text: "Plane Pausen und ausreichend Schlaf ein, um Überanstrengung zu vermeiden." },
    { title: "Wärme bewahren", text: "Halte dich warm, insbesondere Hände, Füße und Kopf." },
    { title: "Ölmassagen (Abhyanga)", text: "Tägliche Selbstmassagen mit warmem Sesamöl beruhigen das Nervensystem." },
    { title: "Sanfte Bewegung", text: "Yoga, Tai-Chi oder Spaziergänge sind ideal. Vermeide exzessiven Sport." },
    { title: "Meditation & Atemübungen", text: "Pranayama und Meditation helfen, den Geist zu beruhigen." },
    { title: "Vermeide Reizüberflutung", text: "Reduziere Lärm, hektische Umgebungen und übermäßigen Medienkonsum." },
    { title: "Hydration", text: "Trinke warme Getränke wie Kräutertees oder heißes Wasser mit Zitrone." },
    { title: "Kreativität", text: "Nimm dir Zeit für kreative Hobbys, die dich erden und Freude bereiten." } 
];

const pittaTips = [
    { title: "Kühl bleiben", text: "Vermeide übermäßige Hitze und direkte Sonneneinstrahlung." },
    { title: "Ausreichende Flüssigkeit", text: "Trinke zimmerwarmes Wasser und kühlende Getränke" },
    { title: "Regelmäßige Mahlzeiten", text: "Halte feste Essenszeiten ein und vermeide das Auslassen von Mahlzeiten." },
    { title: "Milde Gewürze verwenden", text: "Bevorzuge Gewürze wie Fenchel, Koriander, Kardamom und Kurkuma." },
    { title: "Kühlende Lebensmittel", text: "Integriere Lebensmittel mit kühlenden Eigenschaften in deine Ernährung." },
    { title: "Stressmanagement", text: "Plane regelmäßige Entspannungsphasen ein, z.B. durch Meditation oder Spaziergänge." },
    { title: "Moderate Bewegung", text: "Bevorzuge sanfte körperliche Aktivitäten wie Yoga oder Schwimmen." },
    { title: "Vermeide scharfe, saure und salzige Speisen", text: "Diese können das Pitta-Dosha erhöhen." },
    { title: "Kühle Farben und Umgebung", text: "Umgebe dich mit beruhigenden Farben wie Blau und Grün." },
    { title: "Pflege soziale Beziehungen", text: "Vermeide übermäßigen Wettbewerb und fördere harmonische Interaktionen." }
];

const kaphaTips = [
    { title: "Früh aufstehen", text: "Stehe vor 6 Uhr auf, um Trägheit zu vermeiden." },
    { title: "Regelmäßige Bewegung", text: "Integriere tägliche körperliche Aktivitäten, besonders morgens." },
    { title: "Leichte Ernährung", text: "Bevorzuge warme, trockene und leicht verdauliche Speisen." },
    { title: "Vermeide Zwischenmahlzeiten", text: "Halte feste Mahlzeiten ein und vermeide Snacking." },
    { title: "Anregende Gewürze", text: "Nutze Gewürze wie Ingwer, Pfeffer und Kurkuma zur Anregung des Stoffwechsels." },
    { title: "Saunabesuche", text: "Regelmäßige Saunagänge können helfen, Kapha zu reduzieren." },
    { title: "Geistige Aktivität", text: "Halte den Geist aktiv durch Lernen und neue Erfahrungen." },
    { title: "Vermeide Kälte und Feuchtigkeit", text: "Halte dich warm und trocken, um Kapha nicht zu erhöhen." },
    { title: "Reduziere Süßes und Fettiges", text: "Begrenze den Konsum von süßen und fettigen Lebensmitteln." },
    { title: "Positive Veränderung", text: "Sei offen für Neues und vermeide Routine, um geistige Trägheit zu verhindern." }
];

const DoshaTestPage = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [doshaCounts, setDoshaCounts] = useState(() => {
    if (questions.length === 0 || !questions[0]) return {};
    return Object.keys(questions[0].answers).reduce((acc, key) => ({ ...acc, [key]: 0 }), {});
  });
  const [showResult, setShowResult] = useState(false);
  const [resultText, setResultText] = useState('');
  const [resultDosha, setResultDosha] = useState(null);
  const navigate = useNavigate();
  const { updateUserDosha } = useUser();

  const [showDoshaDetailModal, setShowDoshaDetailModal] = useState(false);

  // Body scroll verhindern, wenn Modal offen ist
  useEffect(() => {
    if (showDoshaDetailModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showDoshaDetailModal]);

  const progressPercent = questions.length > 0 ? Math.round(((currentQuestionIndex) / questions.length) * 100) : 0;

  const calculateAndSetResult = async (finalCounts) => {
    const sortedDoshas = Object.entries(finalCounts).sort(([, a], [, b]) => b - a);

    if (sortedDoshas.length === 0 || sortedDoshas[0][1] === 0) {
      setResultText("Fehler bei der Ergebnisermittlung. Bitte neu starten.");
      setResultDosha(null);
      localStorage.removeItem("selectedDosha");
      return;
    }

    const maxDosha = sortedDoshas[0][0];
    setResultDosha(maxDosha);
    let text = "Du bist hauptsächlich: ";
    switch (maxDosha) {
      case "Vata": text += "🌀 Vata – kreativ, beweglich, aber manchmal unruhig."; break;
      case "Pitta": text += "🔥 Pitta – zielstrebig, stark, aber schnell reizbar."; break;
      case "Kapha": text += "🌱 Kapha – stabil, liebevoll, aber neigt zur Trägheit."; break;
      default: text = "Ergebnis konnte nicht ermittelt werden."; setResultDosha(null);
    }
    setResultText(text);
    try {
      await updateUserDosha(maxDosha); // Ruft die Funktion aus dem UserContext auf
      console.log(`Dosha-Test: Ergebnis '${maxDosha}' an UserContext übergeben.`);
    } catch (error) {
      console.error("Dosha-Test: Fehler beim Aktualisieren des Dosha-Typs über Context:", error);
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
      calculateAndSetResult(updatedCounts); // Ergebnis berechnen

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
    setResultDosha(null);
    setShowDoshaDetailModal(false);
  };

  const openModalForDosha = () => {
    if (resultDosha) {
        setShowDoshaDetailModal(true);
    }
  };
  const closeModal = () => setShowDoshaDetailModal(false);

  // ##### MODAL CONTENT #####
  const VataModalContent = () => (
    <>
      <div className="generalInfo">
        <video src="/videos/index/vata.mp4" type="video/mp4" autoPlay loop muted playsInline id="VataVideo"></video>
        <div className="modalText"> 
          <h2 id="VataName">Vata</h2>
          <p>
            Vata ist eines der drei Doshas im Ayurveda und repräsentiert die
            Elemente Luft und Äther (Raum). Es ist verantwortlich für
            Bewegung, Kommunikation, Atmung und das Nervensystem. Vata
            dominiert typischerweise in den kälteren Jahreszeiten,
            insbesondere im Herbst und Winter.
          </p>
        </div>
      </div>
      <div className="characteristics">
            <div className="firstRow">
              <div className="rowContent">
                <p className="characteristic">Körperbau</p>
                <p>Schlank, leicht, zart gebaut</p>
              </div>
              <div className="rowContent">
                <p className="characteristic">Haut & Haare</p>
                <p>Trockene Haut und Haare</p>
              </div>
              <div className="rowContent">
                <p className="characteristic">Temperatur</p>
                <p>Neigung zu kalten Händen und Füßen</p>
              </div>
            </div>
            <div className="secondRow">
              <div className="rowContent">
                <p className="characteristic">Verdauung</p>
                <p>Unregelmäßiger Appetit und Verdauung</p>
              </div>
              <div className="rowContent">
                <p className="characteristic">Geist & Emotionen</p>
                <p>
                  Kreativ, lebhaft, enthusiastisch, aber auch anfällig für
                  Sorgen, Ängste und Schlafstörungen.
                </p>
              </div>
              <div className="rowContent">
                <p className="characteristic">Schlaf</p>
                <p>Leichter Schlaf, neigt zu Schlaflosigkeit.</p>
              </div>
            </div>
        </div>
        <div className="problems">
            <h3 className="spacerHeading">Probleme bei Vata Überschuss</h3>
            <div className="problem">
              <p className="problemName">🫀 Körperliche Symptome</p>
              <p className="problemDescription">
                Trockene Haut, Verstopfung, Blähungen, Gelenkschmerzen,
                Muskelverspannungen.
              </p>
            </div>
            <div className="problem">
              <p className="problemName">🧠 Psychische Symptome</p>
              <p className="problemDescription">
                Angstzustände, Nervosität, Konzentrationsschwierigkeiten,
                Schlaflosigkeit.
              </p>
            </div>
            <div className="problem">
              <p className="problemName">🤝 Verhalten</p>
              <p className="problemDescription">
                Unruhe, Überforderung, Schwierigkeiten, zur Ruhe zu kommen.
              </p>
            </div>
        </div>
        <div className="tips">
            <h3 className="spacerHeading">10 Tipps Für den Vata-Typ</h3>
            <img src="/img/index/VataTipp.gif" alt="Vata Tipps" className="desktop-only" />
            <div className="mobile-only"><TipsCarousel tips={vataTips} /></div>
        </div>
        <div className="foodTips">
            <h3 className="spacerHeading">Ernährungstipps</h3>
            <div className="foodtip">
              <div className="tipCard">
                <p>Bevorzugte Geschmacksrichtungen 👍</p>
                <div className="list" id="positive">
                  <p>Süß</p>
                  <p>Sauer</p>
                  <p>Salzig</p>
                </div>
              </div>
              <div className="tipCard">
                <p>Zu vermeiden 👎</p>
                <div className="list" id="negative">
                  <p>
                    Rohkost. Rohes Gemüse und Salate können schwer verdaulich
                    sein.
                  </p>
                  <p>
                    Trockene Lebensmittel. Cracker, Chips, Trockenfrüchte ohne
                    Einweichen.
                  </p>
                </div>
              </div>
            </div>
        </div>
        <div className="recommendations">
            <h3 className="spacerHeading">Empfohlene Lebensmittel</h3>
            <div className="recommendationRow">
              <div className="recommendation">
                <img src="/img/index/getreide.jpg" alt="Getreide" />
                <div className="recommendationDescription">
                  <p className="recommendationName">Getreide</p>
                  <p>Reis, Hafer, Dinkel, Weizen.</p>
                </div>
              </div>
              <div className="recommendation">
                <img src="/img/index/gemuese.jpg" alt="Gemüse" />
                <div className="recommendationDescription">
                  <p className="recommendationName">Gemüse</p>
                  <p>Karotten, Rüben, Kürbis, Zucchini, Süßkartoffel.</p>
                </div>
              </div>
            </div>
            <div className="recommendationRow">
              <div className="recommendation">
                <img src="/img/index/obst.jpg" alt="Obst" />
                <div className="recommendationDescription">
                  <p className="recommendationName">Obst</p>
                  <p>Reife, süße Früchte, wie Bananen, Mangos oder Äpfel.</p>
                </div>
              </div>
              <div className="recommendation">
                <img src="/img/index/huelsenfruechte.jpg" alt="Hülsenfrüchte" />
                <div className="recommendationDescription">
                  <p className="recommendationName">Hülsenfrüchte</p>
                  <p>In Maßen, gut gekocht und gewürzt.</p>
                </div>
              </div>
            </div>
        </div>
    </>
  );

  const PittaModalContent = () => (
    <>
        <div className="generalInfo">
            <video src="/videos/index/Pitta.mp4" type="video/mp4" autoPlay loop muted playsInline id="PittaVideo"></video>
            <div className="modalText">
              <h2 id="PittaName">Pitta</h2>
              <p>
                Pitta ist eines der drei Doshas im Ayurveda und repräsentiert
                die Elemente Feuer und Wasser. Es ist verantwortlich für
                Stoffwechsel, Verdauung, Körpertemperatur und Intellekt. Ein
                ausgeglichenes Pitta-Dosha zeigt sich in guter Verdauung, klarer
                Sehkraft, ausgeglichener Körpertemperatur sowie in einem klaren,
                leistungsfähigen Intellekt und ausgeglichenen Emotionen.
              </p>
            </div>
          </div>
          <div className="characteristics">
            <div className="firstRow">
              <div className="rowContent">
                <p className="characteristic" id="PittaName">Körperbau</p>
                <p>Athletisch, mittelgroß, gut proportioniert.</p>
              </div>
              <div className="rowContent">
                <p className="characteristic" id="PittaName">Haut & Haare</p>
                <p>
                  Helle, empfindliche Haut mit Neigung zu Rötungen; blondes oder
                  rotes Haar, oft fein und licht.
                </p>
              </div>
              <div className="rowContent">
                <p className="characteristic" id="PittaName">Temperatur</p>
                <p>Neigung zu Hitzeempfindlichkeit und Schwitzen.</p>
              </div>
            </div>
            <div className="secondRow">
              <div className="rowContent">
                <p className="characteristic" id="PittaName">Verdauung</p>
                <p>Starker Appetit und schnelle Verdauung.</p>
              </div>
              <div className="rowContent">
                <p className="characteristic" id="PittaName">Geist & Emotionen</p>
                <p>
                  Scharfer Intellekt, zielstrebig, organisiert, aber auch
                  anfällig für Ungeduld und Reizbarkeit.
                </p>
              </div>
              <div className="rowContent">
                <p className="characteristic" id="PittaName">Schlaf</p>
                <p>
                  In der Regel guter, tiefer Schlaf, aber oft nicht sehr lang.
                </p>
              </div>
            </div>
          </div>
          <div className="problems">
            <h3 className="spacerHeading">Probleme bei Pitta Überschuss</h3>
            <div className="problem">
              <p className="problemName">🫀 Körperliche Symptome</p>
              <p className="problemDescription">
                Entzündungen, Hautprobleme (z.B. Akne, Rötungen), Sodbrennen,
                übermäßiges Schwitzen.
              </p>
            </div>
            <div className="problem">
              <p className="problemName">🧠 Psychische Symptome</p>
              <p className="problemDescription">
                Reizbarkeit, Zorn, Ungeduld, Perfektionismus.
              </p>
            </div>
            <div className="problem">
              <p className="problemName">🤝 Verhalten</p>
              <p className="problemDescription">
                Übermäßiger Ehrgeiz, Konkurrenzdenken, Neigung zu Kritik.
              </p>
            </div>
          </div>
          <div className="tips">
            <h3 className="spacerHeading">10 Tipps Für den Pitta-Typ</h3>
            <img src="/img/index/PittaTipp.gif" alt="Pitta Tipps" className="desktop-only" />
            <div className="mobile-only"><TipsCarousel tips={pittaTips} /></div>
          </div>
          <div className="foodTips">
            <h3 className="spacerHeading">Ernährungstipps</h3>
            <div className="foodtip">
              <div className="tipCard">
                <p>Bevorzugte Geschmacksrichtungen 👍</p>
                <div className="list" id="positive">
                  <p>Süß</p>
                  <p>Bitter</p>
                  <p>Herb</p>
                </div>
              </div>
              <div className="tipCard">
                <p>Zu vermeiden 👎</p>
                <div className="list" id="negative">
                  <p>
                    Scharfe, saure und salzige Speisen: Chili, Essig, gesalzene
                    Snacks.
                  </p>
                  <p>
                    Koffein (z.B. Kaffee, schwarzer Tee) – wirkt erhitzend und
                    reizt den Magen.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="recommendations">
            <h3 className="spacerHeading">Empfohlene Lebensmittel</h3>
            <div className="recommendationRow">
              <div className="recommendation">
                <img src="/img/index/getreide.jpg" alt="Getreide" />
                <div className="recommendationDescription">
                  <p className="recommendationName">Getreide</p>
                  <p>Reis, Gerste, Hafer.</p>
                </div>
              </div>
              <div className="recommendation">
                <img src="/img/index/gemuese.jpg" alt="Gemüse" />
                <div className="recommendationDescription">
                  <p className="recommendationName">Gemüse</p>
                  <p>Artischocken, Spargel, Spinat, Brokkoli, Zucchini.</p>
                </div>
              </div>
            </div>
            <div className="recommendationRow">
              <div className="recommendation">
                <img src="/img/index/obst.jpg" alt="Obst" />
                <div className="recommendationDescription">
                  <p className="recommendationName">Obst</p>
                  <p>Süße, saftige Früchte wie Melonen, Birnen, Kirschen.</p>
                </div>
              </div>
              <div className="recommendation">
                <img src="/img/index/milk.jpg" alt="Milchprodukte" />
                <div className="recommendationDescription">
                  <p className="recommendationName">Milchprodukte</p>
                  <p>Ghee, Milch, Butter in Maßen</p>
                </div>
              </div>
            </div>
          </div>
    </>
  );

  const KaphaModalContent = () => (
    <>
        <div className="generalInfo">
            <video src="/videos/index/Kapha.mp4" type="video/mp4" autoPlay loop muted playsInline id="KaphaVideo"></video>
            <div className="modalText">
              <h2 id="KaphaName">Kapha</h2>
              <p>
                Kapha ist eines der drei Doshas im Ayurveda und repräsentiert
                die Elemente Erde und Wasser. Es steht für Struktur, Stabilität
                und Ausdauer. Kapha verleiht dem Körper Form und Festigkeit und
                ist verantwortlich für die Schmierung der Gelenke sowie die
                Aufrechterhaltung der Immunität.
              </p>
            </div>
          </div>
          <div className="characteristics">
            <div className="firstRow">
              <div className="rowContent">
                <p className="characteristic" id="KaphaName">Körperbau</p>
                <p>Kräftig, stabil, neigen zu Übergewicht.</p>
              </div>
              <div className="rowContent">
                <p className="characteristic" id="KaphaName">Haut & Haare</p>
                <p>Fettige Haut, volles und kräftiges Haar.</p>
              </div>
              <div className="rowContent">
                <p className="characteristic" id="KaphaName">Temperatur</p>
                <p>Kühlere Körpertemperatur, mag Wärme.</p>
              </div>
            </div>
            <div className="secondRow">
              <div className="rowContent">
                <p className="characteristic" id="KaphaName">Verdauung</p>
                <p>Langsamer Stoffwechsel, neigen zu Gewichtszunahme.</p>
              </div>
              <div className="rowContent">
                <p className="characteristic" id="KaphaName">Energie</p>
                <p>Langsame, aber ausdauernde Energie; neigen zu Trägheit.</p>
              </div>
              <div className="rowContent">
                <p className="characteristic" id="KaphaName">Schlaf</p>
                <p>Tiefer und langer Schlaf.</p>
              </div>
            </div>
          </div>
          <div className="problems">
            <h3 className="spacerHeading">Probleme bei Kapha Überschuss</h3>
            <div className="problem">
              <p className="problemName">🫀 Körperliche Symptome</p>
              <p className="problemDescription">
                Übergewicht, Wassereinlagerungen, Schleimbildung,
                Verdauungsprobleme.
              </p>
            </div>
            <div className="problem">
              <p className="problemName">🧠 Psychische Symptome</p>
              <p className="problemDescription">
                Antriebslosigkeit, Depression, übermäßige Anhänglichkeit.
              </p>
            </div>
            <div className="problem">
              <p className="problemName">🤝 Verhalten</p>
              <p className="problemDescription">
                Trägheit, Widerstand gegen Veränderung.
              </p>
            </div>
          </div>
          <div className="tips">
            <h3 className="spacerHeading">10 Tipps Für den Kapha-Typ</h3>
            <img src="/img/index/KaphaTipp.gif" alt="Kapha Tipps" className="desktop-only" />
            <div className="mobile-only"><TipsCarousel tips={kaphaTips} /></div>
          </div>
          <div className="foodTips">
            <h3 className="spacerHeading">Ernährungstipps</h3>
            <div className="foodtip">
              <div className="tipCard">
                <p>Bevorzugte Geschmacksrichtungen 👍</p>
                <div className="list" id="positive">
                  <p>Scharf</p>
                  <p>Bitter</p>
                  <p>Herb</p>
                </div>
              </div>
              <div className="tipCard">
                <p>Zu vermeiden 👎</p>
                <div className="list" id="negative">
                  <p>
                    Schwere und fettige Speisen. Frittierte Lebensmittel, Käse,
                    Sahne.
                  </p>
                  <p>Süßigkeiten und Zucker. Begrenze den Konsum von Süßem.</p>
                  <p>
                    Kalte und rohe Speisen. Vermeide kalte Getränke und rohe
                    Lebensmittel.
                  </p>
                  <p>Salz. Reduziere die Salzaufnahme.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="recommendations">
            <h3 className="spacerHeading">Empfohlene Lebensmittel</h3>
            <div className="recommendationRow">
              <div className="recommendation">
                <img src="/img/index/getreide.jpg" alt="Getreide" />
                <div className="recommendationDescription">
                  <p className="recommendationName">Getreide</p>
                  <p>Gerste, Buchweizen, Hirse.</p>
                </div>
              </div>
              <div className="recommendation">
                <img src="/img/index/gemuese.jpg" alt="Gemüse" />
                <div className="recommendationDescription">
                  <p className="recommendationName">Gemüse</p>
                  <p>Grünes Blattgemüse, Brokkoli, Blumenkohl, Spargel.</p>
                </div>
              </div>
            </div>
            <div className="recommendationRow">
              <div className="recommendation">
                <img src="/img/index/gewuerze.jpg" alt="Gewürze" />
                <div className="recommendationDescription">
                  <p className="recommendationName">Gewürze</p>
                  <p>Ingwer, Pfeffer, Kurkuma, Kreuzkümmel.</p>
                </div>
              </div>
              <div className="recommendation">
                <img src="/img/index/huelsenfruechte.jpg" alt="Hülsenfrüchte" />
                <div className="recommendationDescription">
                  <p className="recommendationName">Hülsenfrüchte</p>
                  <p>Linsen, Kichererbsen, Bohnen.</p>
                </div>
              </div>
            </div>
          </div>
    </>
  );

  const getModalContent = () => {
    switch (resultDosha) {
      case 'Vata': return <VataModalContent />;
      case 'Pitta': return <PittaModalContent />;
      case 'Kapha': return <KaphaModalContent />;
      default: return null;
    }
  };


  // ==================== JSX RENDERING ====================
  if (showResult) {
    return (
      <div className={styles.contentWrapper}>
        <div className={styles.introBox}>
          <h2>🧘‍♀️ Dein Ergebnis</h2>
        </div>
        <div className={styles.quizWrapper}>
          <div className={styles.gamificationCard} id="result-container">
            <p className={styles.resultText} id="result-text">{resultText || 'Ergebnis wird geladen...'}</p>
            
            <div className={styles.resultActions}>
              {resultDosha && (
                <button className={styles.resultButton} onClick={openModalForDosha}>
                  Mehr über {resultDosha.charAt(0).toUpperCase() + resultDosha.slice(1)} erfahren
                </button>
              )}
              <button className={styles.resultButton} onClick={() => navigate('/myAyurly')}>
                Jetzt personalisierte Empfehlungen erhalten!
              </button>
            </div>

            <div className={styles.navigationButtons}>
              <button className={styles.resultButton} onClick={restartTest}>
                Test neu starten
              </button>
            </div>
          </div>
        </div>
        {resultDosha && (
            <Modal show={showDoshaDetailModal} onClose={closeModal}>
                {getModalContent()}
            </Modal>
        )}
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
              <span>{progressPercent}%</span>
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