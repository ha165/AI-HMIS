import { useNavigate } from "react-router-dom";
import { useState, useContext } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AppContext } from "../../Context/AppContext";
export default function Login() {
  const { setToken } = useContext(AppContext);
  const navigate = useNavigate();
  const [formdata, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});

  async function handleLogin(e) {
    e.preventDefault();
    try {
      const res = await fetch("api/login", {
        method: "POST",
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
    <div>
      <h1 className="title">Login Here</h1>
      <form onSubmit={handleLogin} className="w-1/2 mx-auto space-y-6">
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
        <button className="primary-btn">Login</button>
      </form>
      <ToastContainer />
    </div>
  );
}
