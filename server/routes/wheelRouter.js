import express from 'express';
import {
    createWheel,
    findWheel,
    getAllTitles,
    getWheelById,
    updateWheel,
    validatePassword
} from '../controllers/wheelController.js';

const router = express.Router();

router.post('/wheels', createWheel);
router.patch('/wheels/:id', updateWheel);
router.get('/wheels/:id', getWheelById);
router.post('/wheels/search', findWheel);
router.get('/titles', getAllTitles);
router.post('/wheels/check/:id', validatePassword);

export default router;