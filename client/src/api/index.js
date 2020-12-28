import axios from 'axios';

export const createWheel = payload => axios.post('/api/wheels', payload);
export const updateWheel = (id, hash, payload) => axios.patch(`/api/wheels/${id}?hash=${hash}`, payload);
export const getWheel = id => axios.get(`/api/wheels/${id}`);
export const checkAdmin = (id, hash) => axios.post(`/api/wheels/check/${id}?hash=${hash}`);


// Util functions
export const getErrorMessage = err => err && err.message || JSON.stringify(err);

export default {
    createWheel,
    updateWheel,
    getWheel,
    checkAdmin
}