import { useState } from "react";
import api from "../services/api.js";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    //console.log(formData);
    try {
      const response = await api.post("/auth/login", formData); //await only works on async function

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      console.log(localStorage);

      if (response.data.user.role == "admin") {
        toast.success("Login successful");
        navigate("/admin/dashboard");
      } else {
        navigate("/staff/dashboard");
      }

      //console.log(response.data);
    } catch (error) {
      console.log(error.response?.data?.message || "Login Failed");
      toast.error("Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-center mb-6">Login </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full border rounder-md px-4 py-2"
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full border rounder-md px-4 py-2"
          />

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
          >
            Login
          </button>

          <p className="text-center mt-4">

            Don't have an account?

            <button
              type="button"
              onClick={() => navigate("/register")}
              className="text-blue-600 ml-2"
            >
              Register
            </button>

          </p>

        </form>
      </div>
    </div>
  );
}

export default Login;

/*Email: admin@gmail.com
Password: 123456 */
