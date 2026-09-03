import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");

        const response = await fetch("http://localhost:3000/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username,
                password
            })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem("token", data.token);
            navigate("/projects");
        } else {
            setError(data.error || "Login failed");
        }
    }

    return (
        <div className="login-page">
            <div className="login-card">
                <h1>Developer Team Hub</h1>
                <h2>Login</h2>

                <form
                    className="login-form"
                    onSubmit={handleSubmit}
                >
                    <label htmlFor="username">Username</label>

<input
    id="username"
    type="text"
    placeholder="Username"
    value={username}
    onChange={(e) => setUsername(e.target.value)}
/>

                    <label htmlFor="password">Password</label>

<input
    id="password"
    type="password"
    placeholder="Password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
/>

                    {error && <p>{error}</p>}

                    <button type="submit">
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Login;