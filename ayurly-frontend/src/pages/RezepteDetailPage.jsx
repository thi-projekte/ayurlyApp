import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import styles from './RezepteDetailPage.module.css';

// Dummy-Rezeptdaten (sollten idealerweise aus einem Service/Kontext kommen oder per Prop übergeben werden,
// aber für dieses Beispiel holen wir sie uns nochmal, wie in RezeptePage)
// In einer echten Anwendung würdest du hier einen API-Call machen, um das spezifische Rezept per ID zu laden.
const dummyRecipes = [
  {
    id: 'golden-gut-curry',
    name: 'Golden Gut Curry',
    image: '/img/recipes/golden gut curry.jpg',
    description: 'Mit heilenden Kräutern verfeinert, stärkt dieses Curry deine Verdauung und lässt dein inneres Strahlen erblühen.',
    dosha: ['vata', 'pitta', 'kapha'],
    ingredients: [
      '1 EL Ghee oder Kokosöl',
      '1 Zwiebel, gehackt',
      '2 Knoblauchzehen, gehackt',
      '1 Stück Ingwer (ca. 2 cm), gerieben',
      '1 TL Kurkumapulver',
      '1/2 TL Kreuzkümmelpulver',
      '1/2 TL Korianderpulver',
      '1 Prise Asafoetida (Hing)',
      '400g Süßkartoffeln, gewürfelt',
      '200g Karotten, in Scheiben',
      '1 Dose (400ml) Kokosmilch',
      '1 Tasse Gemüsebrühe',
      '100g frischer Spinat',
      'Salz und Pfeffer nach Geschmack',
      'Frischer Koriander zum Garnieren',
    ],
    instructions: [
      'Ghee oder Kokosöl in einem großen Topf bei mittlerer Hitze erhitzen.',
      'Zwiebel, Knoblauch und Ingwer hinzufügen und glasig dünsten.',
      'Kurkuma, Kreuzkümmel, Koriander und Asafoetida einrühren und 1 Minute mitdünsten, bis es duftet.',
      'Süßkartoffeln und Karotten hinzufügen und kurz anbraten.',
      'Mit Kokosmilch und Gemüsebrühe ablöschen. Aufkochen lassen, dann Hitze reduzieren und ca. 15-20 Minuten köcheln lassen, bis das Gemüse weich ist.',
      'Den frischen Spinat unterheben und zusammenfallen lassen.',
      'Mit Salz und Pfeffer abschmecken.',
      'Mit frischem Koriander garniert servieren.',
    ],
  },
  {
    id: 'kitchari-detox',
    name: 'Kitchari Detox Bowl',
    image: '/img/recipes/kitchari.jpg',
    description: 'Ein leicht verdauliches und nährendes Gericht, perfekt zur Reinigung und Stärkung.',
    dosha: ['vata', 'pitta', 'kapha'],
    ingredients: ['1/2 Tasse Mung Dal (geschälte Mungbohnen)', '1/2 Tasse Basmatireis', '...weitere Zutaten...'],
    instructions: ['Reis und Dal waschen...', '...weitere Schritte...'],
  },
  {
    id: 'vata-beruhigungs-suppe',
    name: 'Vata Beruhigungs-Suppe',
    image: '/img/recipes/vata_suppe.jpg',
    description: 'Eine wärmende und erdende Suppe, ideal um Vata auszugleichen und zur Ruhe zu kommen.',
    dosha: ['vata'],
    ingredients: ['Zutaten für Vata-Suppe...'],
    instructions: ['Zubereitung für Vata-Suppe...'],
  },
  {
    id: 'pitta-kuehl-salat',
    name: 'Pitta Kühlender Salat',
    image: '/img/recipes/pitta_salat.jpg',
    description: 'Ein erfrischender und kühlender Salat, der Pitta besänftigt und den Geist klärt.',
    dosha: ['pitta'],
    ingredients: ['Zutaten für Pitta-Salat...'],
    instructions: ['Zubereitung für Pitta-Salat...'],
  },
  {
    id: 'kapha-anregungs-eintopf',
    name: 'Kapha Anregungs-Eintopf',
    image: '/img/recipes/kapha_eintopf.jpg',
    description: 'Ein leichter und anregender Eintopf, der Kapha stimuliert und Energie spendet.',
    dosha: ['kapha'],
    ingredients: ['Zutaten für Kapha-Eintopf...'],
    instructions: ['Zubereitung für Kapha-Eintopf...'],
  }
];


const RezepteDetailPage = () => {
  const { rezeptId } = useParams(); // Holt die 'rezeptId' aus der URL
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Finde das Rezept in den Dummy-Daten
    // In einer echten App: fetch(`/api/recipes/${rezeptId}`)
    const foundRecipe = dummyRecipes.find(r => r.id === rezeptId);
    if (foundRecipe) {
      setRecipe(foundRecipe);
    }
    setLoading(false);
  }, [rezeptId]);

  if (loading) {
    return <div className={styles.loading}>Rezept wird geladen...</div>;
  }

  if (!recipe) {
    return <div className={styles.error}>Rezept nicht gefunden.</div>;
  }

  const getDoshaTagClass = (dosha) => {
    switch (dosha.toLowerCase()) {
        case 'vata': return styles.doshaTagVata;
        case 'pitta': return styles.doshaTagPitta;
        case 'kapha': return styles.doshaTagKapha;
        default: return '';
    }
  }

  return (
    <div className={styles.pageContainer}>
      <article className={styles.recipeDetail}>
        <header className={styles.recipeHeader}>
          <h1 className={styles.recipeTitle}>{recipe.name}</h1>
          {recipe.image && (
            <img src={recipe.image} alt={recipe.name} className={styles.recipeImage} />
          )}
          <p className={styles.recipeDescription}>{recipe.description}</p>
          {recipe.dosha && recipe.dosha.length > 0 && (
            <div className={styles.doshaTags}>
              {recipe.dosha.map(d => (
                <span key={d} className={`${styles.doshaTag} ${getDoshaTagClass(d)}`}>
                  {d.charAt(0).toUpperCase() + d.slice(1)}
                </span>
              ))}
            </div>
          )}
        </header>

        {recipe.ingredients && recipe.ingredients.length > 0 && (
          <section className={styles.recipeSection}>
            <h2 className={styles.sectionTitle}>Zutaten</h2>
            <ul className={styles.ingredientsList}>
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index}>{ingredient}</li>
              ))}
            </ul>
          </section>
        )}

        {recipe.instructions && recipe.instructions.length > 0 && (
          <section className={styles.recipeSection}>
            <h2 className={styles.sectionTitle}>Zubereitung</h2>
            <ol className={styles.instructionsList}> {/* ol für nummerierte Liste */}
              {recipe.instructions.map((instruction, index) => (
                <li key={index}>{instruction}</li>
              ))}
            </ol>
          </section>
        )}
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