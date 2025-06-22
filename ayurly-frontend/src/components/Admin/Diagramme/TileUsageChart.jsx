import React, { useState, useEffect, useCallback } from 'react';
import { Chart } from 'react-google-charts';
import { useUser } from '../../../contexts/UserContext';
import apiRequest from '../../../services/apiService';

const TileUsageChart = () => {
    const { keycloakInstance } = useUser();
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = useCallback(async () => {
        if (!keycloakInstance) return;
        setIsLoading(true);
        try {
            const result = await apiRequest('/api/admin/dashboard/performance/tile-usage', 'GET', null, keycloakInstance.token);
            const chartData = [['Kachel', 'Anzahl Erledigt']];
            result.forEach(item => {
                chartData.push([item.tileName, item.doneCount]);
            });
            setData(chartData);
        } catch (error) {
            console.error("Fehler beim Laden der Tile-Usage-Daten:", error);
        } finally {
            setIsLoading(false);
        }
    }, [keycloakInstance]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const chartOptions = {
        pieHole: 0.4,
        legend: { position: 'bottom' },
        chartArea: { width: '90%', height: '80%' },
        colors: ['#a6cee3', '#1f78b4', '#b2df8a', '#33a02c', '#fb9a99'],
    };

    return (
        <div>
            {isLoading ? <p>Lade Diagramm...</p> : 
                (data.length > 1 ?
                    <Chart chartType="PieChart" width="100%" height="400px" data={data} options={chartOptions} /> :
                    <p>Keine Nutzungsdaten verfügbar.</p>
                )
            }
        </div>
    );
};

export default TileUsageChart;