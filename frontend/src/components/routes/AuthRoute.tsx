import { Navigate } from "react-router-dom";
import { useAuthServiceContext } from "../../context/AuthContext";

const AuthRoute = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated } = useAuthServiceContext();

    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }
    return <>{children}</>;
};

export default AuthRoute;
