import React, { useState, useEffect, useCallback } from 'react';
import { Chart } from 'react-google-charts';
import { useUser } from '../../../contexts/UserContext';
import apiRequest from '../../../services/apiService';
import PerformanceChartFilters from './PerformanceChartFilters';
import styles from '../../../pages/AdminPage.module.css';

const TopDoneChart = () => {
    const { keycloakInstance } = useUser();
    const [data, setData] = useState([]);
    const [filters, setFilters] = useState({ contentType: 'all', userDoshaType: 'all' });
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = useCallback(async () => {
        if (!keycloakInstance) return;
        setIsLoading(true);
        const params = new URLSearchParams({
            contentType: filters.contentType,
            userDoshaType: filters.userDoshaType,
        });
        try {
            const result = await apiRequest(`/api/admin/dashboard/performance/top-done?${params}`, 'GET', null, keycloakInstance.token);
            const chartData = [['Inhalt', 'Erledigt', { role: 'annotation' }]];
            result.forEach(item => {
                chartData.push([`${item.title} (${item.contentType.substring(0,1)})`, item.count, item.count]);
            });
            setData(chartData);
        } catch (error) {
            console.error("Fehler beim Laden der Top-Done-Daten:", error);
        } finally {
            setIsLoading(false);
        }
    }, [keycloakInstance, filters]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const chartOptions = {
        hAxis: { title: 'Anzahl "Erledigt"-Markierungen', minValue: 0 },
        vAxis: { title: 'Inhalt' },
        bars: 'horizontal',
        legend: { position: 'none' },
        chartArea: { width: '70%', height: '80%' },
        annotations: { textStyle: { fontSize: 12, color: '#000', auraColor: 'none' } },
        colors: ['#33a02c'],
    };

    return (
        <div>
            <PerformanceChartFilters onFilterChange={setFilters} />
            {isLoading ? <p>Lade Diagramm...</p> : 
                (data.length > 1 ?
                    <Chart chartType="BarChart" width="100%" height="400px" data={data} options={chartOptions} /> :
                    <p>Keine Daten für die aktuelle Auswahl verfügbar.</p>
                )
            }
        </div>
    );
};

export default TopDoneChart;