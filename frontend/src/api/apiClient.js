import keycloak from "../auth/keycloak";

export async function apiFetch(url, options = {}) {
    await keycloak.updateToken(30);

    const res = await fetch(url, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${keycloak.token}`,
            ...options.headers,
        },
    });

    if (!res.ok) {

        let data = null;

        try {
            data = await res.json();
        } catch {
            // Response war kein JSON
        }

        const error = new Error(
            data?.message || "API Error"
        );

        error.status = res.status;
        error.response = {
            status: res.status,
            data,
        };

        throw error;
    }

    return res;
}