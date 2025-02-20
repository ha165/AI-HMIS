import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function CompleteRegistration() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = location.state?.user || {};

  const [formData, setFormData] = useState({
    first_name: user.first_name || "",
    last_name: user.last_name || "",
    email: user.email || "", 
    dob: "",
    gender: "",
    address: "",
    emergency_contact: "",
  });

  function handleInputChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      const res = await fetch("api/complete-registration", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to complete registration");

      toast.success("Registration Completed!");
      navigate("/dashboard");
    } catch (error) {
      toast.error("Something went wrong, please try again!");
      console.error(error);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-4">
          Complete Your Registration
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* First Name */}
          <input
            type="text"
            name="first_name"
            value={formData.first_name}
            onChange={handleInputChange}
            className="w-full p-3 border rounded text-gray-600"
            placeholder="First Name"
          />

          {/* Last Name */}
          <input
            type="text"
            name="last_name"
            value={formData.last_name}
            onChange={handleInputChange}
            className="w-full p-3 border rounded  text-gray-600"
            placeholder="Last Name"
          />

          {/* Email (Readonly) */}
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="w-full p-3 border rounded text-gray-600"
          />

          {/* DOB */}
          <input
            type="date"
            name="dob"
            value={formData.dob}
            onChange={handleInputChange}
            className="w-full p-3 border rounded text-gray-600"
          />

          {/* Gender */}
          <select
            name="gender"
            value={formData.gender}
            onChange={handleInputChange}
            className="w-full p-3 border rounded text-gray-600"
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>

          {/* Address */}
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            className="w-full p-3 border rounded text-gray-600"
            placeholder="Address"
          />

          {/* Emergency Contact */}
          <input
            type="text"
            name="emergency_contact"
            value={formData.emergency_contact}
            onChange={handleInputChange}
            className="w-full p-3 border rounded text-gray-600"
            placeholder="Emergency Contact"
          />

          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-3 rounded"
          >
            Complete Registration
          </button>
        </form>
        <ToastContainer />
      </div>
    </div>
  );
}
