import User from "../models/User.js";

const getAllStaff = async (req , res) => {

      try{

         const staff = await User.find({
            role : "staff"
         }, "name email")

         console.log(staff);
         res.json(staff);

      }catch(error){

          res.status(500).json({message: error.message});
      }
};

export {getAllStaff};