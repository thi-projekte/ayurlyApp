import apiRequest from './apiService';
import keycloakService from './keycloakService';

const API_BASE_URL = '/api/yoga-exercises';

const getAllYogaExercises = async (doshaType = null) => {
    const token = keycloakService.getToken();
    let url = API_BASE_URL;
    if (doshaType && doshaType !== 'all') {
        url += `?doshaType=${encodeURIComponent(doshaType)}`;
    }
    return apiRequest(url, 'GET', null, token);
};

const getYogaExerciseById = async (id) => {
    const token = keycloakService.getToken();
    return apiRequest(`${API_BASE_URL}/${id}`, 'GET', null, token);
};

const likeYogaExercise = async (id) => {
    const token = keycloakService.getToken();
    if (!token) throw new Error("User not authenticated.");
    return apiRequest(`${API_BASE_URL}/${id}/like`, 'POST', null, token);
};

const unlikeYogaExercise = async (id) => {
    const token = keycloakService.getToken();
    if (!token) throw new Error("User not authenticated.");
    return apiRequest(`${API_BASE_URL}/${id}/unlike`, 'POST', null, token);
};

// Admin functions
const createYogaExercise = async (data) => {
    const token = keycloakService.getToken();
    return apiRequest(API_BASE_URL, 'POST', data, token);
};

const updateYogaExercise = async (id, data) => {
    const token = keycloakService.getToken();
    return apiRequest(`${API_BASE_URL}/${id}`, 'PUT', data, token);
};

const deleteYogaExercise = async (id) => {
    const token = keycloakService.getToken();
    return apiRequest(`${API_BASE_URL}/${id}`, 'DELETE', null, token);
};


export default {
    getAllYogaExercises,
    getYogaExerciseById,
    likeYogaExercise,
    unlikeYogaExercise,
    createYogaExercise,
    updateYogaExercise,
    deleteYogaExercise
};