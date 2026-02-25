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

  const response = await fetch(
    `http://localhost:8000/api${url}`,
    options
  );

  if (response.status === 401) {
    await logoutUser();
    return;
  }

  const data = await response.json();

  if (!response.ok) {
    throw data; 
  }

  return data;
};

export default fetchWrapper;
