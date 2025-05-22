import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import styles from './RezeptePage.module.css';
import recipeService from '../services/recipeService';
import { useUser } from '../contexts/UserContext';

const RezeptePage = () => {
  const { doshaType: contextDoshaType, loadingKeycloak } = useUser();

  const [recipes, setRecipes] = useState([]);
  const [selectedDosha, setSelectedDosha] = useState('all'); // Default, wird ggf. überschrieben
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Hilfs-State, um sicherzustellen, dass der erste API-Call erst nach Initialisierung von selectedDosha erfolgt.
  const [isInitialFilterSet, setIsInitialFilterSet] = useState(false);

  // 1. Effekt: Setze den initialen selectedDosha basierend auf dem UserContext.
  useEffect(() => {
    if (!loadingKeycloak) { // Warten bis Keycloak-Initialisierung abgeschlossen ist
      if (contextDoshaType) {
        setSelectedDosha(contextDoshaType.toLowerCase());
      } else {
        setSelectedDosha('all'); // Fallback, wenn kein Dosha im Context bekannt
      }
      setIsInitialFilterSet(true); // Signalisiert, dass der initiale Filter gesetzt ist
    }
  }, [contextDoshaType, loadingKeycloak]);

  // 2. Effekt: Lade Rezepte basierend auf selectedDosha, sobald der initiale Filter gesetzt ist.
  useEffect(() => {
    // Nur laden, wenn Keycloak bereit ist UND der initiale Filterwert gesetzt wurde.
    if (loadingKeycloak || !isInitialFilterSet) {
      return;
    }

    const fetchRecipesFromApi = async () => {
      setLoading(true);
      setError(null);
      try {
        // 'all' wird an den recipeService übergeben, der es als 'null' (für alle Rezepte) interpretiert.
        const doshaToFetch = selectedDosha === 'all' ? null : selectedDosha;
        const fetchedData = await recipeService.getAllRecipes(doshaToFetch);
        setRecipes(fetchedData || []);
      } catch (err) {
        setError(err.message || "Fehler beim Laden der Rezepte.");
        setRecipes([]);
        console.error("Error fetching recipes:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipesFromApi();
  }, [selectedDosha, loadingKeycloak, isInitialFilterSet]); // Abhängigkeiten

  const handleDoshaChange = (event) => {
    setSelectedDosha(event.target.value);
  };

  if (loading && !isInitialFilterSet) { // Zeige Ladeindikator, wenn Keycloak noch lädt
    return <div className={styles.loadingMessage}>Initialisiere Filter...</div>;
  }
  if (loading && isInitialFilterSet) { // Zeige Ladeindikator, wenn Rezepte geladen werden
    return <div className={styles.loadingMessage}>Lade Rezepte...</div>;
  }

  if (error) {
    return <div className={styles.noRecipesMessage}>Fehler: {error}</div>;
  }

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
        {recipes.length > 0 ? (
          recipes.map(recipe => (
            <div key={recipe.id} className={styles.recipeCard}>
              <div className={styles.imagePreview}>
                <img 
                    src={recipe.imageUrl || '/img/recipes/default_recipe_image.jpg'} 
                    alt={recipe.title} 
                />
              </div>
              <div className={styles.recipeInfo}>
                <p className={styles.recipeName}>{recipe.title}</p>
                <p className={styles.description}>{recipe.previewDescription}</p>
              </div>
              <Link to={`/rezepte/${recipe.id}`} className={styles.discoverRecipe}>
                Mehr
              </Link>
            </div>
          ))
        ) : (
          !loading && ( 
            <p className={styles.noRecipesMessage}>
              Keine Rezepte für die Auswahl "{selectedDosha === 'all' ? 'Alle' : selectedDosha.charAt(0).toUpperCase() + selectedDosha.slice(1)}" gefunden.
            </p>
          )
        )}
      </section>
    </div>
  );
};

export default RezeptePage;