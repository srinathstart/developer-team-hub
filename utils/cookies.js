function parseCookies(cookieHeader = "") {
    return cookieHeader.split(";").reduce((cookies, part) => {
        const separatorIndex = part.indexOf("=");

        if (separatorIndex === -1) {
            return cookies;
        }

        const name = part.slice(0, separatorIndex).trim();
        const value = part.slice(separatorIndex + 1).trim();

        if (name) {
            cookies[name] = decodeURIComponent(value);
        }

        return cookies;
    }, {});
}

function authCookie(token, maxAgeSeconds = 60 * 60) {
    const parts = [
        `token=${encodeURIComponent(token)}`,
        "HttpOnly",
        "Path=/",
        "SameSite=Lax",
        `Max-Age=${maxAgeSeconds}`
    ];

    if (process.env.NODE_ENV === "production") {
        parts.push("Secure");
    }

    return parts.join("; ");
}

module.exports = { parseCookies, authCookie };
