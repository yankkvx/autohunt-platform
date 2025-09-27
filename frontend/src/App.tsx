import { Routes, Route, BrowserRouter } from "react-router";
import HomeScreen from "./screens/HomeScreen";
import ColorToggle from "./components/ColorMode/CologToggle";
import ListingsScreen from "./screens/ListingsScreen";
import SpecificAdScreen from "./screens/SpecificAdScreen";

function App() {
    return (
        <BrowserRouter>
            <ColorToggle>
                <Routes>
                    <Route path="/" element={<HomeScreen />} />
                    <Route path="/ads" element={<ListingsScreen />} />
                    <Route path="/ads/:id" element={<SpecificAdScreen />} />
                </Routes>
            </ColorToggle>
        </BrowserRouter>
    );
}

export default App;
