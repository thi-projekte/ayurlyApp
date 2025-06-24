import React from 'react';
import styles from './RoutineDetailModal.module.css';
import { FaRegThumbsUp, FaThumbsUp } from 'react-icons/fa';

const DetailedMicroHabit = ({ item, handleToggleDone, handleLikeToggle, isToggleDisabled }) => {
    return (
        <div className={styles.detailedItemWrapper}>
            <div className={styles.itemHeader}>
                <h3 className={styles.itemTitle}>{item.title}</h3>
                <div className={`${styles.itemMeta} ${styles.desktopVersion}`}>
                    <button onClick={() => handleLikeToggle(item)} className={`${styles.likeButton} ${item.likedByCurrentUser ? styles.liked : ''}`}>
                        {item.likedByCurrentUser ? <FaThumbsUp /> : <FaRegThumbsUp />}
                        <span>{item.likeCount}</span>
                    </button>
                    <input
                        type="checkbox"
                        id={`modal-item-${item.myAyurlyContentId}`}
                        className={styles.itemCheckbox}
                        checked={item.isDone}
                        onChange={() => handleToggleDone(item.myAyurlyContentId)}
                        disabled={isToggleDisabled(item)}
                    />
                </div>

            </div>
            <p className={styles.itemDescription}>{item.previewDescription}</p>

            <div className={`${styles.itemMeta} ${styles.mobileVersion}`}>
                <button onClick={() => handleLikeToggle(item)} className={`${styles.likeButton} ${item.likedByCurrentUser ? styles.liked : ''}`}>
                    {item.likedByCurrentUser ? <FaThumbsUp /> : <FaRegThumbsUp />}
                    <span>{item.likeCount}</span>
                </button>
                <input
                    type="checkbox"
                    id={`modal-item-${item.myAyurlyContentId}`}
                    className={styles.itemCheckbox}
                    checked={item.isDone}
                    onChange={() => handleToggleDone(item.myAyurlyContentId)}
                    disabled={isToggleDisabled(item)}
                />
            </div>

        </div>
    );
};

export default DetailedMicroHabit;