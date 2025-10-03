export const authProvider = {
  login: async ({ username, password }) => {
    try {
      const response = await fetch("http://localhost:3001/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: username, password }),
      });

      if (response.status === 401) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Invalid email or password");
      }

      if (response.status === 403) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Account is blocked");
      }

      if (!response.ok) {
        throw new Error(`Login failed: ${response.status}`);
      }

      const result = await response.json();

      localStorage.setItem("token", result.token);
      localStorage.setItem("user", JSON.stringify(result.user));

      return Promise.resolve();
    } catch (error) {
      return Promise.reject(new Error(error.message));
    }
  },

  logout: () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    return Promise.resolve();
  },

  checkError: ({ status }) => {
    if (status === 401 || status === 403) {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      setTimeout(() => {
        window.location.href = "#/login";
      }, 100);
      return Promise.reject();
    }
    return Promise.resolve();
  },

  checkAuth: () => {
    return localStorage.getItem("user") ? Promise.resolve() : Promise.reject();
  },

  getPermissions: () => Promise.resolve(),
};
