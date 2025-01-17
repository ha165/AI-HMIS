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
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-blue-600 text-white shadow">
        <nav className="container mx-auto flex justify-between items-center p-4">
          <Link
            to="/"
            className="text-xl font-bold hover:text-blue-200 transition duration-300"
          >
            Hospital Management
          </Link>
          <div className="flex items-center space-x-6">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium">
                  Welcome Back, {user.name}
                </span>
                <form onSubmit={handleLogout}>
                  <button
                    type="submit"
                    className="bg-white text-blue-600 px-3 py-1 rounded-md hover:bg-blue-700 hover:text-white transition duration-300"
                  >
                    Logout
                  </button>
                </form>
              </div>
            ) : (
              <div className="space-x-4">
                <Link
                  to="/login"
                  className="hover:text-blue-200 transition duration-300"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="hover:text-blue-200 transition duration-300"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-grow bg-gray-100 py-8">
        <div className="container mx-auto p-4">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-blue-600 text-white text-center py-4">
        <p className="text-sm">
          © {new Date().getFullYear()} Hospital Management. All rights
          reserved.
        </p>
      </footer>

      {/* Toast Notifications */}
      <ToastContainer />
    </div>
  );
}
