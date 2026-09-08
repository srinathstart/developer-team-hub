const jwt = require("jsonwebtoken");
const { parseCookies } = require("../utils/cookies");

function auth(req, res, next) {
    const authHeader = req.headers.authorization;
    const cookieToken = parseCookies(req.headers.cookie).token;
    const bearerToken = authHeader?.startsWith("Bearer ")
        ? authHeader.slice(7)
        : null;
    const token = cookieToken || bearerToken;

    if (!token) {
        return res.status(401).json({
            error: "Authentication required"
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = decoded;

        next();
    } catch (error) {
        return res.status(401).json({
            error: "Invalid or expired token"
        });
    }
}

module.exports = auth;
