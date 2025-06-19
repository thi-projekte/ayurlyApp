import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './RezeptePage.module.css';
import yogaExerciseService from '../services/yogaExerciseService';
import { useUser } from '../contexts/UserContext';
import { FaRegThumbsUp, FaThumbsUp } from 'react-icons/fa';

const TRIDOSHIC_VALUE = "tridoshic";

const YogaPage = () => {
    const { doshaType: contextDoshaType, loadingKeycloak, isLoggedIn, login } = useUser();
    const [allExercises, setAllExercises] = useState([]);
    const [filteredExercises, setFilteredExercises] = useState([]);
    const [selectedDosha, setSelectedDosha] = useState('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [likingId, setLikingId] = useState(null);

    useEffect(() => {
        if (!loadingKeycloak) {
            setSelectedDosha(contextDoshaType ? contextDoshaType.toLowerCase() : 'all');
        }
    }, [contextDoshaType, loadingKeycloak]);

    useEffect(() => {
        const fetchExercises = async () => {
            if (loadingKeycloak) return;
            setLoading(true);
            try {
                const data = await yogaExerciseService.getAllYogaExercises();
                setAllExercises(data || []);
            } catch (err) {
                setError(err.message || "Fehler beim Laden der Yoga-Übungen.");
            } finally {
                setLoading(false);
            }
        };
        fetchExercises();
    }, [isLoggedIn, loadingKeycloak]);

    useEffect(() => {
        let exercisesToDisplay = (selectedDosha === 'all')
            ? allExercises
            : allExercises.filter(ex => 
                ex.doshaTypes?.map(d => d.toLowerCase()).includes(selectedDosha) || 
                ex.doshaTypes?.map(d => d.toLowerCase()).includes(TRIDOSHIC_VALUE)
              );
        setFilteredExercises(exercisesToDisplay);
    }, [selectedDosha, allExercises]);

    const handleDoshaChange = (event) => {
        setSelectedDosha(event.target.value);
    };

    const handleLikeToggle = async (exerciseId) => {
        if (!isLoggedIn) {
            login();
            return;
        }
        const exercise = allExercises.find(e => e.id === exerciseId);
        if (!exercise) return;

        setLikingId(exerciseId);
        try {
            const updatedData = exercise.likedByCurrentUser
                ? await yogaExerciseService.unlikeYogaExercise(exerciseId)
                : await yogaExerciseService.likeYogaExercise(exerciseId);
            
            setAllExercises(prev => prev.map(e => e.id === exerciseId ? { ...e, ...updatedData } : e));
        } finally {
            setLikingId(null);
        }
    };

    if (loading || loadingKeycloak) return <div className={styles.loadingMessage}>Lade Yoga-Übungen...</div>;
    if (error) return <div className={styles.noRecipesMessage}>Fehler: {error}</div>;

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
                {filteredExercises.map(ex => (
                    <div key={ex.id} className={styles.recipeCard}>
                        <Link to={`/yoga/${ex.id}`} className={styles.cardLinkWrapper}>
                            <div className={styles.imagePreview}>
                                <img src={ex.imageUrl || '/img/yoga/default.png'} alt={ex.title} />
                            </div>
                            <div className={styles.recipeInfo}>
                                <p className={styles.recipeName}>{ex.title}</p>
                                <p className={styles.description}>{ex.previewDescription}</p>
                            </div>
                        </Link>
                        <div className={styles.cardMetaActions}>
                            <span></span> {/* Placeholder */}
                            <button
                                onClick={() => handleLikeToggle(ex.id)}
                                disabled={likingId === ex.id}
                                className={`${styles.likeButtonCard} ${ex.likedByCurrentUser ? styles.liked : ''}`}
                            >
                                {ex.likedByCurrentUser ? <FaThumbsUp /> : <FaRegThumbsUp />}
                                <span className={styles.likeCountCard}>{ex.likeCount}</span>
                            </button>
                        </div>
                        <Link to={`/yoga/${ex.id}`} className={styles.discoverRecipe}>
                            Anleitung ansehen
                        </Link>
                    </div>
                ))}
            </section>
        </div>
    );
};

export default YogaPage;