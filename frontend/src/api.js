export default function apiFetch(url, options = {}) {
    const headers = new Headers(options.headers);

    // Browser authentication is handled by the HttpOnly cookie.
    headers.delete("Authorization");

    return fetch(url, {
        ...options,
        headers,
        credentials: "include"
    });
}
