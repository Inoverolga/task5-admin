import config from "../config";
export const dataProvider = {
  getList: async (resource, params) => {
    if (resource === "users") {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${config.API_URL}/api/auth/all-users`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));

          if (response.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            setTimeout(() => {
              window.location.href = "#/login";
            }, 100);
            throw new Error(errorData.error || "Authentication required");
          }

          throw new Error(
            errorData.error || `Server error: ${response.status}`
          );
        }

        const result = await response.json();

        return {
          data: result,
          total: result.length,
        };
      } catch (error) {
        console.error("DataProvider getList error:", error);
        throw error;
      }
    }
    return { data: [], total: 0 };
  },
};
