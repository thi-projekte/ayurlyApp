import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../../pages/RezeptePage.module.css'; 
import { FaRegClock, FaRegThumbsUp, FaThumbsUp } from 'react-icons/fa';

const FullRecipeCard = ({ item, onLikeToggle, likingId }) => {
    return (
        <div className={styles.recipeCard} style={{ maxWidth: '100%', flexBasis: '100%' }}>
            <Link to={`/rezepte/${item.contentItemId}`} className={styles.cardLinkWrapper}>
                <div className={styles.imagePreview}>
                    <img src={item.imageUrl || '/img/recipes/default_recipe_image.png'} alt={item.title} />
                </div>
                <div className={styles.recipeInfo}>
                    <p className={styles.recipeName}>{item.title}</p>
                    <p className={styles.description}>{item.previewDescription}</p>
                </div>
            </Link>
            <div className={styles.cardMetaActions}>
                <span className={styles.prepTime}>
                    {item.preparationTimeMinutes != null ? (
                        <><FaRegClock /> {item.preparationTimeMinutes} min</>
                    ) : (
                        <><FaRegClock /> -- min</>
                    )}
                </span>
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        onLikeToggle(item);
                    }}
                    className={`${styles.likeButtonCard} ${item.likedByCurrentUser ? styles.liked : ''}`}
                    disabled={likingId === item.contentItemId}
                >
                    {likingId === item.contentItemId ? '...' : (item.likedByCurrentUser ? <FaThumbsUp /> : <FaRegThumbsUp />)}
                    <span className={styles.likeCountCard}>{item.likeCount}</span>
                </button>
            </div>
            <Link to={`/rezepte/${item.contentItemId}`} className={styles.discoverRecipe}>Mehr erfahren</Link>
        </div>
    );
};

export default FullRecipeCard;