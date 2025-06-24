import React, { useState, useEffect } from 'react';
import { useUser } from '../../contexts/UserContext';
import styles from './PreferencesModal.module.css';
import Modal from '../UI/Modal';
import { FaSave, FaTimes } from 'react-icons/fa';

const tilePreferences = [
    { key: 'showMorningFlow', label: '🌞 MorningFlow' },
    { key: 'showEveningFlow', label: '🌙 EveningFlow' },
    { key: 'showRestCycle', label: '💤 RestCycle' },
    { key: 'showZenMove', label: '🧘‍♀️ ZenMove' },
    { key: 'showNourishCycle', label: '🍽️ NourishCycle' }
];

const PreferencesModal = ({ show, onClose }) => {
    const { userProfile, updateUserPreferences } = useUser();
    const [preferences, setPreferences] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (userProfile) {
            const initialPrefs = tilePreferences.reduce((acc, pref) => {
                acc[pref.key] = userProfile[pref.key] ?? true; // Default auf true, falls nicht vorhanden
                return acc;
            }, {});
            setPreferences(initialPrefs);
        }
    }, [userProfile, show]);

    const handleToggle = (key) => {
        setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSave = async () => {
        setIsLoading(true);
        setError('');
        try {
            await updateUserPreferences(preferences);
            onClose(); // Modal bei Erfolg schließen
        } catch (err) {
            setError('Fehler beim Speichern der Einstellungen.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal show={show} onClose={onClose}>
            <div className={styles.modalHeader}>
                <h2>Anzeige-Präferenzen</h2>
                <p>Wähle aus, welche täglichen Routinen auf deinem Dashboard angezeigt werden sollen.</p>
            </div>
            <div className={styles.preferencesList}>
                {tilePreferences.map(pref => (
                    <div key={pref.key} className={styles.preferenceItem}>
                        <label htmlFor={pref.key} className={styles.preferenceLabel}>
                            {pref.label}
                        </label>
                        <label className={styles.switch}>
                            <input
                                type="checkbox"
                                id={pref.key}
                                checked={preferences[pref.key] || false}
                                onChange={() => handleToggle(pref.key)}
                            />
                            <span className={styles.slider}></span>
                        </label>
                    </div>
                ))}
            </div>
            {error && <p className={styles.errorMessage}>{error}</p>}
            <div className={styles.modalActions}>
                <button onClick={onClose} className={styles.cancelButton} disabled={isLoading}>
                    <FaTimes /> Abbrechen
                </button>
                <button onClick={handleSave} className={styles.saveButton} disabled={isLoading}>
                    {isLoading ? 'Speichern...' : <><FaSave /> Speichern</>}
                </button>
            </div>
        </Modal>
    );
};

export default PreferencesModal;