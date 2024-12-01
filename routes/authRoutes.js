import express from 'express'
 import {signup,login,logout,getMe} from '../controllers/authController.js'
 import { protectRoutes } from '../Middleware/protectRoutes.js';

const router=express.Router();


router.post('/signup',signup);
router.post('/login',login)
router.post('/logout',logout)
router.get('/me',protectRoutes,getMe)



export default router