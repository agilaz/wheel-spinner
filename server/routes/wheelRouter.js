import express from 'express';
import { getWheelById, createWheel, updateWheel, checkWheel } from '../controllers/wheelController.js';

const router = express.Router();

router.post('/wheels/check/:id', checkWheel);
router.get('/wheels/:id', getWheelById);
router.post('/wheels', createWheel);
router.patch('/wheels/:id', updateWheel);

export default router;