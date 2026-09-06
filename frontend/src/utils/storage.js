const PREFIX = "railsuite_";

function getKey(key) {
    return `${PREFIX}${key}`;
}

/* =======================
   LOCAL STORAGE
======================= */

export function setLocal(key, value) {
    try {
        const serialized = JSON.stringify(value);
        localStorage.setItem(getKey(key), serialized);
    } catch (error) {
        console.error("Storage setLocal error:", error);
    }
}

export function getLocal(key, fallback = null) {
    try {
        const item = localStorage.getItem(getKey(key));
        if (!item) return fallback;

        return JSON.parse(item);
    } catch (error) {
        console.error("Storage getLocal error:", error);
        return fallback;
    }
}

export function removeLocal(key) {
    localStorage.removeItem(getKey(key));
}

export function clearLocal() {
    localStorage.clear();
}

/* =======================
   SESSION STORAGE
======================= */

export function setSession(key, value) {
    try {
        const serialized = JSON.stringify(value);
        sessionStorage.setItem(getKey(key), serialized);
    } catch (error) {
        console.error("Storage setSession error:", error);
    }
}

export function getSession(key, fallback = null) {
    try {
        const item = sessionStorage.getItem(getKey(key));
        if (!item) return fallback;

        return JSON.parse(item);
    } catch (error) {
        console.error("Storage getSession error:", error);
        return fallback;
    }
}

export function removeSession(key) {
    sessionStorage.removeItem(getKey(key));
}