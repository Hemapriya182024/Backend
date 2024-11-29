import cloudinary from 'cloudinary'
import User from "../models/userSchema.js";
import Post from '../models/postSchema.js';
import Notification from '../models/notification.js';

const createPost = async (req, res) => {
    try {
        // Destructure text and img from the request body
        const { text } = req.body;
        let { img } = req.body;

        // Get the logged-in user's ID from the request object
        const userId = req.user._id.toString();

        // Find the user in the database using their ID
        const user = User.findOne({ _id: userId });
        if (!user) {
            // If user is not found, return an error response
            return res.status(200).json({ error: "User not found" });
        }

        // Ensure the post has at least text or an image
        if (!text && !img) {
            // If both text and image are missing, return an error
            return res.status(200).json({ error: "Post must have text or image" });
        }

        // If an image is provided, upload it to Cloudinary
        if (img) {
            // Upload the image to Cloudinary and get the secure URL
            const uploadedResponse = await cloudinary.uploader.upload(img);
            img = uploadedResponse.secure_url; // Update the img with the URL
        }

        // Create a new post object with user ID, text, and image
        const newPost = new Post({
            user: userId,
            text,
            img,
        });

        // Save the new post to the database
        await newPost.save();

        // Send the saved post as a response
        res.status(200).json(newPost);

    } catch (error) {
        // Log the error for debugging purposes
        console.log('Error in post controller', error);

        // Send a 500 response with the error message
        res.status(500).json({
            error: error.message,
        });
    }
};

const deletePost = async (req, res) => {
    try {
        // Get the post ID from request parameters
        const { id } = req.params;

        // Find the post by its ID
        const post = await Post.findOne({ _id: id });

        // If the post doesn't exist, return a 404 error
        if (!post) {
            return res.status(404).json({ error: "Post not found!" });
        }

        // Check if the logged-in user is the owner of the post
        if (post.user.toString() !== req.user._id.toString()) {
            // If not, return an unauthorized error
            return res.status(402).json({ error: "You are not authorized to delete this post" });
        }

        // If the post has an image, delete it from Cloudinary
        if (post.img) {
            // Extract the image ID from the Cloudinary URL
            const imgId = post.img.split("/").pop().split(".")[0];
            // Use Cloudinary's uploader to delete the image
            await cloudinary.uploader.destroy(imgId);
        }

        // Delete the post from the database using its ID
        await Post.findByIdAndDelete(req.params.id);

        // Send a success response
        res.status(200).json({ message: "Post deleted successfully" });
    } catch (error) {
        // Log the error for debugging purposes
        console.log('Error in post controller', error);

        // Send a 500 response with the error message
        res.status(500).json({
            error: error.message,
        });
    }
};
// Controller function to create a new comment on a specific post
const createComment = async (req, res) => {
    try {
        // Extract comment text from the request body
        const { text } = req.body;
        const {id: postId } = req.params; 
        const userId = req.user._id; 
        console.log("Request Params:", req.params);
        console.log("Request Body:", req.body);
        console.log("Post ID:", postId);
        
        // Validate that the comment text is not empty or just spaces
        if (!text) {
            return res.status(400).json({
                error: "Comment text is required!" // Send error if text is missing or invalid
            });
        }

        // Check if the post exists in the database
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({
                error: "Post not found!" // Send error if the post does not exist
            });
        }

        // Create a new comment object
        const comment = {
            user: userId, // Add the user ID to track who made the comment
            text         // Add the actual comment text
        };

        // Add the new comment to the post's comments array
        post.comments.push(comment);

        // Save the updated post back to the database
        await post.save();

        // Send the updated post as the response
        res.status(200).json(post);
    } catch (error) {
        // Handle unexpected errors and send a response to the client
        res.status(500).json({
            error: "Internal Server Error",
            message: error.message          
        });
    }
};
const likeUnLikeCommment=async(req,res)=>{
    try {
        const userId =req.user._id;
        const {id:postId}=req.params;
        const post=await Post.findOne({_id:postId})
        if (!post) {
            return res.status(404).json({
                error: "Post not found!" // Send error if the post does not exist
            });
        }
        const userLikedPost=post.likes.includes(userId)
        if(userLikedPost)
        {
          //unlike post
          await Post.updateOne({_id:postId},{$pull:{likes:userId}})
          await User.updateOne({_id:userId},{$pull:{likedPosts:postId}})
          const updatedLikes=post.likes.filter((id)=>id.toString() !== userId.toString())
          res.status(200).json( updatedLikes)
        }

        else{
            //like post
           post.likes.push(userId);
           await User.updateOne({_id:userId},{$push:{likedPosts:postId}})
           await post.save()

           const notification= new Notification(
            {
                from:userId,
                to:post.user,
                type:"like",


            })

            await notification.save();
            const updatedLikes=post.likes
            res.status(200).json(updatedLikes)

        }
    } 
    catch (error) {
        res.status(500).json({
            error: "Internal Server Error",
            message: error.message          
        });
        
    }
}

