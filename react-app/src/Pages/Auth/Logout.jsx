import { useContext } from "react";
import { AppContext } from "../../Context/AppContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import fetchWrapper from "../../Context/fetchwrapper";

export default function useLogout() {
  const { setToken } = useContext(AppContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await fetchWrapper("/logout", {
        method: "POST",
      });
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      setToken(null);
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      toast.error("Failed to logout");
      console.error("Logout error:", error);
    }
  };

  return { handleLogout };
}
