import express from 'express';
import { getWheelById, createWheel } from '../controllers/wheelController.js';

const router = express.Router();

router.get('/wheels/:id', getWheelById);
router.post('/wheels', createWheel);

export default router;