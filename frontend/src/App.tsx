import { Routes, Route, BrowserRouter } from "react-router";
import HomeScreen from "./screens/HomeScreen";
import ColorToggle from "./components/ColorMode/CologToggle";
import ListingsScreen from "./screens/ListingsScreen";
import SpecificAdScreen from "./screens/SpecificAdScreen";
import { AuthProvider } from "./context/AuthContext";
import AuthScreen from "./screens/AuthScreen";
import ProtectedRoute from "./components/routes/ProtectedRoute";
import ProfileScreen from "./screens/ProfileScreen";
import CreateAdScreen from "./screens/CreateAdScreen";

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <ColorToggle>
                    <Routes>
                        <Route path="/" element={<HomeScreen />} />
                        <Route path="/ads" element={<ListingsScreen />} />
                        <Route path="/ads/:id" element={<SpecificAdScreen />} />
                        <Route path="/login" element={<AuthScreen />} />
                        <Route
                            path="/profile"
                            element={
                                <ProtectedRoute>
                                    <ProfileScreen />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/post-ad"
                            element={
                                <ProtectedRoute>
                                    <CreateAdScreen />
                                </ProtectedRoute>
                            }
                        />
                    </Routes>
                </ColorToggle>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
