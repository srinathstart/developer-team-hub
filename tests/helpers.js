function getAuthToken(response) {
    const setCookie = response.headers["set-cookie"] || [];
    const authCookie = setCookie.find((cookie) =>
        cookie.startsWith("token=")
    );

    if (!authCookie) {
        throw new Error("Authentication cookie was not returned");
    }

    const encodedToken = authCookie.slice(
        "token=".length,
        authCookie.indexOf(";")
    );

    return decodeURIComponent(encodedToken);
}

module.exports = { getAuthToken };
