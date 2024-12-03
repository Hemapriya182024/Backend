
// import jwt from 'jsonwebtoken';
// import User from '../models/userSchema.js';

// const protectRoutes = async (req, res, next) => {
//     try {
//         // Ensure cookie-parser is used in your app to parse cookies
//         const token = req.cookies.jwt;
//         if (!token) {
//             return res.status(401).json({ error: "Unauthorized: No token provided" });
//         }

//         // Verify token
//         let decoded;
//         try {
//             decoded = jwt.verify(token, process.env.SECRET_KEY);
//         } catch (err) {
//             return res.status(401).json({ error: "Unauthorized: Invalid or expired token" });
//         }

//         // Find user and exclude the password field
//         const user = await User.findOne({ _id: decoded.userId }).select("-password");
//         if (!user) {
//             return res.status(404).json({ error: "User not found" });
//         }

//         // Attach user to request object
//         req.user = user;
//         next();
//     } catch (error) {
//         console.error('Error in protectRoutes middleware:', error);
//         res.status(500).json({ error: "Internal server error" });
//     }
// };

// export { protectRoutes };
import jwt from 'jsonwebtoken';
import User from '../models/userSchema.js';

const protectRoutes = async (req, res, next) => {
    try {
        // Get token from headers
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: "Unauthorized: No token provided" });
        }

        const token = authHeader.split(' ')[1]; // Extract the token after 'Bearer '

        // Verify token
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.SECRET_KEY);
        } catch (err) {
            return res.status(401).json({ error: "Unauthorized: Invalid or expired token" });
        }

        // Find user and exclude the password field
        const user = await User.findOne({ _id: decoded.userId }).select("-password");
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Attach user to request object
        req.user = user;
        next();
    } catch (error) {
        console.error('Error in protectRoutes middleware:', error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export { protectRoutes };
