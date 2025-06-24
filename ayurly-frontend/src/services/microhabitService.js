import apiRequest from './apiService';
import keycloakService from './keycloakService';

const API_BASE_URL = '/api/microhabits';

const likeMicrohabit = async (id) => {
    const token = keycloakService.getToken();
    if (!token) throw new Error("User not authenticated.");
    return apiRequest(`${API_BASE_URL}/${id}/like`, 'POST', null, token);
};

const unlikeMicrohabit = async (id) => {
    const token = keycloakService.getToken();
    if (!token) throw new Error("User not authenticated.");
    return apiRequest(`${API_BASE_URL}/${id}/unlike`, 'POST', null, token);
};

export default {
    likeMicrohabit,
    unlikeMicrohabit,
};