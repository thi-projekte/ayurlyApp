import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './RezeptePage.module.css'; // gleiches CSS für Konsistenz
import productService from '../services/productService';
import { useUser } from '../contexts/UserContext';
import { FaRegThumbsUp, FaThumbsUp, FaEuroSign, FaWeightHanging } from 'react-icons/fa';

const TRIDOSHIC_VALUE = "tridoshic";

const ProduktePage = () => {
    const { doshaType: contextDoshaType, loadingKeycloak, isLoggedIn, login } = useUser();
    const [allProducts, setAllProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [selectedDosha, setSelectedDosha] = useState('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [likingProductId, setLikingProductId] = useState(null);

    useEffect(() => {
        if (!loadingKeycloak) {
            setSelectedDosha(contextDoshaType ? contextDoshaType.toLowerCase() : 'all');
        }
    }, [contextDoshaType, loadingKeycloak]);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await productService.getAllProducts();
                setAllProducts(data || []);
            } catch (err) {
                setError(err.message || "Fehler beim Laden der Produkte.");
            } finally {
                setLoading(false);
            }
        };
        if (!loadingKeycloak) {
            fetchProducts();
        }
    }, [loadingKeycloak, isLoggedIn]);

    useEffect(() => {
        if (loading) return;
        
        let productsToDisplay = (selectedDosha === 'all')
            ? allProducts
            : allProducts.filter(p => 
                p.doshaTypes?.map(d => d.toLowerCase()).includes(selectedDosha) || 
                p.doshaTypes?.map(d => d.toLowerCase()).includes(TRIDOSHIC_VALUE)
              );

        setFilteredProducts(productsToDisplay);

    }, [selectedDosha, allProducts, loading]);

    const handleDoshaChange = (event) => {
        setSelectedDosha(event.target.value);
    };

    const handleLikeToggle = async (productId) => {
        if (!isLoggedIn) {
            alert("Bitte melde dich an, um Produkte zu liken.");
            login();
            return;
        }
        const product = allProducts.find(p => p.id === productId);
        if (!product) return;

        setLikingProductId(productId);
        try {
            const updatedProduct = product.likedByCurrentUser
                ? await productService.unlikeProduct(productId)
                : await productService.likeProduct(productId);

            setAllProducts(prev => prev.map(p => p.id === productId ? { ...p, ...updatedProduct } : p));
        } catch (err) {
            setError(err.message || "Fehler bei der Like-Aktion.");
        } finally {
            setLikingProductId(null);
        }
    };
    
    if (loading || loadingKeycloak) {
        return <div className={styles.loadingMessage}>Lade Produkte...</div>;
    }
    if (error) {
        return <div className={styles.noRecipesMessage}>Fehler: {error}</div>;
    }

    return (
        <div className={styles.mainContent}>
            <section className={styles.filterSection}>
                <div className={styles.toggleGroup}>
                    {['all', 'vata', 'pitta', 'kapha'].map(dosha => {
                        const labels = { all: 'Alle', vata: '🌀 Vata', pitta: '🔥 Pitta', kapha: '🌱 Kapha' };
                        return (
                            <label key={dosha} className={`${styles.toggleLabel} ${selectedDosha === dosha ? styles.toggleLabelChecked : ''}`}>
                                <input
                                    type="radio"
                                    name="dosha"
                                    value={dosha}
                                    className={styles.toggleButton}
                                    checked={selectedDosha === dosha}
                                    onChange={handleDoshaChange}
                                />
                                {labels[dosha]}
                            </label>
                        );
                    })}
                </div>
            </section>
            <section className={styles.recipesGrid}>
                {filteredProducts.length > 0 ? (
                    filteredProducts.map(product => (
                        <div key={product.id} className={styles.recipeCard}>
                            <Link to={`/produkte/${product.id}`} className={styles.cardLinkWrapper}>
                                <div className={styles.imagePreview}>
                                    <img src={product.imageUrl || '/img/recipes/default_recipe_image.png'} alt={product.title} />
                                </div>
                                <div className={styles.recipeInfo}>
                                    <p className={styles.recipeName}>{product.title}</p>
                                    <p className={styles.description}>{product.previewDescription}</p>
                                </div>
                            </Link>
                            <div className={styles.cardMetaActions}>
                                <div className={styles.cardMetaItem}>
                                  {product.price && <><FaEuroSign /> {product.price.toFixed(2).replace('.', ',')}</>}
                                </div>
                                <div className={styles.cardMetaItem}>
                                  {product.weight > 0 && <><FaWeightHanging /> {product.weight} {product.unit}</>}
                                </div>
                                <button
                                    onClick={() => handleLikeToggle(product.id)}
                                    className={`${styles.likeButtonCard} ${product.likedByCurrentUser ? styles.liked : ''}`}
                                    disabled={likingProductId === product.id}
                                >
                                    {likingProductId === product.id ? '...' : (product.likedByCurrentUser ? <FaThumbsUp /> : <FaRegThumbsUp />)}
                                    <span className={styles.likeCountCard}>{product.likeCount}</span>
                                </button>
                            </div>
                            <Link to={`/produkte/${product.id}`} className={styles.discoverRecipe}>
                                Mehr erfahren
                            </Link>
                        </div>
                    ))
                ) : (
                    <p className={styles.noRecipesMessage}>Keine Produkte für diese Auswahl gefunden.</p>
                )}
            </section>
        </div>
    );
};

export default ProduktePage;