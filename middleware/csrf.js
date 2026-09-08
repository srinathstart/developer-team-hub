const crypto = require("crypto");
const { parseCookies } = require("../utils/cookies");

const protectedMethods = new Set(["POST", "PUT", "PATCH", "DELETE"]);

function csrf(req, res, next) {
    if (!protectedMethods.has(req.method)) {
        return next();
    }

    const cookies = parseCookies(req.headers.cookie);

    // Bearer-token API requests do not rely on automatically sent cookies.
    if (!cookies.token) {
        return next();
    }

    const cookieToken = cookies.csrfToken;
    const headerToken = req.get("X-CSRF-Token");

    if (!cookieToken || !headerToken) {
        return res.status(403).json({
            error: "Invalid CSRF token"
        });
    }

    const cookieBuffer = Buffer.from(cookieToken);
    const headerBuffer = Buffer.from(headerToken);

    if (
        cookieBuffer.length !== headerBuffer.length ||
        !crypto.timingSafeEqual(cookieBuffer, headerBuffer)
    ) {
        return res.status(403).json({
            error: "Invalid CSRF token"
        });
    }

    next();
}

module.exports = csrf;
