import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
const ProtectedRoute = ({ element, user }) => {
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);
  
    useEffect(() => {
      const fetchUserRole = async () => {
        const token = localStorage.getItem("token");
  
        if (!token) {
          setLoading(false);
          return;
        }
  
        try {
          const res = await fetch("/api/user/role", {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });
  
          if (res.status === 401) {
            console.error("Unauthorized: Token may be invalid or expired.");
            localStorage.removeItem("token");
            setLoading(false);
            return;
          }
  
          const data = await res.json();
          setRole(data.role);
        } catch (error) {
          console.error("Error fetching role:", error);
        } finally {
          setLoading(false);
        }
      };
  
      if (user) {
        fetchUserRole();
      } else {
        setLoading(false);
      }
    }, [user]);
  
    if (loading) {
      return <p>Loading...</p>;
    }
  
    if (!user) {
      return <Navigate to="/login" replace />;
    }
  
    if (role !== "admin" && window.location.pathname === "/") {
      return <Navigate to="/dashboard" replace />;
    }
  
    return element;
  };
  export default ProtectedRoute;