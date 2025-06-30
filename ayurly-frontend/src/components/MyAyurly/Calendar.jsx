import React, { useState, useEffect, useCallback, useMemo } from 'react';
import styles from './Calendar.module.css';
import { FaCalendarAlt, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import Modal from '../UI/Modal';

const DatePickerPopup = ({ onDateSelect, onClose, initialDate, selectedDate, monthlyProgress, onMonthChange }) => {
    const [view, setView] = useState('days'); // 'days', 'months', 'years'
    const [currentDate, setCurrentDate] = useState(initialDate || new Date());

    const progressMap = useMemo(() => {
        if (!monthlyProgress) return new Map();
        return new Map(monthlyProgress.map(p => [p.date, Math.round(p.progress)]));
    }, [monthlyProgress]);

    const getLocalDateString = (date) => {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const isSameDay = (d1, d2) => d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();

    const changeMonth = (amount) => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + amount, 1));
    const changeYear = (amount) => setCurrentDate(prev => new Date(prev.getFullYear() + amount, prev.getMonth(), 1));
    const changeYearRange = (amount) => setCurrentDate(prev => new Date(prev.getFullYear() + amount * 10, prev.getMonth(), 1));

    const handleTodayClick = () => {
        onDateSelect(new Date());
        onClose();
    };

    const getYearRange = () => {
        const year = currentDate.getFullYear();
        const startYear = Math.floor(year / 10) * 10;
        return Array.from({ length: 10 }, (_, i) => startYear + i);
    };
    const renderDays = () => {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const daysArray = [];
        const monthStartDay = (date.getDay() + 6) % 7;
        const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
        for (let i = 0; i < monthStartDay; i++) {
            daysArray.push(<div key={`empty-start-${i}`} className={styles.dayCellEmpty}></div>);
        }
        for (let day = 1; day <= daysInMonth; day++) {
            const fullDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
            const isCurrentlySelected = isSameDay(fullDate, selectedDate);
            const dateString = getLocalDateString(fullDate);
            const progress = progressMap.get(dateString);
            const dayClass = `${styles.dayCell} ${isCurrentlySelected ? styles.selectedDay : ''}`;

            daysArray.push(
                <div key={day} className={dayClass} onClick={() => { onDateSelect(fullDate); onClose(); }}>
                    <span>{day}</span>
                    {progress !== undefined && <span className={styles.progressText}>{progress}%</span>}
                </div>
            );
        }
        return daysArray;
    };

    const renderMonths = () => {
        const months = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
        return months.map((month, index) => (
            <div key={month} className={styles.monthCell} onClick={() => { setCurrentDate(new Date(currentDate.getFullYear(), index, 1)); setView('days'); }}>
                {month}
            </div>
        ));
    };

    const renderYears = () => {
        const years = getYearRange();
        return years.map(year => (
            <div key={year} className={styles.yearCell} onClick={() => { setCurrentDate(new Date(year, currentDate.getMonth(), 1)); setView('months'); }}>
                {year}
            </div>
        ));
    };

    const renderHeader = () => {
        switch (view) {
            case 'months':
                return <span onClick={() => setView('years')}>{currentDate.getFullYear()}</span>;
            case 'years':
                const years = getYearRange();
                return <span>{`${years[0]} - ${years[9]}`}</span>;
            default: // 'days'
                return <span onClick={() => setView('months')}>{currentDate.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}</span>;
        }
    };

    const handlePrevClick = () => {
        if (view === 'days') { changeMonth(-1); onMonthChange(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)); }
        else if (view === 'months') changeYear(-1);
        else changeYearRange(-1);
    };

    const handleNextClick = () => {
        if (view === 'days') { changeMonth(1); onMonthChange(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)); }
        else if (view === 'months') changeYear(1);
        else changeYearRange(1);
    };

    return (
        <div className={styles.datePickerContainer}>
            <div className={styles.datePickerHeader}>
                <button onClick={handlePrevClick}>&lt;</button>
                {renderHeader()}
                <button onClick={handleNextClick}>&gt;</button>
            </div>
            {view === 'days' && <div className={styles.dayNames}>{['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map(d => <div key={d}>{d}</div>)}</div>}
            {view === 'days' && <div className={styles.daysGrid}>{renderDays()}</div>}
            {view === 'months' && <div className={styles.monthsGrid}>{renderMonths()}</div>}
            {view === 'years' && <div className={styles.yearsGrid}>{renderYears()}</div>}
            <div className={styles.popupFooter}>
                <button className={styles.todayButton} onClick={handleTodayClick}>Heute</button>
            </div>
        </div>
    );
};


const Calendar = ({ onDateSelect, selectedDate, monthlyProgress, onMonthChange }) => {
    const [centerDate, setCenterDate] = useState(new Date()); 
    const [isPopupOpen, setIsPopupOpen] = useState(false);

    const displayDates = React.useMemo(() => {
        const dates = [];
        for (let i = -3; i <= 3; i++) { // 3 Tage davor, Zentrum, 3 Tage danach = 7 Tage
            const date = new Date(centerDate);
            date.setDate(centerDate.getDate() + i);
            dates.push(date);
        }
        return dates;
    }, [centerDate]);

    // Callback an die Eltern-Komponente, wenn sich das ausgewählte Datum ändert
    useEffect(() => {
        if (onDateSelect) {
            onDateSelect(selectedDate);
        }
        onDateSelect(selectedDate);
    }, [selectedDate, onDateSelect]);

    const handleDateSelectAndClosePopup = (date) => {
        onDateSelect(date);
        setCenterDate(date); // Zentriert die Ansicht auf das im Popup ausgewählte Datum
        setIsPopupOpen(false);
    };

    // Navigiert die 7-Tage-Ansicht
    const slideWindow = (days) => {
        setCenterDate(prev => {
            const newDate = new Date(prev);
            newDate.setDate(prev.getDate() + days);
            return newDate;
        });
    };

    const isSameDay = (d1, d2) => d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();

    const getPrevMonthLabel = () => {
        return displayDates[0]?.toLocaleDateString('de-DE', { month: 'short' });
    };
    const getNextMonthLabel = () => {
        return displayDates[displayDates.length - 1]?.toLocaleDateString('de-DE', { month: 'short' });
    };

    return (
        <>
            <div className={styles.calendarContainer}>
                <button className={styles.navButton} onClick={() => slideWindow(-7)} title="Woche zurück">
                    <FaChevronLeft />
                    <span className={styles.monthLabel}>{getPrevMonthLabel()}</span>
                </button>
                <div className={styles.dateWrapper}>
                    {displayDates.map(date => {
                        const dayName = date.toLocaleDateString('de-DE', { weekday: 'short' });
                        const dayNumber = date.getDate();
                        const isSelected = isSameDay(date, selectedDate);
                        const isToday = isSameDay(date, new Date());

                        return (
                            <div key={date.toISOString()} className={`${styles.dateItem} ${isSelected ? styles.selected : ''} ${isToday ? styles.today : ''}`} onClick={() => onDateSelect(date)}>
                                <span className={styles.dayName}>{dayName}</span>
                                <span className={styles.dayNumber}>{dayNumber}</span>
                            </div>
                        );
                    })}
                </div>

                <button className={styles.navButton} onClick={() => slideWindow(7)} title="Woche vor">
                    <FaChevronRight />
                    <span className={styles.monthLabel}>{getNextMonthLabel()}</span>
                </button>

                <button className={styles.popupCalendarButton} onClick={() => setIsPopupOpen(true)} title="Kalender öffnen">
                    <FaCalendarAlt />
                </button>
            </div>

            <Modal show={isPopupOpen} onClose={() => setIsPopupOpen(false)}>
                <DatePickerPopup
                    initialDate={selectedDate}
                    selectedDate={selectedDate}
                    onDateSelect={handleDateSelectAndClosePopup}
                    onClose={() => setIsPopupOpen(false)}
                    monthlyProgress={monthlyProgress}
                    onMonthChange={onMonthChange}
                />
            </Modal>
        </>
    );
};

export default Calendar;