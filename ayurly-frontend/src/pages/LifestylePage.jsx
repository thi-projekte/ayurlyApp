// src/pages/LifestylePage.jsx
import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import styles from './LifestylePage.module.css';

const LifestylePage = () => {
  const imageRef = useRef(null);

  useEffect(() => {
    const parallaxHandler = () => {
      const image = imageRef.current;
      if (image) {
        const scrollY = window.scrollY;
        // Skalierung: Startet bei 1, wird kleiner bis 0.85.
        // scrollY * 0.0005 bedeutet, dass man 300px scrollen muss, um von 1 auf 0.85 zu kommen (1 - 0.85 = 0.15; 0.15 / 0.0005 = 300)
        // Anpassen, falls der Effekt stärker/schwächer sein soll.
        let scale = 1 - scrollY * 0.0005;
        scale = Math.max(0.85, Math.min(1, scale)); // Begrenze Skalierung zwischen 0.85 und 1

        image.style.transform = `scale(${scale})`;

        // Border-Radius: Startet bei 0, geht bis maxRadius (30px) wenn scale bei 0.85 ist.
        const maxRadius = 30;
        // (1 - scale) ist der Anteil, um den skaliert wurde (0 bei keiner Skalierung, 0.15 bei maximaler)
        // (1 - scale) / 0.15 normalisiert diesen Wert auf 0 bis 1.
        const borderRadiusFactor = (1 - scale) / (1 - 0.85); // Divisor ist die maximale Skalierungsdifferenz
        const borderRadius = borderRadiusFactor * maxRadius;
        image.style.borderRadius = `${borderRadius}px`;
      }
    };

    window.addEventListener('scroll', parallaxHandler);
    // Initialen Zustand setzen, falls die Seite nicht von oben geladen wird
    parallaxHandler();

    return () => {
      window.removeEventListener('scroll', parallaxHandler);
    };
  }, []);

  return (
    <div className={styles.pageContainer}> 
      <section className={styles.leadIn}>
        <div className={styles.top}>
          <p>Ayurveda ist mehr als nur Ernährung.</p>
          <p id={styles.statement} className={styles.statement}> 
            Es ist ein <span >Lebensgefühl.</span>
          </p>
        </div>
        <div className={styles.zoomOut}>
          <img
            ref={imageRef}
            src="/img/lifestyle/bodyMindSoul.jpg" 
            alt="Body, Mind and Soul Steine am Strand bei Sonnenuntergang"
            className={styles.zoomOutimage}
          />
        </div>
        <div className={styles.descriptionAndBubbles}>
          <div className={styles.bubbles}>
            <div className={styles.perimeter}>
              <div className={`${styles.bubble} ${styles.body}`} > 
                <span className={styles.emoji}>🧘</span>
              </div>
            </div>
            <div className={`${styles.perimeter} ${styles.bubbleMiddle}`} > 
              <div className={`${styles.bubble} ${styles.mind}`} > 
                <span className={styles.emoji}>🧠</span>
              </div>
            </div>
            <div className={`${styles.perimeter} ${styles.bubbleBottom}`} > 
              <div className={`${styles.bubble} ${styles.soul}`} > 
                <span className={styles.emoji}>✨</span>
              </div>
            </div>
          </div>
          <div className={styles.text}>
            <p className={styles.headline}>
              Ayurveda basiert auf der einzigartigen Verbindung zwischen Körper,
              Geist und Seele.
            </p>
            <p className={styles.description}>
              Es ist eine ganzheitliche Lebensweise, die dir hilft, in Balance zu
              bleiben und dein inneres Wohlbefinden zu fördern. Jede Person ist
              individuell, und Ayurveda berücksichtigt deine persönlichen
              Bedürfnisse und deinen Lebensstil.
            </p>
          </div>
        </div>
        <p className={styles.discover}>
          Erlebe Routinen, Produkte und Menschen, die dich stärken.
        </p>
      </section>
      <section className={styles.grid}>
        <div className={styles.row}>
          <a href="#" className={styles.item}> {/* Temporär auf # gesetzt */}
            <img src="/img/lifestyle/Friends.webp" alt="Gruppe von Freunden" />
            <p>Freunde</p>
          </a>
          <a href="#" className={styles.item}> {/* Temporär auf # gesetzt */}
            <img src="/img/lifestyle/yoga.jpg" alt="Yoga am Strand" />
            <p>Yoga</p>
          </a>
        </div>
        <div className={styles.row}>
          {/* Beispiel für einen internen Link, falls /beratung bereits implementiert wäre */}
          {/* <Link to="/beratung" className={styles.item}> */}
          <a href="#" className={styles.item}> {/* Temporär auf # gesetzt, da "beratung.html" kein React-Route ist */}
            <img src="/img/lifestyle/coaching.jpg" alt="Coaching Gespräch" />
            <p>Beratung</p>
          </a>
          <a href="#" className={styles.item}> {/* Temporär auf # gesetzt */}
            <img src="/img/lifestyle/products.jpg" alt="Ayurvedische Produkte" />
            <p>Produkte</p>
          </a>
        </div>
      </section>
      </div>
  );
};

export default LifestylePage;