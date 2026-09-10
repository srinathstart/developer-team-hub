import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import apiFetch from "../api";

function Login() {
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState(
        () => sessionStorage.getItem("authNotice") || ""
    );
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        sessionStorage.removeItem("authNotice");
    }, []);

    async function handleSubmit(e) {
        e.preventDefault();

        if (submitting) {
            return;
        }

        setError("");
        setNotice("");
        setSubmitting(true);

        try {
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

            if (response.ok && data.token) {
                sessionStorage.setItem("token", data.token);
                navigate("/projects");
            } else if (response.ok) {
                setError("Login response did not include an authentication token");
            } else {
                setError(data.error || "Login failed");
            }
        } finally {
            setSubmitting(false);
        }
    }

    return (
    <div className="auth-page">
        <a className="skip-link" href="#main-content">Skip to main content</a>
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

                <div className="auth-illustration" aria-hidden="true">
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

            <main className="auth-form-panel" id="main-content" tabIndex="-1">
                <form
                    className="auth-form"
                    aria-busy={submitting}
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
                        autoComplete="username"
                        required
                        aria-describedby={error ? "login-error" : undefined}
                        value={username}
                        onChange={(e) =>
                            setUsername(e.target.value)
                        }
                    />

                    <label htmlFor="password">
                        Password
                    </label>

                    <div className="auth-password-field">
                        <input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            autoComplete="current-password"
                            required
                            aria-describedby={error ? "login-error" : undefined}
                            value={password}
                            onChange={(e) =>
                                setPassword(e.target.value)
                            }
                        />
                        <button
                            type="button"
                            className="auth-password-toggle"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                            aria-pressed={showPassword}
                            onClick={() => setShowPassword((visible) => !visible)}
                        >
                            {showPassword ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
                        </button>
                    </div>

                    {notice && (
                        <p className="auth-notice" role="status">
                            {notice}
                        </p>
                    )}

                    {error && (
                        <p className="auth-error" id="login-error" role="alert">
                            {error}
                        </p>
                    )}

                    <button
                        className="auth-submit"
                        type="submit"
                        disabled={submitting}
                    >
                        {submitting ? "Logging in..." : "Log in"}
                    </button>

                    <p className="auth-switch">
                        Don't have an account?{" "}
                        <Link to="/register">
                            Register
                        </Link>
                    </p>
                </form>
            </main>
        </div>
    </div>
);
}

export default Login;
