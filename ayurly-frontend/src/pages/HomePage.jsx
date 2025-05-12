import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom'; // Für Links im Footer-Bereich
import Modal from '../components/UI/Modal';
import '../styles/indexStyles.css'; // Deine Styles für die Homepage

const HomePage = () => {
  const [username, setUsername] = useState('Username'); // Später dynamisch
  const [showVataModal, setShowVataModal] = useState(false);
  const [showPittaModal, setShowPittaModal] = useState(false);
  const [showKaphaModal, setShowKaphaModal] = useState(false);

  // Parallax-Effekt
  useEffect(() => {
    const parallaxEffect = () => {
      let value = window.scrollY;
      const punch = document.getElementById('punch');
      const leaf = document.getElementById('leaf');
      const hill1 = document.getElementById('hill1');
      const hill4 = document.getElementById('hill4');
      const hill5 = document.getElementById('hill5');
      // const parallaxSection = document.querySelector(".parallax");

      // Begrenzung des Scroll-Wertes (aus deinem Original-Skript)
      // const maxScroll = parallaxSection ? parallaxSection.offsetHeight : Infinity;
      // if (value > maxScroll) { // Diese Logik muss ggf. angepasst werden, da `value` hier nur eine Kopie ist
      //   value = maxScroll;
      // }

      if (punch) punch.style.marginTop = value * 2.5 + 'px';
      if (leaf) leaf.style.top = value * -1.5 + 'px';
      if (hill5) hill5.style.left = value * 1.5 + 'px';
      if (hill4) hill4.style.left = value * -1.5 + 'px';
      if (hill1) hill1.style.top = value * 1 + 'px';
    };

    window.addEventListener('scroll', parallaxEffect);
    return () => {
      window.removeEventListener('scroll', parallaxEffect);
    };
  }, []);

  // Body scroll verhindern, wenn Modal offen ist
  useEffect(() => {
    if (showVataModal || showPittaModal || showKaphaModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    // Cleanup-Funktion, um sicherzustellen, dass der Overflow beim Verlassen der Seite zurückgesetzt wird
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showVataModal, showPittaModal, showKaphaModal]);


  // Handler für Modals
  const openModal = (setter) => (event) => {
    event.preventDefault(); // Verhindert das Standardverhalten von <a> Tags
    setter(true);
  };
  const closeModal = (setter) => () => setter(false);

  return (
    <div className="homepage-container"> {/* Du kannst diese Klasse entfernen, wenn nicht benötigt */}
      <section className="parallax">
        <img src="/img/index/hill1.png" alt="" id="hill1" />
        <img src="/img/index/hill2.png" alt="" id="hill2" />
        <img src="/img/index/hill3.png" alt="" id="hill3" />
        <img src="/img/index/hill4.png" alt="" id="hill4" />
        <img src="/img/index/hill5.png" alt="" id="hill5" />
        <img src="/img/index/tree.png" alt="" id="tree" />
        <h2 id="punch">&#128075; Willkommen, {username}</h2>
        <img src="/img/index/leaf.png" alt="" id="leaf" />
        <img src="/img/index/plant.png" alt="" id="plant" />
      </section>

      <section id="ground">
        <p className="motivationStatement">
          <span className="quotations">"</span> Beginne diesen Tag im Einklang mit
          deinem inneren Rhythmus. Höre auf deinen Körper, nähre deinen Geist und
          handle mit Achtsamkeit – denn wahre Gesundheit entsteht aus Balance,
          nicht aus Eile <span className="quotations">"</span>.
        </p>
      </section>

      <section>
        <div className="info">
          <img src="/img/index/ayurlyLogo.png" alt="Ayurly Logo" />
          <div className="text">
            <h1>Was ist Ayurly?</h1>
            <p>
              Ayurly begleitet dich auf deiner ganz persönlichen Reise zu mehr
              Balance, Wohlbefinden und innerer Ruhe – basierend auf den
              Prinzipien des Ayurveda. Entdecke deine individuelle Konstitution
              (Dosha) und finde Routinen, die wirklich zu dir passen.
            </p>
          </div>
        </div>
      </section>

      <section>
        <div className="doshas">
          <h1>Die 3 Doshas im Überblick</h1>
          <div className="doshaCards">
            <div className="card">
              <p className="doshaIcon">🌀</p>
              <p className="doshaName" id="Vata">Vata</p>
              <p className="doshaInfo">
                Vata steht für Bewegung, Kreativität und Flexibilität. Es steuert
                Atmung, Kreislauf und Nervensystem.
              </p>
              <a href="#" className="discoverDosha" onClick={openModal(setShowVataModal)}>Entdecken</a>
            </div>
            <div className="card">
              <p className="doshaIcon">🔥</p>
              <p className="doshaName" id="Pitta">Pitta</p>
              <p className="doshaInfo">
                Pitta steht für Feuer, Energie und Transformation. Es regelt
                Verdauung, Stoffwechsel und Intelligenz.
              </p>
              <a href="#" className="discoverDosha" onClick={openModal(setShowPittaModal)}>Entdecken</a>
            </div>
            <div className="card">
              <p className="doshaIcon">🌱</p>
              <p className="doshaName" id="Kapha">Kapha</p>
              <p className="doshaInfo">
                Kapha symbolisiert Struktur, Stabilität und Ausdauer. Es
                beeinflusst Immunität, Gelenke und Flüssigkeitshaushalt.
              </p>
              <a href="#" className="discoverDosha" onClick={openModal(setShowKaphaModal)}>Entdecken</a>
            </div>
          </div>
        </div>
      </section>

      {/* Vata Modal */}
      <Modal show={showVataModal} onClose={closeModal(setShowVataModal)}>
        <div className="generalInfo">
          <video src="/videos/index/vata.mp4" type="video/mp4" autoPlay loop muted playsInline></video>
          <div className="text">
            <h2 id="VataName">Vata</h2>
            <p>
              Vata ist eines der drei Doshas im Ayurveda und repräsentiert die
              Elemente Luft und Äther (Raum). Es ist verantwortlich für
              Bewegung, Kommunikation, Atmung und das Nervensystem. Vata
              dominiert typischerweise in den kälteren Jahreszeiten,
              insbesondere im Herbst und Winter.
            </p>
          </div>
          {/* Der Schließen-Button ist jetzt in der Modal-Komponente, hier ggf. entfernen, wenn er in indexStyles.css anders gestyled ist */}
        </div>
        {/* ... Restlicher Inhalt für Vata Modal (characteristics, problems, tips, foodTips, recommendations) ... */}
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
            <img src="/img/index/VataTipp.gif" alt="Vata Tipps" />
        </div>
        <div className="foodTips">
            <h3 className="spacerHeading">Ernährungstipps</h3>
            <div className="foodtip">
              <div className="tipCard">
                <p>Bevorzugte Geschmacksrichtungen 👍</p>
                <div className="list" id="positive"> {/* IDs für Styling beibehalten */}
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
                <img src="/img/index/huelsenfruechte.jpg" alt="Hülsenfrüchte" /> {/* Korrigierter Umlaut */}
                <div className="recommendationDescription">
                  <p className="recommendationName">Hülsenfrüchte</p>
                  <p>In Maßen, gut gekocht und gewürzt.</p>
                </div>
              </div>
            </div>
        </div>
      </Modal>

      {/* Pitta Modal */}
      <Modal show={showPittaModal} onClose={closeModal(setShowPittaModal)}>
        <div className="generalInfo">
            <video src="/videos/index/Pitta.mp4" type="video/mp4" autoPlay loop muted playsInline id="pittaVideo"></video>
            <div className="text">
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
          {/* ... Restlicher Inhalt für Pitta Modal ... */}
          <div className="characteristics">
            <div className="firstRow">
              <div className="rowContent">
                <p className="characteristic" id="PittaName">Körperbau</p> {/* ID für Styling beibehalten, falls spezifisch */}
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
            <img src="/img/index/PittaTipp.gif" alt="Pitta Tipps" />
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
      </Modal>

      {/* Kapha Modal */}
      <Modal show={showKaphaModal} onClose={closeModal(setShowKaphaModal)}>
        <div className="generalInfo">
            <video src="/videos/index/Kapha.mp4" type="video/mp4" autoPlay loop muted playsInline id="kaphaVideo"></video>
            <div className="text">
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
          {/* ... Restlicher Inhalt für Kapha Modal ... */}
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
                <p className="characteristic" id="KaphaName">Temperatur</p> {/* Im Original HTML stand hier Text zu Geist & Emotionen, angepasst */}
                <p>Kühlere Körpertemperatur, mag Wärme.</p>
              </div>
            </div>
            <div className="secondRow">
              <div className="rowContent">
                <p className="characteristic" id="KaphaName">Verdauung</p>
                <p>Langsamer Stoffwechsel, neigen zu Gewichtszunahme.</p>
              </div>
              <div className="rowContent">
                <p className="characteristic" id="KaphaName">Energie</p> {/* Im Original HTML stand hier Geist & Emotionen, angepasst */}
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
            <img src="/img/index/KaphaTipp.gif" alt="Kapha Tipps" />
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
                <img src="/img/index/gewuerze.jpg" alt="Gewürze" /> {/* Korrigierter Umlaut */}
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
      </Modal>

      <section>
        <div className="info">
          <div className="text">
            <h1>Unsere Angebote</h1>
            <ul id="services">
              <li>Dosha-Test zur Ermittlung deiner ayurvedischen Konstitution</li>
              <li>Personalisierte Tagesroutinen für Vata, Pitta und Kapha</li>
              <li>Geführte Meditationen & Atemübungen zur Harmonisierung</li>
              <li>Ayurvedische Rezepte und Ernährungstipps</li>
            </ul>
          </div>
          <img src="/img/index/meditation.png" alt="Meditation" id="meditation" />
        </div>
      </section>

      <section>
        <div className="Kontakt">
          <div className="text">
            <h1>Kontakt</h1>
            <p>
              Du hast Fragen oder Feedback? Wir freuen uns auf deine Nachricht!
            </p>
          </div>
          <div className="socialMedia">
            {/* Für externe Links ist <a> besser als <Link> von react-router-dom */}
            <a href="https://www.instagram.com/ayurly.balance" target="_blank" rel="noopener noreferrer">
              <i className="fi fi-brands-instagram"></i>ayurly.balance
            </a>
            <a href="mailto:info@ayurly.com">
              <i className="fi fi-br-mailbox-envelope"></i>info@ayurly.com
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;