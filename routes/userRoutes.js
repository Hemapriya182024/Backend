import express from 'express';
import { protectRoutes } from '../Middleware/protectRoutes.js'
import { getProfile ,followUnfollowUser,getSuggestedUser,updateUser} from '../controllers/userController.js';


const userRoute =express.Router()

userRoute.get("/profile/:username",protectRoutes,getProfile)
userRoute.post("/follow/:id",protectRoutes,followUnfollowUser)
userRoute.get('/suggested',protectRoutes,getSuggestedUser)
userRoute.post('/update',protectRoutes,updateUser)


export default userRoute