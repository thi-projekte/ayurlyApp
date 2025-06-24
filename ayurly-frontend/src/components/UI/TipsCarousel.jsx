import React from 'react';
import styles from './TipsCarousel.module.css';

const TipsCarousel = ({ tips }) => {
    return (
        <div className={styles.carouselContainer}>
            <div className={styles.carouselTrack}>
                {tips.map((tip, index) => (
                    <div key={index} className={styles.tipCard}>
                        <h4 className={styles.tipTitle}>{tip.title}</h4>
                        <p className={styles.tipText}>{tip.text}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TipsCarousel;