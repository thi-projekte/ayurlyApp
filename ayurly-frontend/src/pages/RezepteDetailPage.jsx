import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import styles from './RezepteDetailPage.module.css';
import recipeService from '../services/recipeService'; 
import { useUser } from '../contexts/UserContext'; 
// Importiere Icons von react-icons (Font Awesome)
import { FaRegThumbsUp, FaThumbsUp, FaRegClock, FaUsers } from 'react-icons/fa'; // Oder FiThumbsUp, FiClock etc. von Feather

const RezepteDetailPage = () => {
  const { rezeptId } = useParams();
  const { isLoggedIn, login, loadingKeycloak, keycloakInstance } = useUser(); // Hole Keycloak-Status,Token-Instanz, isLoggedIn und login für Like-Button
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // loadRecipe in useEffect, um Abhängigkeiten korrekt zu handhaben
  useEffect(() => {
    // Funktion zum Laden des Rezepts definieren
    const loadRecipe = async () => {
      if (loadingKeycloak) {
        // Wenn Keycloak noch lädt, nicht fortfahren.
        // Der useEffect wird erneut getriggert, wenn loadingKeycloak sich ändert.
        return;
      }
      setLoading(true);
      setError(null);
      try {
        // recipeService.getRecipeById sollte den Token intern über keycloakService beziehen können.
        // Die Abhängigkeit von isLoggedIn stellt sicher, dass bei Login/Logout neu geladen wird,
        // und somit `likedByCurrentUser` korrekt vom Backend kommt.
        const data = await recipeService.getRecipeById(rezeptId);
        setRecipe(data);
      } catch (err) {
        setError(err.message || 'Fehler beim Laden des Rezepts.');
        console.error("Error fetching recipe:", err);
      } finally {
        setLoading(false);
      }
    };

    loadRecipe(); // Führe die Ladefunktion aus

  }, [rezeptId, loadingKeycloak, isLoggedIn]); // Abhängigkeiten: Neu laden, wenn ID, Keycloak-Ladezustand oder Login-Status sich ändert

  const handleLikeToggle = async () => {
    if (!isLoggedIn) {
      alert("Bitte melde dich an, um Rezepte zu liken.");
      login(); // Keycloak Login starten
      return;
    }
    if (!recipe) return;

    setLoading(true); // Zeige einen Ladeindikator während der Like-Aktion
    try {
      let updatedRecipeData;
      if (recipe.likedByCurrentUser) {
        updatedRecipeData = await recipeService.unlikeRecipe(recipe.id);
      } else {
        updatedRecipeData = await recipeService.likeRecipe(recipe.id);
      }
      setRecipe(prevRecipe => ({
        ...prevRecipe,
        likeCount: updatedRecipeData.likeCount,
        likedByCurrentUser: updatedRecipeData.likedByCurrentUser,
      }));
    } catch (err) {
      setError(err.message || "Fehler bei der Like-Aktion.");
      console.error("Error toggling like:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loadingKeycloak || loading) { // Zeige Ladeindikator, wenn Keycloak oder Rezeptdaten laden
    return <div className={styles.loading}>Rezept wird geladen...</div>;
  }

  if (error) {
    return <div className={styles.error}>Fehler: {error}</div>;
  }

  if (!recipe) {
    return <div className={styles.error}>Rezept nicht gefunden.</div>;
  }

  const getDoshaTagClass = (dosha) => {
    switch (dosha.toLowerCase()) {
        case 'vata': return styles.doshaTagVata;
        case 'pitta': return styles.doshaTagPitta;
        case 'kapha': return styles.doshaTagKapha;
        case 'tridoshic': return styles.doshaTagTridoshic;
        default: return '';
    }
  };

  const benefitsList = Array.isArray(recipe.benefits) ? recipe.benefits.map(b => b.trim()).filter(b => b) : [];


   return (
    <div className={styles.pageContainer}>
      <article className={styles.recipeDetailWrapper}>
        <section className={styles.heroSection}>
          <div className={styles.heroImageContainer}>
            <img src={recipe.imageUrl || '/img/recipes/default_recipe_image.jpg'} alt={recipe.title} className={styles.heroImage} />
          </div>
          <div className={styles.heroInfo}>
            <h1 className={styles.recipeTitle}>{recipe.title}</h1>
            <div className={styles.metaInfoBar}>
              {recipe.preparationTimeMinutes && (
                <span className={styles.metaItem}>
                  <FaRegClock /> {/* react-icon */}
                  {recipe.preparationTimeMinutes} min
                </span>
              )}
              {recipe.numberOfPortions && (
                <span className={styles.metaItem}>
                  <FaUsers /> {/* react-icon */}
                  {recipe.numberOfPortions} Portionen
                </span>
              )}
              <button
                onClick={handleLikeToggle}
                className={`${styles.likeButton} ${recipe.likedByCurrentUser ? styles.liked : ''}`}
                aria-label={recipe.likedByCurrentUser ? "Unlike this recipe" : "Like this recipe"}
                disabled={loading} // Deaktiviere Button während Like-Aktion
              >
                {recipe.likedByCurrentUser ? <FaThumbsUp /> : <FaRegThumbsUp />} {/* react-icons */}
                <span className={styles.likeCount}>{recipe.likeCount}</span>
              </button>
            </div>
             {recipe.doshaTypes && recipe.doshaTypes.length > 0 && (
              <div className={styles.doshaTags}>
                {recipe.doshaTypes.map(d => (
                  <span key={d} className={`${styles.doshaTag} ${getDoshaTagClass(d)}`}>
                    {d.charAt(0).toUpperCase() + d.slice(1)}
                  </span>
                ))}
              </div>
            )}
            <p className={styles.recipeDescription}>{recipe.description}</p>
            {benefitsList.length > 0 && (
              <div className={styles.benefitsSection}>
                <h3 className={styles.subSectionTitle}>Vorteile</h3>
                <ul className={styles.benefitsList}>
                  {benefitsList.map((benefit, index) => (
                    <li key={index}>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>

        <section className={styles.contentSection}>
          {recipe.ingredients && recipe.ingredients.length > 0 && (
            <div className={styles.ingredientsContainer}>
              <h2 className={styles.sectionTitle}>Zutaten</h2>
              <ul className={styles.ingredientsList}>
                {recipe.ingredients.map((ingredient, index) => (
                  <li key={index}>
                    <span className={styles.ingredientQuantity}>{ingredient.quantity} {ingredient.unit}</span>
                    <span className={styles.ingredientName}>{ingredient.name}</span>
                    {ingredient.notes && <span className={styles.ingredientNotes}>({ingredient.notes})</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {recipe.preparationSteps && recipe.preparationSteps.length > 0 && (
            <div className={styles.preparationContainer}>
              <h2 className={styles.sectionTitle}>Zubereitung</h2>
              <ol className={styles.preparationList}>
                {recipe.preparationSteps.map((step) => (
                  <li key={step.stepNumber} className={styles.preparationStep}>
                    <span className={styles.stepNumber}>{step.stepNumber}.</span>
                    <p className={styles.stepDescription}>{step.description}</p>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </section>

        <div className={styles.backLinkContainer}>
            <Link to="/rezepte" className={styles.backLink}>
                Zurück zur Rezeptübersicht
            </Link>
        </div>
      </article>
    </div>
  );
};

export default RezepteDetailPage;