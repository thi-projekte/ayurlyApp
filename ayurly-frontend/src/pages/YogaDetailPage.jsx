import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import styles from './YogaDetailPage.module.css';
import yogaExerciseService from '../services/yogaExerciseService';
import { useUser } from '../contexts/UserContext';
import { FaRegThumbsUp, FaThumbsUp } from 'react-icons/fa';

const YogaDetailPage = () => {
    const { yogaId } = useParams();
    const { isLoggedIn, login, loadingKeycloak } = useUser();
    const [exercise, setExercise] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadExercise = async () => {
            if (loadingKeycloak) return;
            setLoading(true);
            try {
                const data = await yogaExerciseService.getYogaExerciseById(yogaId);
                setExercise(data);
            } catch (err) {
                setError(err.message || 'Fehler beim Laden der Yoga-Übung.');
            } finally {
                setLoading(false);
            }
        };
        loadExercise();
    }, [yogaId, loadingKeycloak, isLoggedIn]);

    const getDoshaTagClass = (dosha) => {
        switch (dosha?.toLowerCase()) {
            case 'vata': return styles.doshaTagVata;
            case 'pitta': return styles.doshaTagPitta;
            case 'kapha': return styles.doshaTagKapha;
            case 'tridoshic': return styles.doshaTagTridoshic;
            default: return '';
        }
    };

    const handleLikeToggle = async () => {
        if (!isLoggedIn) {
            login();
            return;
        }
        if (!exercise) return;
        setLoading(true);
        try {
            const updatedData = exercise.likedByCurrentUser
                ? await yogaExerciseService.unlikeYogaExercise(exercise.id)
                : await yogaExerciseService.likeYogaExercise(exercise.id);
            setExercise(prev => ({ ...prev, ...updatedData }));
        } catch (err) {
            setError(err.message || "Fehler bei der Like-Aktion.");
        } finally {
            setLoading(false);
        }
    };

    if (loadingKeycloak || loading) return <div className={styles.loading}>Lade Übung...</div>;
    if (error) return <div className={styles.error}>{error}</div>;
    if (!exercise) return <div className={styles.error}>Übung nicht gefunden.</div>;

    return (
        <div className={styles.pageContainer}>
            <article className={styles.recipeDetailWrapper}>
                <section className={styles.heroSection}>
                    {exercise.videoUrl && (
                        <div className={styles.videoContainer}>
                            <video
                                key={exercise.videoUrl}
                                controls
                                autoPlay
                                muted
                                loop
                                playsInline
                                className={styles.heroVideo}
                            >
                                <source src={exercise.videoUrl} type="video/mp4" />
                                Dein Browser unterstützt das Video-Tag nicht.
                            </video>
                        </div>
                    )}
                    <div className={styles.heroInfo}>
                        <h1 className={styles.recipeTitle}>{exercise.title}</h1>
                        <div className={styles.metaInfoBar}>
                            {exercise.doshaTypes?.length > 0 && (
                                <div className={styles.doshaTags}>
                                    {exercise.doshaTypes.map(d => (
                                        <span key={d} className={`${styles.doshaTag} ${getDoshaTagClass(d)}`}>{d}</span>
                                    ))}
                                </div>
                            )}

                            <button onClick={handleLikeToggle} className={`${styles.likeButton} ${exercise.likedByCurrentUser ? styles.liked : ''}`} disabled={loading}>
                                {exercise.likedByCurrentUser ? <FaThumbsUp /> : <FaRegThumbsUp />}
                                <span className={styles.likeCount}>{exercise.likeCount}</span>
                            </button>

                            {/* <Link to="/yoga" className={styles.backLink}>Zurück</Link> */}

                        </div>

                        <p className={styles.recipeDescription}>{exercise.description}</p>
                        {exercise.effects?.length > 0 && (
                            <div className={styles.benefitsSection}>
                                <h3 className={styles.subSectionTitle}>Wirkung</h3>
                                <ul className={styles.benefitsList}>
                                    {exercise.effects.map((effect, index) => <li key={index}>{effect}</li>)}
                                </ul>
                            </div>
                        )}
                    </div>
                </section>

                <section className={styles.contentSection}>
                    <div className={styles.tipsContainer}>
                        {/* Die Überschrift wird nur angezeigt, wenn Tipps vorhanden sind */}
                        {exercise.tips && exercise.tips.length > 0 && (
                            <h2 className={styles.sectionTitle}>Zusätzliche Tipps</h2>
                        )}
                        <ul className={styles.tipsList}>
                            {exercise.tips?.map((tip, index) => <li key={index}>{tip}</li>)}
                        </ul>
                    </div>
                    <div className={styles.preparationContainer}>
                        <h2 className={styles.sectionTitle}>Anleitung</h2>
                        <div className={styles.preparationList}>
                            {exercise.steps?.map(step => (
                                <div key={step.stepNumber} className={styles.preparationStep}>
                                    <h4 className={styles.stepTitle}>{step.stepNumber}. {step.title}</h4>
                                    {step.description && <p>{step.description}</p>}
                                    {step.subSteps?.length > 0 && (
                                        <ol className={styles.subStepList}>
                                            {step.subSteps.map(sub => <li key={sub.subStepNumber} className={styles.subStepItem}>{sub.description}</li>)}
                                        </ol>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <div className={styles.backLinkContainer}>
                    <Link to="/yoga" className={styles.backLink}>Zurück zur Yoga-Übersicht</Link>
                </div>
            </article>
        </div>
    );
};

export default YogaDetailPage;