import { Layout } from "react-admin";
import { useLocation } from "react-router-dom";

const MyLayout = ({ children, ...props }) => {
  const location = useLocation();

  if (location.pathname === "/register" || location.pathname === "/login") {
    return <div>{children}</div>;
  }

  return (
    <Layout {...props} sidebar={() => null} appBar={Layout.AppBar}>
      {children}
    </Layout>
  );
};

export default MyLayout;
