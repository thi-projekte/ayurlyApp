import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import styles from './RezepteDetailPage.module.css';
import recipeService from '../services/recipeService'; // NEU
import { useUser } from '../contexts/UserContext'; // NEU für Like-Funktion

// Importiere Icons (Beispiel, passe Pfade/Namen an deine Flaticon-Integration an)
// Alternativ kannst du SVG-Icons direkt als Komponenten importieren.
// Für dieses Beispiel verwenden wir FontAwesome-ähnliche Klassen als Platzhalter für Flaticon.
// Du müsstest sicherstellen, dass die entsprechenden Flaticon-Klassen global verfügbar sind
// oder die i-Tags durch img/svg ersetzen.
// z.B. <i className="fi fi-rr-clock-five"></i> für Zeit

const RezepteDetailPage = () => {
  const { rezeptId } = useParams();
  const { isLoggedIn, login } = useUser(); // isLoggedIn und login für Like-Button
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRecipe = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await recipeService.getRecipeById(rezeptId);
      setRecipe(data);
    } catch (err) {
      setError(err.message || 'Fehler beim Laden des Rezepts.');
      console.error("Error fetching recipe:", err);
    } finally {
      setLoading(false);
    }
  }, [rezeptId]);

  useEffect(() => {
    fetchRecipe();
  }, [fetchRecipe]);

  const handleLikeToggle = async () => {
    if (!isLoggedIn) {
      // Optional: Hinweis anzeigen oder direkt zum Login weiterleiten
      alert("Bitte melde dich an, um Rezepte zu liken.");
      login(); // Keycloak Login starten
      return;
    }
    if (!recipe) return;

    try {
      let updatedRecipeData;
      if (recipe.likedByCurrentUser) {
        updatedRecipeData = await recipeService.unlikeRecipe(recipe.id);
      } else {
        updatedRecipeData = await recipeService.likeRecipe(recipe.id);
      }
      // Backend sollte das aktualisierte Rezept oder zumindest den neuen Like-Status/Count zurückgeben.
      // RecipeContentResource.java gibt LikeResponseDto zurück.
      // Wir aktualisieren das Frontend basierend auf dieser Antwort.
      setRecipe(prevRecipe => ({
        ...prevRecipe,
        likeCount: updatedRecipeData.likeCount,
        likedByCurrentUser: updatedRecipeData.likedByCurrentUser,
      }));
    } catch (err) {
      setError(err.message || "Fehler bei der Like-Aktion.");
      console.error("Error toggling like:", err);
    }
  };


  if (loading) {
    return <div className={styles.loading}>Rezept wird geladen...</div>;
  }

  if (error) {
    return <div className={styles.error}>Fehler: {error}</div>;
  }

  if (!recipe) {
    return <div className={styles.error}>Rezept nicht gefunden.</div>;
  }

  // Hilfsfunktion für Dosha-Tags (aus altem Code übernommen)
  const getDoshaTagClass = (dosha) => {
    switch (dosha.toLowerCase()) {
        case 'vata': return styles.doshaTagVata;
        case 'pitta': return styles.doshaTagPitta;
        case 'kapha': return styles.doshaTagKapha;
        case 'tridoshic': return styles.doshaTagTridoshic;
        default: return '';
    }
  };

  // Simuliere "Benefits"-Liste aus dem String, falls API es nicht als Array liefert.
  // Besser wäre es, wenn die API `benefits` als String-Array liefert.
  // Hier ein einfacher Split bei Zeilenumbruch oder Semikolon.
  const benefitsList = Array.isArray(recipe.benefits) ? recipe.benefits.map(b => b.trim()).filter(b => b) : [];
  const benefitIcons = ["✨", "🌿", "🔥", "💨", "💧"]; // Beispiel-Icons

  return (
    <div className={styles.pageContainer}>
      <article className={styles.recipeDetailWrapper}>
        {/* Hero Section */}
        <section className={styles.heroSection}>
          <div className={styles.heroImageContainer}>
            <img src={recipe.imageUrl || '/img/recipes/default_recipe_image.jpg'} alt={recipe.title} className={styles.heroImage} />
          </div>
          <div className={styles.heroInfo}>
            <h1 className={styles.recipeTitle}>{recipe.title}</h1>
            <div className={styles.metaInfoBar}>
              {recipe.preparationTimeMinutes && (
                <span className={styles.metaItem}>
                  <i className="fi fi-rr-clock-five"></i> {/* Flaticon Beispiel */}
                  {recipe.preparationTimeMinutes} min
                </span>
              )}
              {recipe.numberOfPortions && (
                <span className={styles.metaItem}>
                  <i className="fi fi-rr-users-alt"></i> {/* Flaticon Beispiel */}
                  {recipe.numberOfPortions} Portionen
                </span>
              )}
              <button
                onClick={handleLikeToggle}
                className={`${styles.likeButton} ${recipe.likedByCurrentUser ? styles.liked : ''}`}
                aria-label={recipe.likedByCurrentUser ? "Unlike this recipe" : "Like this recipe"}
              >
                {/*<i className={`fi fi-${recipe.likedByCurrentUser ? 'ss' : 'rr'}-heart`}></i>  Solid vs Regular Heart */}
                <i className={`fi fi-${recipe.likedByCurrentUser ? 'ss' : 'rr'}-thumbs-up`}></i>
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

        {/* Content Section (Zutaten & Zubereitung) */}
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
                {recipe.preparationSteps.map((step) => ( // sortiert nach step.stepNumber in der API/DB
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