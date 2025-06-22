import React from 'react';
import styles from '../../pages/AdminPage.module.css';

/**
 * Eine einfache, wiederverwendbare Karte zur Anzeige einer einzelnen Statistik.
 * @param {{title: string, value: number | string}} props
 */
const StatCard = ({ title, value }) => {
    return (
        <div className={styles.statCard}>
            <h3>{title}</h3>
            <p>{value}</p>
        </div>
    );
};

export default StatCard;