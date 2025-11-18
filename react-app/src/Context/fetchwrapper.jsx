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

  // If body is FormData (file upload), don't set Content-Type
  if (!(options.body instanceof FormData)) {
    options.headers = {
      ...options.headers,
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    };
  } else {
    // For FormData, only attach Authorization and Accept
    options.headers = {
      ...options.headers,
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    };
  }

  try {
    const response = await fetch(`http://localhost:8000/api${url}`, options);

    if (response.status === 401) {
      console.log("Token expired. Logging out...");
      await logoutUser();
      return;
    }

    // Try to parse JSON, fallback to text
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return response.json();
    } else {
      return response.text();
    }
  } catch (error) {
    console.error("Fetch error:", error);
    throw error;
  }
};

export default fetchWrapper;
