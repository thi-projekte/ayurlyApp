import apiRequest from './apiService';
import keycloakService from './keycloakService';

const API_BASE_URL = '/api/myayurly/history';

/**
 * Ruft die aggregierten Verlaufsdaten für den Graphen ab.
 * @param {string} timeframe - Der gewählte Zeitraum ('week', 'month', 'year', 'total').
 * @returns {Promise<Array>} Ein Array von Datenpunkten für den Graphen.
 */
const getGraphData = (timeframe) => {
    const token = keycloakService.getToken();
    if (!token) throw new Error("User not authenticated.");
    
    const url = `${API_BASE_URL}/graph?timeframe=${timeframe}`;
    return apiRequest(url, 'GET', null, token);
};

const getMonthlySummary = (year, month) => {
    const token = keycloakService.getToken();
    if (!token) throw new Error("User not authenticated.");
    const url = `${API_BASE_URL}/monthly-summary?year=${year}&month=${month}`;
    return apiRequest(url, 'GET', null, token);
};

export default {
    getGraphData,
    getMonthlySummary,
};