import { toast } from "react-toastify";

const logoutUser = async () => {
  try {
    await fetch("http://localhost:8000/api/logout", {
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

  if (!(options.body instanceof FormData)) {
    options.headers = {
      ...options.headers,
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    };
  } else {
    options.headers = {
      ...options.headers,
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    };
  }

  try {
    const response = await fetch(
      `http://localhost:8000/api${url}`,
      options
    );

    const data = await response.json().catch(() => null);

    // 🔥 Auto logout on 401
    if (response.status === 401) {
      toast.error("Session expired. Logging out...");
      await logoutUser();
      return;
    }

    // 🔥 Auto show backend errors
    if (!response.ok) {
      const message =
        data?.message ||
        "Something went wrong. Please try again.";

      toast.error(message);
      throw new Error(message);
    }

    return data;

  } catch (error) {
    if (!error.message.includes("Session expired")) {
      toast.error(error.message || "Network error");
    }
    throw error;
  }
};

export default fetchWrapper;