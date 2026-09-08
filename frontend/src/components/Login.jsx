import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import apiFetch from "../api";

function Login() {
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");

        const response = await apiFetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
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
            navigate("/projects");
        } else {
            setError(data.error || "Login failed");
        }
    }

    return (
    <div className="auth-page">
        <div className="auth-container">
            <div className="auth-brand-panel">
                <div>
                    <div className="auth-brand">
                        <div className="auth-logo"></div>
                        <span>Developer Team Hub</span>
                    </div>

                    <p className="auth-brand-description">
                        Manage projects, tasks, and team collaboration
                        in one place.
                    </p>
                </div>

                <div className="auth-illustration">
                    <div className="node node-center"></div>
                    <div className="node node-one"></div>
                    <div className="node node-two"></div>
                    <div className="node node-three"></div>
                    <div className="node node-four"></div>
                </div>

                <p className="auth-brand-footer">
                    Built for engineering teams.
                </p>
            </div>

            <div className="auth-form-panel">
                <form
                    className="auth-form"
                    onSubmit={handleSubmit}
                >
                    <h1>Sign in</h1>

                    <p className="auth-form-subtitle">
                        Welcome back. Enter your details.
                    </p>

                    <label htmlFor="username">
                        Username
                    </label>

                    <input
                        id="username"
                        type="text"
                        placeholder="jane.doe"
                        value={username}
                        onChange={(e) =>
                            setUsername(e.target.value)
                        }
                    />

                    <label htmlFor="password">
                        Password
                    </label>

                    <input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) =>
                            setPassword(e.target.value)
                        }
                    />

                    {error && (
                        <p className="auth-error">
                            {error}
                        </p>
                    )}

                    <button
                        className="auth-submit"
                        type="submit"
                    >
                        Log in
                    </button>

                    <p className="auth-switch">
                        Don't have an account?{" "}
                        <Link to="/register">
                            Register
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    </div>
);
}

export default Login;
