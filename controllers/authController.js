import User from '../models/userSchema.js'
import bcrypt from 'bcryptjs'
import generateToken from '../utils/generateTojken.js';




const signup = async (req, res) => {
    try {
        const { username, fullname, email, password } = req.body;

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                error: "Invalid email format"
            });
        }

        // Check if email or username already exists
        const existingEmail = await User.findOne({ email });
        const existingUsername = await User.findOne({ username });
        if (existingEmail || existingUsername) {
            return res.status(400).json({
                error: "Email or username already exists"
            });
        }

        // Validate password length
        if (password.length < 6) {
            return res.status(400).json({
                error: "Password must be at least 6 characters long!"
            });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const newUser = new User({
            username,
            fullname,
            email,
            password: hashedPassword
        });

        // Generate token and set it in the cookies
        generateToken(newUser._id, res);

        // Save user to database
        await newUser.save();

        // Respond with user data
        res.status(200).json({
            message: "User created successfully",
            _id: newUser._id,
            username: newUser.username,
            fullname: newUser.fullname,
            email: newUser.email,
            followers: newUser.followers,
            following: newUser.following,
            profileImg: newUser.profileImg,
            coverImg: newUser.coverImg,
            bio: newUser.bio,
            link: newUser.link
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Internal server error"
        });
    }
};
const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ error: "Invalid username" });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ error: "Invalid password" });
        }

        // Generate token without sending a response
        const token = generateToken(user._id);

        // Send response only once
        res.status(200).json({
            message: "Successfully logged in",
            token,
            _id: user._id,
            username: user.username,
            fullname: user.fullname,
            email: user.email,
            followers: user.followers,
            following: user.following,
            profileImg: user.profileImg,
            coverImg: user.coverImg,
            bio: user.bio,
            link: user.link,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const logout=async(req,res)=>{
    try {
        res.cookie("jwt","",{maxAge:0})
        res.status(200).json(
            {
                message:"Logout successfully !"
            }
        )
        
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: error.message
        });
        
    }

}
const getMe=async(req,res)=>{
    try {
        const user= await User.findOne({_id:req.user._id}).select("-password")
        res.status(200).json(user)
           
        
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: error.message
        });
    }
}

export {signup,login,logout,getMe };