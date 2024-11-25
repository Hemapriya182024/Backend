import express from 'express';
import { protectRoutes } from '../Middleware/protectRoutes.js';
import { createPost,deletePost,createComment ,likeUnLikeCommment,getAllPost,getLikedPost,getFollowingPost,getUserPost} from '../controllers/postController.js';


const postRouter=express()

postRouter.get('/all',protectRoutes,getAllPost)
postRouter.get('/following',protectRoutes,getFollowingPost)
postRouter.get('/likes/:id',protectRoutes,getLikedPost)
postRouter.get('/user/:username',protectRoutes,getUserPost)
postRouter.post('/create',protectRoutes,createPost)
postRouter.post('/like/:id',protectRoutes,likeUnLikeCommment)
postRouter.post('/comment/:id',protectRoutes,createComment)
postRouter.delete('/:id',protectRoutes,deletePost)


export default postRouter