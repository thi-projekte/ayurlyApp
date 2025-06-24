import apiRequest from './apiService';
import keycloakService from './keycloakService';

const API_BASE_URL_CONTENT = '/api/myayurly/content';
const API_BASE_URL_PROCESS = '/api/tagesprozess';

/**
 * Ruft den Dashboard-Content für ein bestimmtes Datum ab.
 * @param {string} date - Das Datum im Format YYYY-MM-DD.
 * @returns {Promise<object>} Das DashboardContentDTO oder ein Status-Objekt.
 */
const getDashboardContent = (date) => {
  const token = keycloakService.getToken();
  const url = `${API_BASE_URL_CONTENT}?date=${date}`;
  return apiRequest(url, 'GET', null, token);
};

/**
 * Stößt den Backend-Prozess zur Generierung von Tages-Content an.
 * @param {string} date - Das Datum im Format YYYY-MM-DD.
 * @returns {Promise<object>} Ein Objekt mit der processInstanceId.
 */
const generateDashboardContent = (date) => {
    const token = keycloakService.getToken();
    const url = `${API_BASE_URL_PROCESS}/generieren`;
    const body = { date };
    return apiRequest(url, 'POST', body, token);
};

/**
 * Ändert den "isDone"-Status eines einzelnen Content-Items.
 * @param {string} myAyurlyContentId - Die UUID des myayurly_content Eintrags.
 * @returns {Promise<null>}
 */
const toggleDoneStatus = (myAyurlyContentId) => {
    const token = keycloakService.getToken();
    const url = `${API_BASE_URL_CONTENT}/${myAyurlyContentId}/toggle-done`;
    return apiRequest(url, 'POST', null, token);
};

/**
 * Stößt den Backend-Prozess zur Neugenerierung des Contents für eine einzelne Kachel an.
 * @param {string} date - Das Datum im Format YYYY-MM-DD.
 * @param {string} tileKey - Der Key der Kachel (z.B. "MORNING_FLOW").
 * @returns {Promise<object>} Ein Objekt mit der processInstanceId.
 */
const startReshuffleProcess = (date, tileKey) => {
    const token = keycloakService.getToken();
    const url = `${API_BASE_URL_PROCESS}/reshuffle`;
    const body = { date, tileKey };
    return apiRequest(url, 'POST', body, token);
};


export default {
  getDashboardContent,
  generateDashboardContent,
  toggleDoneStatus,
  startReshuffleProcess,
};