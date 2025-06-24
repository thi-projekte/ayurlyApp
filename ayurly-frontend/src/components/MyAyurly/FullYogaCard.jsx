import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../../pages/RezeptePage.module.css'; 
import { FaRegThumbsUp, FaThumbsUp } from 'react-icons/fa';

const FullYogaCard = ({ item, onLikeToggle, likingId }) => {
    return (
        <div className={styles.recipeCard} style={{ maxWidth: '100%', flexBasis: '100%' }}>
            <Link to={`/yoga/${item.contentItemId}`} className={styles.cardLinkWrapper}>
                <div className={styles.imagePreview}>
                    <img src={item.imageUrl || '/img/yoga/default.png'} alt={item.title} />
                </div>
                <div className={styles.recipeInfo}>
                    <p className={styles.recipeName}>{item.title}</p>
                    <p className={styles.description}>{item.previewDescription}</p>
                </div>
            </Link>
            <div className={styles.cardMetaActions}>
                <span style={{ flexGrow: 1 }}></span> 
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
            <Link to={`/yoga/${item.contentItemId}`} className={styles.discoverRecipe}>Anleitung ansehen</Link>
        </div>
    );
};

export default FullYogaCard;