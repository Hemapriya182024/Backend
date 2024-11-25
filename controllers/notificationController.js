
import Notification from "../models/notification.js";

const getNotifications=async(req,res)=>{
    try {
        const userId=req.user._id;
        const notification=await Notification.find({to:userId}).populate({
            path:"from",
            select:"username profileImg"
        })
        await Notification.updateMany({to:userId},{read:true})
        res.status(200).json(notification)
        
    } 
   

    catch (error) {
        console.log("Error occured in notification controller")
        res.status(500).json({
            error:"Internal  server error"

        })
        
    }
}
const deleteNotifications = async (req, res) => {
    try {
        // Ensure userId exists in the request object
        const userId = req.user?._id;
        if (!userId) {
            return res.status(400).json({ error: "User ID is required" });
        }

        // Delete all notifications sent to the user
        await Notification.deleteMany({ to: userId });

        // Respond with a success message
        res.status(200).json({ message: "Notifications deleted successfully!" });
    } catch (error) {
        // Log the actual error for debugging
        console.error("Error occurred in notification controller:", error.message);

        // Respond with an internal server error message
        res.status(500).json({
            error: "Internal server error",
            message: error.message,
        });
    }
};


export {getNotifications,deleteNotifications}