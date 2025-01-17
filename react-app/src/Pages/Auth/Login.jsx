import { useNavigate } from "react-router-dom";
import { useState, useContext } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AppContext } from "../../Context/AppContext";

export default function Login() {
  const { setToken } = useContext(AppContext);
  const navigate = useNavigate();
  const [formdata, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});

  async function handleLogin(e) {
    e.preventDefault();
    try {
      const res = await fetch("api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formdata),
      });

      if (!res.ok) throw new Error("Network response was not ok");

      const data = await res.json();
      if (data.errors) {
        setErrors(data.errors);
        toast.error("Login Failed");
      } else {
        localStorage.setItem("token", data.token);
        setToken(data.token);
        toast.success("Login Successful");
        navigate("/");
      }
    } catch (error) {
      toast.error("Something went wrong, please try again!");
      console.error(error);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-100 to-blue-200 flex items-center justify-center">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">
          Welcome Back
        </h1>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              type="text"
              id="email"
              placeholder="Enter your email"
              value={formdata.email}
              onChange={(e) =>
                setFormData({ ...formdata, email: e.target.value })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
            {errors.email && (
              <p className="mt-2 text-sm text-red-600">{errors.email[0]}</p>
            )}
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              placeholder="Enter your password"
              value={formdata.password}
              onChange={(e) =>
                setFormData({ ...formdata, password: e.target.value })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
            {errors.password && (
              <p className="mt-2 text-sm text-red-600">{errors.password[0]}</p>
            )}
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-150"
          >
            Login
          </button>
        </form>
        <p className="mt-6 text-center text-gray-500 text-sm">
          Don’t have an account?{" "}
          <a href="/register" className="text-blue-600 hover:underline">
            Sign up here
          </a>
        </p>
      </div>
      <ToastContainer />
    </div>
  );
}