const getAllPost=async(req,res)=>{
    try {
        const posts=await Post.find().sort({createdAt:-1}).populate({
            path:"user",
            select:"-password"})
            .populate({
                path:"comments.user",
                select:["-password","-email" ,"-following","-followers","-bio","-link"]

            })
        if(posts.length===0)
        {
            res.status(200).json([])
        }
        res.status(200).json(posts)
    } catch (error) {
        res.status(500).json({
            error: "Internal Server Error",
            message: error.message          
        });
        
    }

}

const getLikedPost = async (req, res) => {
    try {
        // Extracting user ID from request parameters
        const userId = req.params.id;

        // Finding the user by their ID in the database
        const user = await User.findById({ _id: userId });

        // If the user doesn't exist, return a 404 error response
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Finding posts liked by the user using the `likedPosts` array
        let likedPosts = await Post.find({ _id: { $in: user.likedPosts } });

        // Populating the 'user' field in each post and excluding the 'password' field
        likedPosts = await Post.populate(likedPosts, {
            path: "user",
            select: "-password" // Exclude sensitive user data
        });

        // Populating the 'comments.user' field and excluding unwanted fields
        likedPosts = await Post.populate(likedPosts, {
            path: "comments.user",
            select: ["-password", "-email", "-following", "-followers", "-bio", "-link"] // Exclude sensitive or unnecessary fields
        });

        // Sending the liked posts as a JSON response
        res.status(200).json(likedPosts);
    } catch (error) {
        // Handling any unexpected errors and sending a 500 error response
        res.status(500).json({
            error: "Internal Server Error",
            message: error.message
        });
    }
};

const getFollowingPost = async (req, res) => {
    try {
        // Extracting user ID from request
        const userId = req.user._id;

        // Fetching the user document from the database
        const user = await User.findById(userId);

        // If user not found, return a 404 error response
        if (!user) {
            return res.status(404).json({ error: "User not found!" });
        }

        // Fetch the posts from users the current user is following
        const feedPost = await Post.find({ user: { $in: user.following } }) // Access the 'following' field from the user document
            .sort({ createdAt: -1 }) // Sort posts by creation date in descending order
            .populate({
                path: "user", // Populate the 'user' field in posts
                select: "-password" // Exclude the password field
            })
            .populate({
                path: "comments.user", // Populate the 'user' field inside 'comments'
                select: "-password" // Exclude the password field for users in comments
            });

        // Send the fetched posts as a response
        res.status(200).json(feedPost);
    } catch (error) {
        // Handle unexpected errors and send a 500 error response
        res.status(500).json({
            error: "Internal Server Error",
            message: error.message
        });
    }
};
const getUserPost=async(req,res)=>{
    try {
        const {username}=req.params;
        const user=await User.findOne({username})
        if(!user)
        {
            res.status(404).json({error:"User not found"})
        }
        const posts=await Post.find({user:user.id}).sort("createdAt:-1").populate({
            path:"user",
            select:"-password"
        }).populate(
            {
                path:"comments.user",
                select:"-password"
            }
        )
        res.status(200).json(posts)
    } catch (error) {
        // Handle unexpected errors and send a 500 error response
        res.status(500).json({
            error: "Internal Server Error",
            message: error.message
        });
        
    }
}

export {createPost,deletePost,createComment,likeUnLikeCommment,getAllPost,getLikedPost,getFollowingPost,getUserPost}