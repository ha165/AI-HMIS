import { useContext } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { AppContext } from "../Context/AppContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Layout() {
  const { user, token, setToken, setUser } = useContext(AppContext);
  const navigate = useNavigate();

  async function handleLogout(e) {
    e.preventDefault();

    try {
      const res = await fetch("api/logout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      console.log(data);

      if (res.ok) {
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
        toast.success("Logout successful!"); 
        navigate("/");
      } else {
        toast.error(data.message || "Logout failed!");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred during logout."); 
    }
  }

  return (
    <>
      <header>
        <nav>
          <Link to="/" className="nav-link">
            Home
          </Link>
          {user ? (
            <div className="flex items-center space-x-4">
              <p className="text-slate-400 text-xs">Welcome Back {user.name}</p>
              <form onSubmit={handleLogout}>
                <button className="nav-link">Logout</button>
              </form>
            </div>
          ) : (
            <div className="space-x-4">
              <Link to="/login" className="nav-link">
                Login
              </Link>
              <Link to="/register" className="nav-link">
                Register
              </Link>
            </div>
          )}
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
      {/* Add ToastContainer */}
      <ToastContainer />
    </>
  );
}
