import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";

export default function CompleteRegistration() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [formdata, setFormData] = useState({
    first_name: state?.first_name || "",
    last_name: state?.last_name || "",
    email: state?.email || "",
    dob: "",
    gender: "",
    address: "",
    emergency_contact: "",
  });

  async function handleSubmit(e) {
    e.preventDefault();

    const token = localStorage.getItem("token");
    const res = await fetch("api/complete-registration", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formdata),
    });

    const data = await res.json();

    if (!res.ok) {
      toast.error(data.message || "Failed to complete registration");
    } else {
      toast.success("Registration Completed!");
      navigate("/dashboard");
    }
  }

  function handleChange(e) {
    setFormData({ ...formdata, [e.target.name]: e.target.value });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 shadow-lg rounded-lg max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6">Complete Your Registration</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="first_name"
            value={formdata.first_name}
            onChange={handleChange}
            className="input-field"
          />
          <input
            type="text"
            name="last_name"
            value={formdata.last_name}
            onChange={handleChange}
            className="input-field"
          />
          <input
            type="email"
            name="email"
            value={formdata.email}
            disabled
            className="input-field bg-gray-200"
          />
          <input
            type="date"
            name="dob"
            onChange={handleChange}
            className="input-field"
            required
          />
          <select
            name="gender"
            onChange={handleChange}
            className="input-field"
            required
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
          <input
            type="text"
            name="address"
            onChange={handleChange}
            className="input-field"
            required
          />
          <input
            type="text"
            name="emergency_contact"
            onChange={handleChange}
            className="input-field"
            required
          />
          <button type="submit" className="btn-primary">
            Complete Registration
          </button>
        </form>
      </div>
      <ToastContainer />
    </div>
  );
}
