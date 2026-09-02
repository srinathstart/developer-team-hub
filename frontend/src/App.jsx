import {
    BrowserRouter,
    Routes,
    Route
} from "react-router-dom";
import "./App.css";

import Login from "./components/Login";
import Projects from "./components/Projects";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/projects" element={<Projects />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;