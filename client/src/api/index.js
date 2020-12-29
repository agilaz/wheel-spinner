import axios from 'axios';

export const createWheel = payload => axios.post('/api/wheels', payload);
export const updateWheel = (id, password, payload) => axios.patch(`/api/wheels/${id}?password=${password}`, payload);
export const getWheel = id => axios.get(`/api/wheels/${id}`);
export const checkAdmin = (id, password) => axios.post(`/api/wheels/check/${id}?password=${password}`);
export const getTitles = () => axios.get('/api/titles');
export const findWheel = payload => axios.post('/api/wheels/search', payload);


// Util functions
export const getErrorMessage = err => {
    if (err && err.response && err.response.data) {
        return JSON.stringify(err.response.data);
    }
    if (err && err.message) {
        return err.message;
    }

    return JSON.stringify(err);
}

export default {
    createWheel,
    updateWheel,
    getWheel,
    checkAdmin,
    getTitles,
    findWheel
}