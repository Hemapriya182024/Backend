import express from 'express';
import { protectRoutes } from '../Middleware/protectRoutes.js';
import { getNotifications,deleteNotifications } from '../controllers/notificationController.js';

const notificationRoute=express.Router();

notificationRoute.get('/',protectRoutes ,getNotifications);
notificationRoute.delete('/',protectRoutes ,deleteNotifications)

export default notificationRoute