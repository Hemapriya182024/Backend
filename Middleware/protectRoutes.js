import jwt from 'jsonwebtoken'
import User from '../models/userSchema.js';


const protectRoutes = async (req, res, next) => {

    try {

        const token = req.cookies.jwt;
        if (!token) {
            return res.status(400).json(
                {
                    error: "Unauthorized token or No token provided"
                }
            )
        }
        const decoded = jwt.verify(token, process.env.SECRET_KEY)
        if (!decoded) {
            return res.status(400).json(
                {
                    error: "Unauthorized : Invalid Token"
                }
            )
        }
        const user = await User.findOne({ _id: decoded.userId }).select("-password")
        if (!user) {
            return res.status(400).json(
                {

                    error: "User not found"
                }

            )
        }
        req.user=user;
        next()

    } catch (error) {
        console.log('Error in protected route middleware')
        res.status(400).json(
            {
                error: "Internal  server error"
            }
        )

    }

}

export { protectRoutes }