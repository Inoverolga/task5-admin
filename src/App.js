import { useEffect } from "react";
import { Admin, Resource, CustomRoutes } from "react-admin";
import { Route } from "react-router-dom";
import { dataProvider } from "./providers/dataProvider.js";
import { authProvider } from "./providers/authProvider.js";
import { UserList } from "./components/UserList.js";
import MyLoginPage from "./MyLoginPage.js";
import Register from "./Register.js";
import MyLayout from "./Layout/Layout.js";

const App = () => {
  useEffect(() => {
    const user = localStorage.getItem("user");

    if (!user) {
      localStorage.removeItem("RaStore.users.listParams");
      localStorage.removeItem("RaStore.users.selectedIds");
    }
  }, []);

  return (
    <Admin
      dataProvider={dataProvider}
      authProvider={authProvider}
      loginPage={MyLoginPage}
      layout={MyLayout}
    >
      <CustomRoutes>
        <Route path="/register" element={<Register />} />
      </CustomRoutes>
      <Resource name="users" list={UserList} />
    </Admin>
  );
};
export default App;
