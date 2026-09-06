const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const router = express.Router();

const pool = require("../db");

router.post("/register", async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            error: "Username and password are required"
        });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const role = username === "admin" ? "admin" : "user";

        const result = await pool.query(
            `INSERT INTO users (username, password, role)
             VALUES ($1, $2, $3)
             RETURNING id, username, role`,
            [username, hashedPassword, role]
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
    const { username, password } = req.body;

    try {
        const result = await pool.query(
            `SELECT * FROM users
             WHERE username = $1`,
            [username]
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

module.exports = router;