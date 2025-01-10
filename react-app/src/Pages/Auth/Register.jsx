import { useNavigate} from "react-router-dom";
import { useState } from "react";
import {ToastContainer,toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
export default function Register() {
  const navigate = useNavigate();
  const [formdata, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });

  const [errors, setErrors] = useState({});

  async function handleRegister(e) {
    e.preventDefault();
    const res = await fetch("api/register", {
      method: "POST",
      body: JSON.stringify(formdata),
    });

    const data = await res.json();

    if (data.errors) {
      setErrors(data.errors);
      toast.error("Registration Failed");
    } else {
      localStorage.setItem("token", data.token);
      toast.success("You Can Now Login");  
      navigate("/login");
      console.log(data);
    }
  }

  return (
    <div>
      <h1 className="title">Register</h1>
      <form onSubmit={handleRegister} className="w-1/2 mx-auto space-y-6">
        <div>
          <input
            type="text"
            placeholder="name"
            value={formdata.name}
            onChange={(e) => setFormData({ ...formdata, name: e.target.value })}
          />
          {errors.name && <span className="error">{errors.name[0]}</span>}
        </div>
        <div>
          <input
            type="text"
            placeholder="Email"
            value={formdata.email}
            onChange={(e) =>
              setFormData({ ...formdata, email: e.target.value })
            }
          />
          {errors.email && <span className="error">{errors.email[0]}</span>}
        </div>
        <div>
          <input
            type="password"
            placeholder="Password"
            value={formdata.password}
            onChange={(e) =>
              setFormData({ ...formdata, password: e.target.value })
            }
          />
          {errors.password && (
            <span className="error">{errors.password[0]}</span>
          )}
        </div>
        <div>
          <input
            type="password"
            placeholder="Confirm Password"
            value={formdata.password_confirmation}
            onChange={(e) =>
              setFormData({
                ...formdata,
                password_confirmation: e.target.value,
              })
            }
          />
        </div>

        <button className="primary-btn">Register</button>
      </form>
      <ToastContainer />
    </div>
  );
}
