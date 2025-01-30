import { useNavigate } from "react-router-dom";
import { useState, useContext } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AppContext } from "../../Context/AppContext";
import { tokens } from "../../../themes";

export default function Register() {
  const { setToken } = useContext(AppContext);
  const navigate = useNavigate();
  const [formdata, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    password: "",
    password_confirmation: "",
    profile_photo: "",
  });
  const [errors, setErrors] = useState({});
  const themeMode = "dark";
  const colors = tokens(themeMode);

  async function handleRegister(e) {
    e.preventDefault();

    const formData = new FormData();
    formData.append("first_name", formdata.first_name);
    formData.append("last_name", formdata.last_name);
    formData.append("email", formdata.email);
    formData.append("phone", formdata.phone);
    formData.append("password", formdata.password);
    formData.append("password_confirmation", formdata.password_confirmation);
    formData.append("role", "patient"); // Set default role or allow selection

    if (formdata.profile_photo) {
      formData.append("profile_photo", formdata.profile_photo);
    }

    try {
      const res = await fetch("api/register", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Network response was not ok");

      const data = await res.json();
      if (data.errors) {
        setErrors(data.errors);
        toast.error("Registration Failed");
      } else {
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.role);
        setToken(data.token);
        toast.success("Registration Successful");

        if (data.role === "admin") {
          navigate("/")
        } else {
          navigate("/dashboard"); 
        }
      }
    } catch (error) {
      toast.error("Something went wrong, please try again!");
      console.error(error);
    }
  }

  function handleInputChange(e) {
    setFormData({ ...formdata, [e.target.name]: e.target.value });
  }

  function handleFileChange(e) {
    setFormData({ ...formdata, profile_photo: e.target.files[0] });
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-100 to-blue-200 flex items-center justify-center">
      <div
        className={`bg-${colors.grey[100]} shadow-lg rounded-lg p-8 w-full max-w-md`}
      >
        <h1
          className={`text-3xl font-bold text-center text-${colors.primary[500]} mb-6`}
        >
          Create Your Account
        </h1>
        <form onSubmit={handleRegister} className="flex flex-col space-y-4">
          {[
            { name: "first_name", type: "text", placeholder: "First Name" },
            { name: "last_name", type: "text", placeholder: "Last Name" },
            { name: "email", type: "email", placeholder: "Email" },
            { name: "phone", type: "text", placeholder: "Phone Number" },
            { name: "password", type: "password", placeholder: "Password" },
            {
              name: "password_confirmation",
              type: "password",
              placeholder: "Confirm Password",
            },
          ].map((input) => (
            <div key={input.name} className="flex flex-col">
              <input
                type={input.type}
                name={input.name}
                placeholder={input.placeholder}
                value={formdata[input.name]}
                onChange={handleInputChange}
                className="input-field w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-500"
              />
              {errors[input.name] && (
                <p className="error-text text-red-600">
                  {errors[input.name][0]}
                </p>
              )}
            </div>
          ))}

          <input
            type="file"
            name="profile_photo"
            accept="image/*"
            onChange={handleFileChange}
            className="file-input w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.profile_photo && (
            <p className="error-text text-red-600">{errors.profile_photo[0]}</p>
          )}

          <button
            type="submit"
            className="btn-primary w-full p-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Register
          </button>
        </form>
        <p className="mt-6 text-center text-gray-500 text-sm">
          Already have an account?{" "}
          <a
            href="/login"
            className={`text-${colors.primary[500]} hover:underline`}
          >
            Login here
          </a>
        </p>
      </div>
      <ToastContainer />
    </div>
  );
}
