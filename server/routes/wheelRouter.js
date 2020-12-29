import express from 'express';
import { createWheel, getWheelById, updateWheel, validatePassword } from '../controllers/wheelController.js';

const router = express.Router();

router.post('/wheels/check/:id', validatePassword);
router.get('/wheels/:id', getWheelById);
router.post('/wheels', createWheel);
router.patch('/wheels/:id', updateWheel);

export default router;