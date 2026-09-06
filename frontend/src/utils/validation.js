export function isRequired(value) {
    if (value === null || value === undefined) return false;
    if (typeof value === "string") {
        return value.trim().length > 0;
    }
    return true;
}

export function isEmail(value) {
    if (!value) return false;

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function isNumber(value) {
    return !isNaN(Number(value));
}

export function minLength(value, min) {
    if (!value) return false;
    return value.length >= min;
}

export function maxLength(value, max) {
    if (!value) return false;
    return value.length <= max;
}

export function isPostalCode(value) {
    if (!value) return false;

    // Deutschland: 5-stellig
    return /^\d{5}$/.test(value);
}

export function isPositiveNumber(value) {
    const num = Number(value);
    return !isNaN(num) && num > 0;
}