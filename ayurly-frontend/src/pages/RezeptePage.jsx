// src/pages/RezeptePage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Für Links zu Detailseiten
import styles from './RezeptePage.module.css';

// Dummy-Rezeptdaten (später durch API-Aufruf ersetzen)
const dummyRecipes = [
  {
    id: 'golden-gut-curry', // Wird Teil der URL
    name: 'Golden Gut Curry',
    image: '/img/recipes/golden gut curry.jpg', // Pfad im public-Ordner
    description: 'Mit heilenden Kräutern verfeinert, stärkt dieses Curry deine Verdauung und lässt dein inneres Strahlen erblühen.',
    dosha: ['vata', 'pitta', 'kapha'], // Für welche Doshas ist es geeignet? (Array)
  },
  {
    id: 'kitchari-detox',
    name: 'Kitchari Detox Bowl',
    image: '/img/recipes/kitchari.jpg', // Beispiel, Bild muss existieren
    description: 'Ein leicht verdauliches und nährendes Gericht, perfekt zur Reinigung und Stärkung.',
    dosha: ['vata', 'pitta', 'kapha'],
  },
  {
    id: 'vata-beruhigungs-suppe',
    name: 'Vata Beruhigungs-Suppe',
    image: '/img/recipes/vata_suppe.jpg', // Beispiel
    description: 'Eine wärmende und erdende Suppe, ideal um Vata auszugleichen und zur Ruhe zu kommen.',
    dosha: ['vata'],
  },
  {
    id: 'pitta-kuehl-salat',
    name: 'Pitta Kühlender Salat',
    image: '/img/recipes/pitta_salat.jpg', // Beispiel
    description: 'Ein erfrischender und kühlender Salat, der Pitta besänftigt und den Geist klärt.',
    dosha: ['pitta'],
  },
  {
    id: 'kapha-anregungs-eintopf',
    name: 'Kapha Anregungs-Eintopf',
    image: '/img/recipes/kapha_eintopf.jpg', // Beispiel
    description: 'Ein leichter und anregender Eintopf, der Kapha stimuliert und Energie spendet.',
    dosha: ['kapha'],
  }
];


const RezeptePage = () => {
  const [recipes, setRecipes] = useState([]);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [selectedDosha, setSelectedDosha] = useState('all'); // 'all', 'vata', 'pitta', 'kapha'

  // Lade Rezepte (hier Dummy-Daten, später API)
  useEffect(() => {
    // TODO: Hier API-Aufruf implementieren, um Rezepte zu laden
    setRecipes(dummyRecipes);
    setFilteredRecipes(dummyRecipes); // Initial alle Rezepte anzeigen
  }, []);

  // Filter Rezepte, wenn sich selectedDosha oder die Haupt-Rezeptliste ändert
  useEffect(() => {
    if (selectedDosha === 'all') {
      setFilteredRecipes(recipes);
    } else {
      setFilteredRecipes(
        recipes.filter(recipe => recipe.dosha.includes(selectedDosha))
      );
    }
  }, [selectedDosha, recipes]);

  const handleDoshaChange = (event) => {
    setSelectedDosha(event.target.value);
  };

  return (
    <div className={styles.mainContent}> {/* Wrapper für Hauptinhalt */}
      <section className={styles.filterSection}> {/* Eigene Section für die Filter */}
        <div className={styles.toggleGroup}>
          <label
            className={`${styles.toggleLabel} ${selectedDosha === 'all' ? styles.toggleLabelChecked : ''}`}
            htmlFor="all-dosha"
          >
            <input
              type="radio"
              name="dosha"
              id="all-dosha"
              value="all"
              className={styles.toggleButton}
              checked={selectedDosha === 'all'}
              onChange={handleDoshaChange}
            />
            Alle
          </label>
          <label
            className={`${styles.toggleLabel} ${selectedDosha === 'vata' ? styles.toggleLabelChecked : ''}`}
            htmlFor="vata-dosha"
          >
            <input
              type="radio"
              name="dosha"
              id="vata-dosha"
              value="vata"
              className={styles.toggleButton}
              checked={selectedDosha === 'vata'}
              onChange={handleDoshaChange}
            />
            🌀 Vata
          </label>
          <label
            className={`${styles.toggleLabel} ${selectedDosha === 'pitta' ? styles.toggleLabelChecked : ''}`}
            htmlFor="pitta-dosha"
          >
            <input
              type="radio"
              name="dosha"
              id="pitta-dosha"
              value="pitta"
              className={styles.toggleButton}
              checked={selectedDosha === 'pitta'}
              onChange={handleDoshaChange}
            />
            🔥 Pitta
          </label>
          <label
            className={`${styles.toggleLabel} ${selectedDosha === 'kapha' ? styles.toggleLabelChecked : ''}`}
            htmlFor="kapha-dosha"
          >
            <input
              type="radio"
              name="dosha"
              id="kapha-dosha"
              value="kapha"
              className={styles.toggleButton}
              checked={selectedDosha === 'kapha'}
              onChange={handleDoshaChange}
            />
            🌱 Kapha
          </label>
        </div>
      </section>

      <section className={styles.recipesGrid}>
        {filteredRecipes.length > 0 ? (
          filteredRecipes.map(recipe => (
            <div key={recipe.id} className={styles.recipeCard}>
              <div className={styles.imagePreview}>
                <img src={recipe.image} alt={recipe.name} />
              </div>
              <div className={styles.recipeInfo}>
                <p className={styles.recipeName}>{recipe.name}</p>
                <p className={styles.description}>{recipe.description}</p>
              </div>
              {/* Link zur Detailseite des Rezepts */}
              <Link to={`/rezepte/${recipe.id}`} className={styles.discoverRecipe}>
                Mehr
              </Link>
            </div>
          ))
        ) : (
          <p className={styles.noRecipesMessage}>
            Keine Rezepte für die Auswahl "{selectedDosha}" gefunden.
          </p>
        )}
      </section>
    </div>
  );
};

export default RezeptePage;