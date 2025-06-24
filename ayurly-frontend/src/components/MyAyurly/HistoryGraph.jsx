import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import myAyurlyHistoryService from '../../services/myAyurlyHistoryService';
import styles from './HistoryGraph.module.css';

const timeframes = [
    { key: 'week', label: 'Woche' },
    { key: 'month', label: 'Monat' },
    { key: 'year', label: 'Jahr' },
    { key: 'total', label: 'Gesamt' },
];

const HistoryGraph = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTimeframe, setActiveTimeframe] = useState('week');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const result = await myAyurlyHistoryService.getGraphData(activeTimeframe);
                setData(result);
            } catch (error) {
                console.error("Fehler beim Laden der Graph-Daten:", error);
                setData([]); // Bei Fehler leere Daten setzen
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [activeTimeframe]); // Effekt bei Änderung des Zeitraums neu ausführen

    return (
        <div className={styles.graphContainer}>
            <div className={styles.header}>
                <h3>Dein Fortschritt im Überblick</h3>
                <div className={styles.filters}>
                    {timeframes.map(tf => (
                        <button
                            key={tf.key}
                            className={`${styles.filterButton} ${activeTimeframe === tf.key ? styles.active : ''}`}
                            onClick={() => setActiveTimeframe(tf.key)}
                        >
                            {tf.label}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className={styles.loaderWrapper}><div className={styles.loader}></div></div>
            ) : (
                <ResponsiveContainer width="100%" height={400}>
                    <LineChart
                        data={data}
                        margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="label" stroke="#888" />
                        <YAxis stroke="#888" domain={[0, 100]} unit="%" />
                        <Tooltip
                            formatter={(value) => [
                                // Runde den Wert auf eine Nachkommastelle und füge " %" hinzu
                                `${parseFloat(value).toFixed(1)} %`,
                                "Fortschritt" 
                            ]}
                            contentStyle={{ 
                                background: 'rgba(255, 255, 255, 0.9)', 
                                border: '1px solid #ddd',
                                borderRadius: '8px'
                            }} 
                        />
                        <Legend />
                        <Line 
                            type="monotone" 
                            dataKey="progress" 
                            name="Fortschritt" 
                            stroke="#e26a2c" 
                            strokeWidth={3} 
                            dot={{ r: 1, strokeWidth: 2 }} 
                            activeDot={{ r: 4,  strokeWidth: 2 }} 
                        />
                    </LineChart>
                </ResponsiveContainer>
            )}
        </div>
    );
};

export default HistoryGraph;