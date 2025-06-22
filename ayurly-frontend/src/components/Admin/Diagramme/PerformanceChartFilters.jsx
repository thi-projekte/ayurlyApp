import React, { useState, useEffect } from 'react';
import styles from '../../../pages/AdminPage.module.css';

const PerformanceChartFilters = ({ onFilterChange }) => {
    const [contentType, setContentType] = useState('all');
    const [userDoshaType, setUserDoshaType] = useState('all');

    useEffect(() => {
        onFilterChange({ contentType, userDoshaType });
    }, [contentType, userDoshaType, onFilterChange]);

    return (
        <div className={styles.chartFilters}>
            <select value={contentType} onChange={(e) => setContentType(e.target.value)}>
                <option value="all">Alle Content-Typen</option>
                <option value="RECIPE">Rezepte</option>
                <option value="MICROHABIT">Microhabits</option>
                <option value="PRODUCT">Produkte</option>
                <option value="YOGA_EXERCISE">Yoga</option>
            </select>
            <select value={userDoshaType} onChange={(e) => setUserDoshaType(e.target.value)}>
                <option value="all">Alle Nutzer-Doshas</option>
                <option value="Vata">Vata-Nutzer</option>
                <option value="Pitta">Pitta-Nutzer</option>
                <option value="Kapha">Kapha-Nutzer</option>
            </select>
        </div>
    );
};

export default PerformanceChartFilters;