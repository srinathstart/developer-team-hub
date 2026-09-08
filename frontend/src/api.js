function jsonErrorResponse(message, status) {
    return new Response(
        JSON.stringify({ error: message }),
        {
            status,
            headers: { "Content-Type": "application/json" }
        }
    );
}

export default async function apiFetch(url, options = {}) {
    const headers = new Headers(options.headers);

    // Browser authentication is handled by the HttpOnly cookie.
    headers.delete("Authorization");

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
