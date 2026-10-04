import { Navigate } from "react-router-dom";

function ProtectAuth({ children, role }) {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  if (!token) {
    return <Navigate to="/" />;
  }
  if (role && user.role !== role) {
    return <Navigate to="/" />;
  }
  return children;
}

export default ProtectAuth;
