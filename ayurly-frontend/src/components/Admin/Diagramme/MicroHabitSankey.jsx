import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { Chart } from 'react-google-charts';
import { useUser } from '../../../contexts/UserContext';
import apiRequest from '../../../services/apiService';

const ContentSankeyChart = () => {
    const { keycloakInstance } = useUser();
    const [chartData, setChartData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const chartContainerRef = useRef(null); 
    const [chartSize, setChartSize] = useState({ width: '100%', height: '600px' }); 
 

    useEffect(() => {
        const fetchSankeyData = async () => {
            if (!keycloakInstance) return;
            try {
                const data = await apiRequest('/api/admin/dashboard/sankey-data/microhabits', 'GET', null, keycloakInstance.token);
                
                const formattedData = data.map(node => [node.source, node.target, node.value]);
                
                setChartData([['From', 'To', 'Count'], ...formattedData]);
            } catch (error) {
                console.error("Fehler beim Laden der Sankey-Daten:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchSankeyData();
    }, [keycloakInstance]);

     useLayoutEffect(() => {
        if (chartContainerRef.current) {
            const resizeObserver = new ResizeObserver(entries => {
                if (entries.length > 0) {
                    const { width } = entries[0].contentRect;
                    setChartSize(prevSize => ({ ...prevSize, width: width }));
                }
            });

            resizeObserver.observe(chartContainerRef.current);

            return () => resizeObserver.disconnect();
        }
    }, [isLoading]); 


    const options = {
        sankey: {
            node: {
                colors: ['#a6cee3', '#1f78b4', '#b2df8a', '#33a02c', '#fb9a99'],
                label: { 
                    fontName: 'Arial',
                    fontSize: 14,
                    color: '#333',
                    bold: true,
                },
            },
            link: {
                colorMode: 'gradient',
                colors: ['#a6cee3', '#1f78b4', '#b2df8a', '#33a02c']
            }
        },
    };

    if (isLoading) return <p>Lade Diagrammdaten...</p>;

    return (
        <>
            <div ref={chartContainerRef} style={{ width: '100%', height: '100%' }}>
                {!isLoading && chartData.length > 1 && (
                     <Chart
                        chartType="Sankey"
                        width={chartSize.width} 
                        height={chartSize.height}
                        data={chartData}
                        options={options}
                        />
                )}
            </div>
        </>
    );
};

export default ContentSankeyChart;