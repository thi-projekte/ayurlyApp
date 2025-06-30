import React, { useState, useEffect } from 'react';
import { useUser } from '../../contexts/UserContext';
import apiRequest from '../../services/apiService';
import StatCard from './StatCard';
import styles from '../../pages/AdminPage.module.css';
import CollapsibleSection from './CollapsibleSection';
import MicroHabitSankey from './Diagramme/MicroHabitSankey';
import ContentOverviewSankey from './Diagramme/ContentOverViewSankey';
import TopLikedChart from './Diagramme/TopLikedChart'; 
import TopDoneChart from './Diagramme/TopDoneChart';  
import TileUsageChart from './Diagramme/TileUsageChart';

const DashboardOverview = () => {
    const { keycloakInstance } = useUser();
    const [metrics, setMetrics] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMetrics = async () => {
            if (!keycloakInstance || !keycloakInstance.token) {
                return;
            }
            setIsLoading(true);
            setError(null);
            try {
                const data = await apiRequest('/api/admin/dashboard/metrics', 'GET', null, keycloakInstance.token);
                setMetrics(data);
            } catch (err) {
                setError(err.message || 'Fehler beim Laden der Dashboard-Daten.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchMetrics();
    }, [keycloakInstance]);

    if (isLoading) {
        return <p>Lade Kennzahlen...</p>;
    }

    if (error) {
        return <p className={styles.errorMessage}>{error}</p>;
    }

    const totalContentCount = metrics
        ? metrics.totalRecipes + metrics.totalMicrohabits + metrics.totalProducts + metrics.totalYogaExercises
        : 0;


    return (
        <div>
            <h2>Dashboard</h2>
            {metrics && (
                <div>
                    <CollapsibleSection title="Kennzahlen auf einen Blick">
                        <div className={styles.dashboardGrid}>
                            <StatCard title="Gesamte Benutzer" value={metrics.totalUsers} />
                            <StatCard title="Aktive Benutzer (30 Tage)" value={metrics.activeUsersLast30Days} />
                            <StatCard title="Content-Items" value={totalContentCount} />
                        </div>
                    </CollapsibleSection>

                    <CollapsibleSection title="Nutzungsstatistiken">
                        <CollapsibleSection title="Top 5 Beliebteste Inhalte">
                            <TopLikedChart />
                        </CollapsibleSection>

                        <CollapsibleSection title="Top 5 Genutzte Inhalte (nach 'Erledigt')" defaultOpen={false}>
                            <TopDoneChart />
                        </CollapsibleSection>

                        <CollapsibleSection title="Nutzung der Routine-Kacheln" defaultOpen={false}>
                            <TileUsageChart />
                        </CollapsibleSection>
                    </CollapsibleSection>

                    <CollapsibleSection title="Content" defaultOpen={false}>
                        <CollapsibleSection title="Content-Verteilung">
                            <ContentOverviewSankey metrics={metrics} />

                        </CollapsibleSection>

                        <CollapsibleSection title="Microhabits-Verteilung" defaultOpen={false}>
                            <MicroHabitSankey />
                        </CollapsibleSection>
                    </CollapsibleSection>

                    

                </div>
            )}
        </div>
    );
}
export default DashboardOverview;