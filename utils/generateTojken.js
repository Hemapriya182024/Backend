// import jwt from "jsonwebtoken"


// const generateToken = (userId, res) => {
//     const token = jwt.sign({ userId }, process.env.SECRET_KEY, { expiresIn: "10h" });
//     // console.log(process.env.SECRET_KEY)

    
//     res.cookie("jwt", token, {
//         maxAge: 15 * 24 * 60 * 60 * 1000,  
//         HttpOnly : true,
//         SameSite : true

//     });
    
// };



// export default generateToken
import jwt from "jsonwebtoken"


const generateToken = (userId) => {
    return  jwt.sign({ userId }, process.env.SECRET_KEY, { expiresIn: "15d" });
   
    
};



export default generateToken 
// console.log("token in protedroute",token)

    
    // res.cookie("jwt", token);