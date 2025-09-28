import { createContext, useContext, useEffect } from "react";
import type { ReactNode } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchCurrentUser } from "../store/slices/authSlice";

interface AuthContextProps {
    isAuthenticated: boolean;
    loading: boolean;
}

const AuthContext = createContext<AuthContextProps>({
    isAuthenticated: false,
    loading: true,
});

export const useAuthServiceContext = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const dispatch = useAppDispatch();
    const { user, loading } = useAppSelector((state) => state.auth);

    useEffect(() => {
        dispatch(fetchCurrentUser());
    }, [dispatch]);

    return (
        <AuthContext.Provider value={{ isAuthenticated: !!user, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
