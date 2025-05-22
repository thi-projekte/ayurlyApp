import React, { useState, useEffect } from 'react'; 
import { Link } from 'react-router-dom';
import styles from './RezeptePage.module.css';
import recipeService from '../services/recipeService';
import { useUser } from '../contexts/UserContext';

const RezeptePage = () => {
  const { doshaType: contextDoshaType, loadingKeycloak } = useUser();

  const [allRecipes, setAllRecipes] = useState([]); // Speichert *alle* geladenen Rezepte
  const [filteredRecipes, setFilteredRecipes] = useState([]); // Die aktuell anzuzeigenden, gefilterten Rezepte
  const [selectedDosha, setSelectedDosha] = useState('all'); // Default-Filter
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [initialFilterApplied, setInitialFilterApplied] = useState(false);


  // 1. Effekt: Setze den initialen selectedDosha basierend auf dem UserContext
  useEffect(() => {
    if (!loadingKeycloak) { // Warten bis Keycloak-Initialisierung abgeschlossen ist
      if (contextDoshaType) {
        setSelectedDosha(contextDoshaType.toLowerCase());
      } else {
        setSelectedDosha('all'); // Fallback, wenn kein Dosha im Context bekannt
      }
      // Wichtig: Wir signalisieren noch nicht, dass der Filter angewendet wurde,
      // da das Filtern erst nach dem Laden der `allRecipes` Sinn ergibt.
    }
  }, [contextDoshaType, loadingKeycloak]);

  // 2. Effekt: Lade *alle* Rezepte initial von der API
  useEffect(() => {
    const fetchAllRecipesFromApi = async () => {
      setLoading(true);
      setError(null);
      try {
        const fetchedData = await recipeService.getAllRecipes(null); // null, um alle Rezepte zu laden
        setAllRecipes(fetchedData || []);
      } catch (err) {
        setError(err.message || "Fehler beim Laden der Rezepte.");
        setAllRecipes([]);
        console.error("Error fetching all recipes:", err);
      } finally {
        setLoading(false);
      }
    };

    // Nur ausführen, wenn Keycloak bereit ist, um initiale Race Conditions mit selectedDosha zu vermeiden
    if (!loadingKeycloak) {
        fetchAllRecipesFromApi();
    }
  }, [loadingKeycloak]); // Abhängigkeit von loadingKeycloak, um nach dessen Abschluss zu laden

  // 3. Effekt: Filter die Rezepte clientseitig, wenn sich selectedDosha oder allRecipes ändern.
  // Dieser Effekt wird auch getriggert, nachdem allRecipes geladen wurden und selectedDosha initial gesetzt wurde.
  useEffect(() => {
    // Stelle sicher, dass wir nicht filtern, bevor die Rezepte geladen sind oder Keycloak initialisiert ist.
    if (loadingKeycloak || loading) {
      // Wenn noch geladen wird (entweder Keycloak oder die Rezepte),
      // warte ab, bevor gefiltert wird. filteredRecipes wird dann beim nächsten Durchlauf gesetzt.
      return;
    }

    let recipesToFilter = allRecipes;
    if (selectedDosha === 'all') {
      setFilteredRecipes(recipesToFilter);
    } else {
      setFilteredRecipes(
        recipesToFilter.filter(recipe =>
          recipe.doshaTypes && recipe.doshaTypes.map(d => d.toLowerCase()).includes(selectedDosha)
        )
      );
    }
    
    // Signalisiere, dass der (initiale) Filterprozess abgeschlossen ist,
    // nachdem allRecipes geladen und der selectedDosha berücksichtigt wurde.
    if (!loading && !initialFilterApplied) {
        setInitialFilterApplied(true);
    }

  }, [selectedDosha, allRecipes, loadingKeycloak, loading, initialFilterApplied]);


  const handleDoshaChange = (event) => {
    setSelectedDosha(event.target.value);
  };


  // Ladezustand anzeigen
  // Zeige "Initialisiere Filter...", wenn Keycloak lädt ODER der initiale Filter noch nicht angewendet wurde,
  // nachdem die Rezepte prinzipiell geladen sein könnten.
  if (loadingKeycloak || (loading && allRecipes.length === 0) || (!initialFilterApplied && !loading && !error)) {
    return <div className={styles.loadingMessage}>Lade Rezepte und Filter...</div>;
  }

  if (error) {
    return <div className={styles.noRecipesMessage}>Fehler: {error}</div>;
  }

  return (
    <div className={styles.mainContent}>
      <section className={styles.filterSection}>
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
          // Zeige diese Nachricht nur, wenn nicht mehr geladen wird und kein Fehler vorliegt,
          // aber keine Rezepte zum Filter passen (oder gar keine Rezepte da sind).
          !loading && !error && (
            <p className={styles.noRecipesMessage}>
              {allRecipes.length === 0 
                ? "Aktuell sind keine Rezepte verfügbar." 
                : `Keine Rezepte für die Auswahl "${selectedDosha === 'all' ? 'Alle' : selectedDosha.charAt(0).toUpperCase() + selectedDosha.slice(1)}" gefunden.`
              }
            </p>
          )
        )}
      </section>
    </div>
  );
};

export default RezeptePage;