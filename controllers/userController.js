   
   import User from "../models/userSchema.js";
   import Notification from "../models/notification.js";
   import bcrypt from 'bcryptjs';
   import cloudinary from 'cloudinary'
   
 const getProfile=async(req,res)=>{
    try{
       const {username}=req.params;
       const user= await User.findOne({username})
        if(!user)
        {
            res.status(404).json({
              error:"User not found"
            })
        }
        res.status(200).json(user)
    }catch (error) {
        console.log(`error in get user profile  controller ${error}`)
       res.status(500).json(
        {
            "error":"Internal server error "
        }
       )
    }

}
const followUnfollowUser = async (req, res) => {
    try {
        // Extract the ID of the user to be followed/unfollowed from the request parameters
        const { id } = req.params;
        
        // Find the user to be modified (follow/unfollow) from the database
        const userToModify = await User.findById({ _id: id });

        // Find the currently logged-in user based on the request's user ID
        const currentUser = await User.findById({ _id: req.user._id });

        // Prevent the user from following/unfollowing themselves
        if (id === req.user._id) {
            return res.status(400).json({ error: "You can't follow or unfollow yourself" });
        }

        // Check if the user to be modified or the current user exists in the database
        if (!userToModify || !currentUser) {
            return res.status(400).json({ error: "User not found" });
        }

        // Check if the current user is already following the user to modify
        const isFollowing = currentUser.following.includes(id);

        if (isFollowing) {
            // Unfollow logic: Remove the current user from the followers of the user to modify
            await User.findByIdAndUpdate(
                { _id: id },
                { $pull: { followers: req.user._id } } // Remove from followers array
            );

            // Remove the user to modify from the following list of the current user
            await User.findByIdAndUpdate(
                { _id: req.user._id },
                { $pull: { following: id } } // Remove from following array
            );

            // Send a success response for unfollow action
            res.status(200).json({
                message: "Unfollowed successfully",
            });
        } else {
            // Follow logic: Add the current user to the followers of the user to modify
            await User.findByIdAndUpdate(
                { _id: id },
                { $push: { followers: req.user._id } } // Add to followers array
            );

            // Add the user to modify to the following list of the current user
            await User.findByIdAndUpdate(
                { _id: req.user._id },
                { $push: { following: id } } // Add to following array
            );
           //send Notification
           const newNotification = new Notification(
            {
                type:"follow",
                from:req.user._id,
                to:userToModify._id
            }
           )
           await newNotification.save()


            // Send a success response for follow action
            res.status(200).json({
                message: "Followed successfully",
            });
        }
    } catch (error) {
        // Log any error that occurs during the process
        console.log(`Error in follow/unfollow controller: ${error}`);

        // Send a 500 status code for internal server errors
        res.status(500).json({
            error: "Internal server error",
        });
    }
 };
// const getSuggestedUser = async (req, res) => {
//     try {
//         // 1. Get the logged-in user's ID from the request object
//         const userId = req.user._id;

//         // 2. Fetch the logged-in user's details (excluding password) from the database
//         const userFollowedByMe = await User.findById({ _id: userId }).select('-password');

//         // 3. Aggregate query to get a random list of users excluding the current user
//         const users = await User.aggregate([
//             {
//                 $match: {
//                     _id: { $ne: userId }, // Match users whose ID is not equal to the logged-in user's ID
//                 }
//             },
//             {
//                 $sample: { size: 10 } // Randomly select 10 users
//             }
//         ]);

//         // 4. Filter out users who are already followed by the logged-in user
//         const filteredUser = users.filter((user) =>
//             !userFollowedByMe.following.include(user._id) // Exclude users already in the following list
//         );

//         // 5. Limit the suggested users list to a maximum of 4
//         const suggestedUsers = filteredUser.slice(0, 4);

//         // 6. Set the password field of each suggested user to null for security
//         suggestedUsers.forEach((user) => (user.password = null));

//         // 7. Send the suggested users as the response with a 200 status code
//         res.status(200).json(suggestedUsers);
//     } catch (error) {
//         // 8. If any error occurs, return a 500 Internal Server Error response
//         res.status(500).json({
//             error: "Internal server error", // General error message
//         });
//     }
// };

