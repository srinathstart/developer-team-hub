const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const router = express.Router();

const users = [];

router.post("/register", async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            error: "Username and password are required"
        });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
        id: users.length + 1,
        username,
        password: hashedPassword,
        role: username === "admin" ? "admin" : "user"
    };

    users.push(newUser);

    res.status(201).json({
        message: "User registered",
        user: {
            id: newUser.id,
            username: newUser.username
        }
    });
});

router.post("/login", async (req, res) => {
    const { username, password } = req.body;

    const user = users.find(
        (user) => user.username === username
    );

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
});

module.exports = router;