import { useState } from "react";
import api from "../services/api.js";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";


function Register() {


  const navigate = useNavigate();


  const [formData, setFormData] = useState({

    name: "",
    email: "",
    password: "",
    role: "staff",

  });



  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

  };




  const handleSubmit = async (e) => {

    e.preventDefault();


    try {


      await api.post("/auth/register", formData);


      toast.success("Registration successful");


      navigate("/login");


    } catch(error) {


      console.log(error.response?.data?.message);


      toast.error(
        error.response?.data?.message || "Registration failed"
      );

    }

  };





  return (

    <div className="min-h-screen flex items-center justify-center bg-gray-100">


      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">


        <h1 className="text-3xl font-bold text-center mb-6">
          Register
        </h1>




        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >



          <input
            name="name"
            type="text"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border rounded-md px-4 py-2"
          />




          <input
            name="email"
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full border rounded-md px-4 py-2"
          />




          <input
            name="password"
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full border rounded-md px-4 py-2"
          />




          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full border rounded-md px-4 py-2"
          >

            <option value="staff">
              Staff
            </option>


            <option value="admin">
              Admin
            </option>


          </select>




          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
          >
            Register
          </button>




        </form>




      </div>


    </div>

  );
}


export default Register;