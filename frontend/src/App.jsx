import {
    BrowserRouter,
    Routes,
    Route
} from "react-router-dom";
import "./App.css";

import Register from "./components/Register";
import Login from "./components/Login";
import Projects from "./components/Projects";
import AdminUsers from "./components/AdminUsers";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/admin" element={<AdminUsers />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
