import jwt from "jsonwebtoken";
const authMiddleware = (req,res,next) => {

    try{

        const authHeader = req.headers.authorization;

        if (!authHeader){

            return res.status(401).json({message:"No token provided,"});
        }

        const token = authHeader.split(" ")[1];
        //console.log("Received token:", token);

        const checker= jwt.verify(token, process.env.JWT_SECRET);

        req.user = checker;
        next();



    }catch(error){

        res.status(401).json({message: "invalid token,"});
        console.log(`Error from authMiddleware ${error.message}`);
    }
};

export default authMiddleware;
