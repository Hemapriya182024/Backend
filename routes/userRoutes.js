import express from 'express';
import { protectRoutes } from '../Middleware/protectRoutes.js'
import { getProfile ,followUnfollowUser,getSuggestedUser,updateUser} from '../controllers/userController.js';


const userRoute =express.Router()

userRoute.get("/profile/:username",getProfile)
userRoute.post("/follow/:id",followUnfollowUser)
userRoute.get('/suggested',getSuggestedUser)
userRoute.post('/update',updateUser)


export default userRoute