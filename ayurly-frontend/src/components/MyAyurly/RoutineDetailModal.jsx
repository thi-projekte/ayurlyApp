import React from 'react';
import Modal from '../UI/Modal';
import styles from './RoutineDetailModal.module.css';
import { FaSync, FaTimes } from 'react-icons/fa';
import DetailedMicroHabit from './DetailedMicroHabit';
import FullRecipeCard from './FullRecipeCard';
import FullYogaCard from './FullYogaCard';


const getTodayString = (date) => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const RoutineDetailModal = ({ show, onClose, modalData, onReshuffle, handleToggleDoneInModal, handleLikeToggleInModal, isToggleDisabled, likingId, selectedDate }) => {
    if (!modalData) return null;

    const isPastDate = selectedDate < getTodayString(new Date());

    const renderContentDetail = (item) => {
        switch (item.contentType) {
            case 'RECIPE':
                return (
                    <div className={styles.cardWrapper}>
                        <FullRecipeCard
                            item={item}
                            onLikeToggle={handleLikeToggleInModal}
                            likingId={likingId}
                        />
                        <input
                            type="checkbox"
                            id={`modal-item-checkbox-${item.myAyurlyContentId}`}
                            className={`${styles.itemCheckbox} ${styles.cardOverlayCheckbox}`}
                            checked={item.isDone}
                            onChange={() => handleToggleDoneInModal(item.myAyurlyContentId)}
                            disabled={isToggleDisabled(item)}
                        />
                    </div>
                );
            case 'YOGA_EXERCISE':
                return (
                    <div className={styles.cardWrapper}>
                        <FullYogaCard
                            item={item}
                            onLikeToggle={handleLikeToggleInModal}
                            likingId={likingId}
                        />
                        <input
                            type="checkbox"
                            id={`modal-item-checkbox-${item.myAyurlyContentId}`}
                            className={`${styles.itemCheckbox} ${styles.cardOverlayCheckbox}`}
                            checked={item.isDone}
                            onChange={() => handleToggleDoneInModal(item.myAyurlyContentId)}
                            disabled={isToggleDisabled(item)}
                        />
                    </div>
                );
            case 'MICROHABIT':
                return <DetailedMicroHabit item={item} handleToggleDone={handleToggleDoneInModal} handleLikeToggle={handleLikeToggleInModal} isToggleDisabled={isToggleDisabled} />;
            default:
                return <p>Unbekannter Inhaltstyp</p>;
        }
    }

    return (
        <Modal show={show} onClose={onClose}>
            <div className={styles.modalHeader}>
                <h2>{modalData.title}</h2>
                {!isPastDate && (
                    <button onClick={() => onReshuffle(modalData.key)} className={styles.reshuffleButton}>
                        <FaSync /> Neu laden
                    </button>
                )}
            </div>
            <div className={styles.modalContent}>
                {modalData.content.length > 0 ? (
                    modalData.content.map(item => (
                        <div key={item.myAyurlyContentId} className={styles.contentItemWrapper}>
                            {renderContentDetail(item)}
                        </div>
                    ))
                ) : (
                    <p>Für diese Kachel sind heute keine Aufgaben vorhanden.</p>
                )}
            </div>
            <div className={styles.modalActions}>
                <button onClick={onClose} className={styles.closeButton}>
                    <FaTimes /> Schließen
                </button>
            </div>
        </Modal>
    );
};

export default RoutineDetailModal;