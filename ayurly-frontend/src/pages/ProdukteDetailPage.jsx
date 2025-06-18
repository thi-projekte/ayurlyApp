import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import styles from './ProdukteDetailPage.module.css';
import productService from '../services/productService';
import { useUser } from '../contexts/UserContext';
import { FaRegThumbsUp, FaThumbsUp } from 'react-icons/fa';

const ProdukteDetailPage = () => {
    const { produktId } = useParams();
    const { isLoggedIn, login, loadingKeycloak } = useUser();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadProduct = async () => {
            if (loadingKeycloak) return;
            setLoading(true);
            try {
                const data = await productService.getProductById(produktId);
                setProduct(data);
            } catch (err) {
                setError(err.message || 'Fehler beim Laden des Produkts.');
            } finally {
                setLoading(false);
            }
        };
        loadProduct();
    }, [produktId, loadingKeycloak, isLoggedIn]);

    const handleLikeToggle = async () => {
        if (!isLoggedIn) {
            login();
            return;
        }
        if (!product) return;

        setLoading(true);
        try {
            const updated = product.likedByCurrentUser
                ? await productService.unlikeProduct(product.id)
                : await productService.likeProduct(product.id);
            setProduct(p => ({ ...p, likeCount: updated.likeCount, likedByCurrentUser: updated.likedByCurrentUser }));
        } catch (err) {
            setError(err.message || "Fehler bei der Like-Aktion.");
        } finally {
            setLoading(false);
        }
    };

    if (loading || loadingKeycloak) return <div className={styles.loading}>Produkt wird geladen...</div>;
    if (error) return <div className={styles.error}>Fehler: {error}</div>;
    if (!product) return <div className={styles.error}>Produkt nicht gefunden.</div>;
    
    const getDoshaTagClass = (dosha) => {
        switch (dosha?.toLowerCase()) {
            case 'vata': return styles.doshaTagVata;
            case 'pitta': return styles.doshaTagPitta;
            case 'kapha': return styles.doshaTagKapha;
            default: return '';
        }
    };

    const formatPrice = (value) => {
        return value.toFixed(2).replace('.', ',');
    };

    const calculatePricePerKg = () => {
        if (!product.price || !product.weight || product.weight <= 0) return null;

        let pricePerKg;
        if (product.unit === 'g' ) {
            pricePerKg = (product.price / product.weight) * 1000;
        } else { 
            pricePerKg = product.price / product.weight;
        }
        return `( ${formatPrice(pricePerKg)} € / kg )`;
    };

    return (
        <div className={styles.pageContainer}>
            <article className={styles.productDetailWrapper}>
                <section className={styles.mainSection}>
                    <div className={styles.imageContainer}>
                        <img src={product.imageUrl || '/img/recipes/default_recipe_image.png'} alt={product.title} />
                    </div>
                    <div className={styles.infoContainer}>
                        <h1 className={styles.title}>{product.title}</h1>
                        {product.doshaTypes?.length > 0 && (
                            <div className={styles.doshaTags}>
                                {product.doshaTypes.map(d => <span key={d} className={`${styles.doshaTag} ${getDoshaTagClass(d)}`}>{d}</span>)}
                            </div>
                        )}
                        <p className={styles.description}>{product.description}</p>
                        
                        {product.price && (
                            <div className={styles.priceContainer}>
                                <p className={styles.price}>{formatPrice(product.price)} €</p>
                                <p className={styles.pricePerUnit}>{product.weight} {product.unit} {calculatePricePerKg()}</p>
                                <br></br>
                                <p className={styles.pricePerUnit}> Preise inkl. MwSt. ggf. zzgl. Versand</p>
                                <p className={styles.pricePerUnit}> Preis wird regelmäßig aktualisiert, kann jedoch ggf. vom aktuellen Angebot des externen Anbieters abweichen.</p>
                            </div>
                        )}
                        
                        {product.benefits?.length > 0 && (
                            <div className={styles.benefitsSection}>
                                <h2>Vorteile</h2>
                                <ul>{product.benefits.map((b, i) => <li key={i}>{b}</li>)}</ul>
                            </div>
                        )}

                        {product.externalLink && (
                            <a href={product.externalLink} target="_blank" rel="noopener noreferrer" className={styles.discoverButton}>
                                Entdecken
                            </a>
                        )}
                    </div>
                </section>

                <section className={styles.detailsGrid}>
                    {product.activeIngredients?.length > 0 && (
                        <div className={styles.gridColumn}>
                            <h2>Wirkstoffe</h2>
                            <div className={styles.cardList}>
                                {product.activeIngredients.map((ing, i) => <div key={i} className={styles.card}>{ing}</div>)}
                            </div>
                        </div>
                    )}
                    {product.applicationSteps?.length > 0 && (
                        <div className={styles.gridColumn}>
                            <h2>Anwendung</h2>
                            <ol className={styles.stepList}>
                                {product.applicationSteps.map(step => <li key={step.stepNumber}>{step.description}</li>)}
                            </ol>
                        </div>
                    )}
                </section>

                <div className={styles.backLinkContainer}>
                    <Link to="/produkte" className={styles.backLink}>Zurück zur Produktübersicht</Link>
                </div>
            </article>
        </div>
    );
};

export default ProdukteDetailPage;