const getSuggestedUser = async (req, res) => {
    try {
        // 1. Get the logged-in user's ID from the request object
        const userId = req.user._id;

        // 2. Fetch the logged-in user's details (excluding password) from the database
        const userFollowedByMe = await User.findById(userId).select('-password');

        // 3. Aggregate query to get a random list of users excluding the current user
        const users = await User.aggregate([
            {
                $match: {
                    _id: { $ne: userId }, // Match users whose ID is not equal to the logged-in user's ID
                }
            },
            {
                $project: { password: 0 } // Exclude the password field
            },
            {
                $sample: { size: 10 } // Randomly select 10 users
            }
        ]);

        // 4. Filter out users who are already followed by the logged-in user
        const filteredUsers = users.filter(
            (user) =>
                !userFollowedByMe.following
                    .map((f) => f.toString())
                    .includes(user._id.toString())
        );

        // 5. Limit the suggested users list to a maximum of 4
        const suggestedUsers = filteredUsers.slice(0, 4);

        // 6. Set the password field of each suggested user to null for security
        const sanitizedUsers = suggestedUsers.map((user) => ({
            ...user,
            password: null,
        }));

        // 7. Send the suggested users as the response with a 200 status code
        res.status(200).json(sanitizedUsers);
    } catch (error) {
        // 8. If any error occurs, return a 500 Internal Server Error response
        res.status(500).json({
            error: "Internal server error", // General error message
        });
    }
};



const updateUser = async (req, res) => {
    try {
        // Get the logged-in user's ID from the request object (assumed to be populated by authentication middleware)
        const userId = req.user._id;

        // Destructure input fields from the request body
        const { username, fullname, email, currentPassword, newPassword, bio, link } = req.body;
        const { profileImg, coverImg } = req.body;

        // Fetch the user details from the database using the ID
        const user = await User.findById({ _id: userId });
        if (!user) {
            // If no user is found, return a 500 response with an error message
            return res.status(404).json({
                error: "User not found!"
            });
        }

        // Validate that both currentPassword and newPassword are provided if one is supplied
        if ((!newPassword && currentPassword) || (!currentPassword && newPassword)) {
            return res.status(400).json({
                error: "Please provide both new password and current password"
            });
        }

        // If new password is provided, validate and update it
        if (newPassword) {
            // Check if the current password matches the one stored in the database
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                // If the passwords don't match, return an error
                return res.status(400).json({ error: "Current Password is Incorrect!!" });
            }

            // Ensure the new password meets the minimum length requirement
            if (newPassword.length < 6) {
                return res.status(400).json({
                    error: "Password must be at least 6 letters!"
                });
            }

            // Generate a salt and hash the new password before saving
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);
        }

        // Handle profile image update
        if (profileImg) {
            // If the user already has a profile image, delete it from Cloudinary
            if (user.profileImg) {
                await cloudinary.uploader.destroy(user.profileImg.split('/').pop().split('.')[0]);
            }

            // Upload the new profile image to Cloudinary and get the secure URL
            const uploadedResponse = await cloudinary.uploader.upload(profileImg);
            user.profileImg = uploadedResponse.secure_url;
        }

        // Handle cover image update
        if (coverImg) {
             // If the user already has a profile image, delete it from Cloudinary
             if (user.coverImg) {
                await cloudinary.uploader.destroy(user.coverImg .split('/').pop().split('.')[0]);
            }
            // Upload the new cover image to Cloudinary and get the secure URL
            const uploadedResponse = await cloudinary.uploader.upload(coverImg);
            user.coverImg = uploadedResponse.secure_url;
        }

        // Update the user's other fields if new values are provided, else retain existing values
        user.fullname = fullname || user.fullname;
        user.email = email || user.email;
        user.username = username || user.username;
        user.bio = bio || user.bio;
        user.link = link || user.link;

        // Save the updated user details to the database
        await user.save();

        // Set the password to null before sending the user object in the response for security reasons
        user.password = null;

        // Send a success response with the updated user details
        return res.status(200).json({
            user
        });

    } catch (error) {
        // Handle unexpected errors and send a generic error response
        res.status(500).json({
            error: "Internal server error"
        });
    }
};


export {getProfile,followUnfollowUser,getSuggestedUser,updateUser}