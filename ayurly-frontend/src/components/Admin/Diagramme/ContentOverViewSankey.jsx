import React from 'react';
import { Chart } from 'react-google-charts';

/**
 * Stellt eine einfache Übersicht der Content-Typen als Sankey-Diagramm dar.
 * Die Werte werden direkt in die Labels der Ziel-Knoten geschrieben.
 * @param {{metrics: object}} props - Erwartet das metrics-Objekt vom Dashboard.
 */
const ContentOverviewSankey = ({ metrics }) => {
    if (!metrics) return null;

    const totalContent = metrics.totalRecipes + metrics.totalMicrohabits + metrics.totalProducts + metrics.totalYogaExercises;


    const data = [
        ['From', 'To', 'Value'],
        [`Inhalte Gesamt (${totalContent})`, `Rezepte (${metrics.totalRecipes})`, metrics.totalRecipes],
        [`Inhalte Gesamt (${totalContent})`, `Microhabits (${metrics.totalMicrohabits})`, metrics.totalMicrohabits],
        [`Inhalte Gesamt (${totalContent})`, `Produkte (${metrics.totalProducts})`, metrics.totalProducts],
        [`Inhalte Gesamt (${totalContent})`, `Yoga-Übungen (${metrics.totalYogaExercises})`, metrics.totalYogaExercises],
    ];

    // Optionen zur Anpassung des Aussehens
    const options = {
        colors: [
            '#a6cee3', // Hauptknoten
            '#33a02c', // Microhabits (grün)
            '#fb9a99', // Rezepte (rot/rosa)
            '#1f78b4', // Yoga (dunkelblau)
            '#fdbf6f', // Produkte (orange)
        ],

        sankey: {
            node: {
                label: {
                    fontName: 'Arial',
                    fontSize: 15,
                    color: '#000',
                    bold: true,
                },
            },
            link: {
                colorMode: 'gradient',
            },
        },
    };

    return (
        <>
            <Chart
                chartType="Sankey"
                width="100%"
                height="400px"
                data={data}
                options={options}
            />
        </>
    );
};

export default ContentOverviewSankey;