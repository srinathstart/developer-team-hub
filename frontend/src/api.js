function jsonErrorResponse(message, status) {
    return new Response(
        JSON.stringify({ error: message }),
        {
            status,
            headers: { "Content-Type": "application/json" }
        }
    );
}

function getCookie(name) {
    const prefix = `${encodeURIComponent(name)}=`;
    const cookie = document.cookie
        .split("; ")
        .find((item) => item.startsWith(prefix));

    return cookie ? decodeURIComponent(cookie.slice(prefix.length)) : null;
}

export default async function apiFetch(url, options = {}) {
    const headers = new Headers(options.headers);
    const method = (options.method || "GET").toUpperCase();
    const token = sessionStorage.getItem("token");

    if (token) {
        headers.set("Authorization", `Bearer ${token}`);
    } else {
        headers.delete("Authorization");
    }

    if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
        const csrfToken = getCookie("csrfToken");

        if (csrfToken) {
            headers.set("X-CSRF-Token", csrfToken);
        }
    }

    try {
        const response = await fetch(url, {
            ...options,
            headers,
            credentials: "include"
        });
        const requestPath = new URL(url, window.location.origin).pathname;

        if (
            response.status === 401 &&
            requestPath !== "/auth/login"
        ) {
            sessionStorage.removeItem("token");
            window.location.assign("/login");
        }

        const contentType = response.headers.get("content-type") || "";

        if (!contentType.includes("application/json")) {
            return jsonErrorResponse(
                response.ok
                    ? "The server returned an invalid response"
                    : `Request failed with status ${response.status}`,
                response.ok ? 502 : response.status
            );
        }

        return response;
    } catch {
        return jsonErrorResponse(
            "Unable to connect to the server. Please try again.",
            503
        );
    }
}
