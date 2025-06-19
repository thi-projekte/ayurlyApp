import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import styles from './MyAyurlyPage.module.css';
import Calendar from '../components/MyAyurly/Calendar';
import Modal from '../components/UI/Modal'; // Modal importieren
import { FaEnvelope, FaCog, FaUser } from 'react-icons/fa';

const MyAyurlyPage = () => {
    const { userProfile, doshaType, accountManagementUrl } = useUser();

    // --- State für Modals ---
    const [activeModal, setActiveModal] = useState(null);

    const openModal = (modalName) => setActiveModal(modalName);
    const closeModal = () => setActiveModal(null);

    const handleDateSelect = useCallback((date) => {
        // Später zum Laden von Inhalten für das ausgewählte Datum
        console.log("Ausgewähltes Datum:", date.toLocaleDateString('de-DE'));
    }, []);

    // --- Dosha Logik (Groß-/Kleinschreibung ignorieren) ---
    const capitalizedDosha = doshaType ? doshaType.charAt(0).toUpperCase() + doshaType.slice(1).toLowerCase() : 'Unbekannt';
    
    const doshaDetails = {
        Vata: { icon: "🌀", description: "Du bist kreativ, beweglich, aber manchmal unruhig." },
        Pitta: { icon: "🔥", description: "Du bist zielstrebig, energiegeladen, aber manchmal auch hitzköpfig." },
        Kapha: { icon: "🌱", description: "Du bist stabil, liebevoll, aber neigst zur Trägheit." },
        Unbekannt: { icon: "❔", description: "Mache den Test, um dein Dosha zu entdecken." },
    };
    const currentDosha = doshaDetails[capitalizedDosha];

    const handleOpenAccountManagement = () => {
        if (accountManagementUrl) window.open(accountManagementUrl, '_blank');
    };

    const dashboardCards = [
        { id: 'MorningFlow', title: '🌞 MorningFlow', content: 'Inhalte für MorningFlow...' },
        { id: 'EveningFlow', title: '🌙 EveningFlow', content: 'Inhalte für EveningFlow...' },
        { id: 'RestCycle', title: '💤 RestCycle', content: 'Inhalte für RestCycle...' },
        { id: 'ZenMove', title: '🧘‍♀️ ZenMove', content: 'Inhalte für ZenMove...' },
        { id: 'NourishCycle', title: '🍽️ NourishCycle', content: 'Inhalte für NourishCycle...' }
    ];

    return (
        <>
            <div className={styles.myAyurlyContainer}>
                <section className={styles.topSection}>
                    <div className={styles.profileAndDosha}>
                        <div className={styles.doshaCard}>
                            <div className={styles.doshaIcon}><span>{currentDosha.icon}</span></div>
                            <p className={styles.doshaName}>{capitalizedDosha}</p>
                            <p className={styles.doshaDescription}>{currentDosha.description}</p>
                            <Link to="/dosha-test" className={styles.redoTestLink}>
                                {doshaType ? 'Test wiederholen' : 'Test machen'}
                            </Link>
                        </div>

                        <div className={styles.profileCard}>
                            <img src="/img/account/profile.png" alt="Profil Icon" className={styles.profileImage} />
                            <div className={styles.profileWrapper}>
                                <div className={styles.profileContent}>
                                    <div className={styles.name}>
                                        <h2>{userProfile?.firstName || 'Dein'}</h2>
                                        <h2>{userProfile?.lastName || 'Name'}</h2>
                                    </div>
                                    <div className={styles.userInfo}>
                                    <FaUser />
                                    <p>{userProfile?.username || 'dein_username'}</p>
                                </div>
                                    <div className={styles.userInfo}>
                                        <FaEnvelope />
                                        <p>{userProfile?.email || 'deine@email.com'}</p>
                                    </div>
                                </div>
                                <div className={styles.settings} onClick={handleOpenAccountManagement} title="Keycloak Account-Einstellungen">
                                    <FaCog />
                                    <span>Ändern</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <h2 className={styles.spacer}>MyAyurly Dashboard</h2>
                <Calendar onDateSelect={handleDateSelect} />

                <section className={styles.dashboard}>
                    <div className={styles.row}>
                        <div className={styles.routineCard} onClick={() => openModal('MorningFlow')}><h4 className={styles.cardTitle}>🌞 MorningFlow</h4></div>
                        <div className={styles.routineCard} onClick={() => openModal('EveningFlow')}><h4 className={styles.cardTitle}>🌙 EveningFlow</h4></div>
                        <div className={styles.routineCard} onClick={() => openModal('RestCycle')}><h4 className={styles.cardTitle}>💤 RestCycle</h4></div>
                    </div>
                    <div className={styles.row}>
                        <div className={styles.routineCard} onClick={() => openModal('ZenMove')}><h4 className={styles.cardTitle}>🧘‍♀️ ZenMove</h4></div>
                        <div className={styles.routineCard} onClick={() => openModal('NourishCycle')}><h4 className={styles.cardTitle}>🍽️ NourishCycle</h4></div>
                    </div>
                </section>
            </div>

            {/* --- Modals für die Dashboard-Kacheln --- */}
            {dashboardCards.map(card => (
                <Modal key={card.id} show={activeModal === card.id} onClose={closeModal}>
                    <h2>{card.title}</h2>
                    <p>{card.content}</p>
                </Modal>
            ))}
        </>
    );
};

export default MyAyurlyPage;