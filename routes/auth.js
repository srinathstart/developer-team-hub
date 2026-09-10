const express = require("express");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const auth = require("../middleware/auth");
const csrf = require("../middleware/csrf");
const { authCookie, csrfCookie } = require("../utils/cookies");

const router = express.Router();

const pool = require("../db");

router.post("/register", async (req, res) => {
    const { username, password } = req.body || {};

    if (
        username === undefined ||
        username === null ||
        username === "" ||
        password === undefined ||
        password === null ||
        password === ""
    ) {
        return res.status(400).json({
            error: "Username and password are required"
        });
    }

    if (
        typeof username !== "string" ||
        typeof password !== "string"
    ) {
        return res.status(400).json({
            error: "Username and password must be strings"
        });
    }

    const normalizedUsername = username.trim();

    if (!normalizedUsername) {
        return res.status(400).json({
            error: "Username is required"
        });
    }

    if (password.length < 8) {
    return res.status(400).json({
        error: "Password must be at least 8 characters"
    });
}

if (!/[A-Z]/.test(password)) {
    return res.status(400).json({
        error: "Password must contain at least one uppercase letter"
    });
}

if (!/[a-z]/.test(password)) {
    return res.status(400).json({
        error: "Password must contain at least one lowercase letter"
    });
}

if (!/[0-9]/.test(password)) {
    return res.status(400).json({
        error: "Password must contain at least one number"
    });
}

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const role = "user";

        const result = await pool.query(
            `INSERT INTO users (username, password, role)
             VALUES ($1, $2, $3)
             RETURNING id, username, role`,
            [normalizedUsername, hashedPassword, role]
        );

        const newUser = result.rows[0];

        res.status(201).json({
            message: "User registered",
            user: {
                id: newUser.id,
                username: newUser.username,
                role: newUser.role
            }
        });
    } catch (error) {
    console.error(error);

    if (error.code === "23505") {
        return res.status(409).json({
            error: "Username already exists"
        });
    }

    res.status(500).json({
        error: "Failed to register user"
    });
}
});

router.post("/login", async (req, res) => {
    const { username, password } = req.body || {};

    if (
        username === undefined ||
        username === null ||
        username === "" ||
        password === undefined ||
        password === null ||
        password === ""
    ) {
        return res.status(400).json({
            error: "Username and password are required"
        });
    }

    if (
        typeof username !== "string" ||
        typeof password !== "string"
    ) {
        return res.status(400).json({
            error: "Username and password must be strings"
        });
    }

    const normalizedUsername = username.trim();

    if (!normalizedUsername) {
        return res.status(400).json({
            error: "Username is required"
        });
    }

    try {
        const result = await pool.query(
            `SELECT * FROM users
             WHERE username = $1`,
            [normalizedUsername]
        );

        const user = result.rows[0];

        if (!user) {
            return res.status(401).json({
                error: "Invalid username or password"
            });
        }

        const passwordMatches = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatches) {
            return res.status(401).json({
                error: "Invalid username or password"
            });
        }

        const token = jwt.sign(
            {
                id: user.id,
                username: user.username,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1h"
            }
        );
        const csrfToken = crypto.randomBytes(32).toString("hex");

        res.setHeader("Set-Cookie", [
            authCookie(token),
            csrfCookie(csrfToken)
        ]);

        res.json({
            message: "Login successful",
            token
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to login"
        });
    }
});

router.get("/me", auth, (req, res) => {
    res.json({
        user: {
            id: req.user.id,
            username: req.user.username,
            role: req.user.role
        }
    });
});

router.post("/logout", csrf, (req, res) => {
    res.setHeader("Set-Cookie", [
        authCookie("", 0),
        csrfCookie("", 0)
    ]);
    res.json({ message: "Logout successful" });
});

module.exports = router;
