import { Routes, Route, BrowserRouter } from "react-router";
import HomeScreen from "./screens/HomeScreen";
import ColorToggle from "./components/ColorMode/CologToggle";
import ListingsScreen from "./screens/ListingsScreen";
import SpecificAdScreen from "./screens/SpecificAdScreen";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import AuthScreen from "./screens/AuthScreen";

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
                    </Routes>
                </ColorToggle>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
