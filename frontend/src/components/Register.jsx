import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function Register() {
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");

        const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {           
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username,
                    password
                })
            }
        );

        const data = await response.json();

        if (response.ok) {
            navigate("/login");
        } else {
            setError(data.error || "Registration failed");
        }
    }

    return (
        <div className="login-page">
            <div className="login-card">
                <h1>Developer Team Hub</h1>
                <h2>Register</h2>

                <form className="login-form" onSubmit={handleSubmit}>
                    <label htmlFor="register-username">
                        Username
                    </label>

                    <input
                        id="register-username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />

                    <label htmlFor="register-password">
                        Password
                    </label>

                    <input
                        id="register-password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <p>
                        Password must be at least 8 characters and include
                        uppercase, lowercase, and a number.
                    </p>

                    {error && <p>{error}</p>}

                    <button type="submit">
                        Register
                    </button>
                </form>
                <p>
    Already have an account?{" "}
    <Link to="/login">Login</Link>
</p>
            </div>
        </div>
    );
}

export default Register;