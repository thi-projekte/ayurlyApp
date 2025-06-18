import apiRequest from './apiService';
import keycloakService from './keycloakService';

const API_BASE_URL = '/api/products';

const getAllProducts = async (doshaType = null) => {
    const token = keycloakService.getToken();
    let url = API_BASE_URL;
    if (doshaType && doshaType !== 'all') {
        url += `?doshaType=${encodeURIComponent(doshaType)}`;
    }
    return apiRequest(url, 'GET', null, token);
};

const getProductById = async (productId) => {
    const token = keycloakService.getToken();
    return apiRequest(`${API_BASE_URL}/${productId}`, 'GET', null, token);
};

const likeProduct = async (productId) => {
    const token = keycloakService.getToken();
    if (!token) throw new Error("User not authenticated.");
    return apiRequest(`${API_BASE_URL}/${productId}/like`, 'POST', null, token);
};

const unlikeProduct = async (productId) => {
    const token = keycloakService.getToken();
    if (!token) throw new Error("User not authenticated.");
    return apiRequest(`${API_BASE_URL}/${productId}/unlike`, 'POST', null, token);
};

const createProduct = async (productData) => {
    const token = keycloakService.getToken();
    if (!token) throw new Error("User not authenticated or admin role missing.");
    return apiRequest(API_BASE_URL, 'POST', productData, token);
};

const updateProduct = async (productId, productData) => {
    const token = keycloakService.getToken();
    if (!token) throw new Error("User not authenticated or admin role missing.");
    return apiRequest(`${API_BASE_URL}/${productId}`, 'PUT', productData, token);
};

const deleteProduct = async (productId) => {
    const token = keycloakService.getToken();
    if (!token) throw new Error("User not authenticated or admin role missing.");
    return apiRequest(`${API_BASE_URL}/${productId}`, 'DELETE', null, token);
};


export default {
    getAllProducts,
    getProductById,
    likeProduct,
    unlikeProduct,
    createProduct,
    updateProduct,
    deleteProduct
};