import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');

    if (!token) {
        // Si no hay token, redirige al usuario a la página de inicio de sesión
        return <Navigate to="/login" replace />;
    }
// Si hay token, renderiza el componente hijo
    return children;
}

export default ProtectedRoute;