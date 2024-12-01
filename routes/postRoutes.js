import express from 'express';
import { protectRoutes } from '../Middleware/protectRoutes.js';
import { createPost,deletePost,createComment ,likeUnLikeCommment,getAllPost,getLikedPost,getFollowingPost,getUserPost} from '../controllers/postController.js';


const postRouter=express()

postRouter.get('/all',getAllPost)
postRouter.get('/following',getFollowingPost)
postRouter.get('/likes/:id',getLikedPost)
postRouter.get('/user/:username',getUserPost)
postRouter.post('/create',createPost)
postRouter.post('/like/:id',likeUnLikeCommment)
postRouter.post('/comment/:id',createComment)
postRouter.delete('/:id',deletePost)


export default postRouter