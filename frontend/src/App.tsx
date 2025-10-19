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
import EditAdScreen from "./screens/EditAdScreen";
import PublicProfile from "./screens/PublicProfile";
import AdminRoute from "./components/routes/AdminRoute";
import AdminDashboard from "./screens/Admin/AdminDashboard";
import AdminUsers from "./screens/Admin/AdminUsers";
import AdminAds from "./screens/Admin/AdminAds";
import AdminCatalog from "./screens/Admin/AdminCatalog";
import FavouritesScreen from "./screens/FavouritesScreen";

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
                        <Route
                            path="/ads/:id/edit"
                            element={
                                <ProtectedRoute>
                                    <EditAdScreen />
                                </ProtectedRoute>
                            }
                        />
                        <Route path="/users/:id" element={<PublicProfile />} />
                        <Route
                            path="/admin"
                            element={
                                <AdminRoute>
                                    <AdminDashboard />
                                </AdminRoute>
                            }
                        />
                        <Route
                            path="/admin/users"
                            element={
                                <AdminRoute>
                                    <AdminUsers />
                                </AdminRoute>
                            }
                        />
                        <Route
                            path="/admin/ads"
                            element={
                                <AdminRoute>
                                    <AdminAds />
                                </AdminRoute>
                            }
                        />
                        <Route
                            path="/admin/catalog"
                            element={
                                <AdminRoute>
                                    <AdminCatalog />
                                </AdminRoute>
                            }
                        />
                        <Route
                            path="/favourites"
                            element={
                                <ProtectedRoute>
                                    <FavouritesScreen />
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
