import { Routes, Route, BrowserRouter } from "react-router";
import HomeScreen from "./screens/HomeScreen";
import ColorToggle from "./components/ColorMode/CologToggle";

function App() {
    return (
        <BrowserRouter>
            <ColorToggle>
                <Routes>
                    <Route path="/" element={<HomeScreen />} />
                </Routes>
            </ColorToggle>
        </BrowserRouter>
    );
}

export default App;
