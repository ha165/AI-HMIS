import { createContext, useState, useEffect } from "react";

export const AppContext = createContext({});

export default function AppProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Add loading state

  async function getUser() {
    try {
      const res = await fetch("api/user", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        setUser(null); // Clear user if API call fails
      }
    } catch (error) {
      console.error("Failed to fetch user:", error);
      setUser(null);
    } finally {
      setLoading(false); // End loading state
    }
  }

  useEffect(() => {
    if (token) {
      getUser();
    } else {
      setLoading(false); // If no token, stop loading
    }
  }, [token]);

  return (
    <AppContext.Provider value={{ token, setToken, user, setUser, loading }}>
      {children}
    </AppContext.Provider>
  );
}
