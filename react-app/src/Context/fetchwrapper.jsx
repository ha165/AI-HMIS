const logoutUser = async () => {
  try {
    await fetch("/api/logout", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Logout failed:", error);
  } finally {
    localStorage.removeItem("token");
    localStorage.removeItem("loginTime");
    window.location.href = "/login";
  }
};

const fetchWrapper = async (url, options = {}) => {
  const token = localStorage.getItem("token");

  options.headers = {
    ...options.headers,
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
    "Content-Type": "application/json",
  };

  try {
    const response = await fetch(`http://localhost:8000/api${url}`, options);
    const data = await response.json();

    if (response.status === 401) {
      console.log("Token expired. Logging out...");
      await logoutUser();
      return;
    }

    return data;
  } catch (error) {
    console.error("Fetch error:", error);
    throw error;
  }
};
export default fetchWrapper;
