export function formatCurrency(value, locale = "de-DE", currency = "EUR") {
    if (value === null || value === undefined || isNaN(value)) {
        return "-";
    }

    return new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
    }).format(value);
}

export function formatNumber(value, locale = "de-DE") {
    if (value === null || value === undefined || isNaN(value)) {
        return "-";
    }

    return new Intl.NumberFormat(locale).format(value);
}

export function formatPercent(value, digits = 1) {
    if (value === null || value === undefined || isNaN(value)) {
        return "-";
    }

    return `${value > 0 ? "+" : ""}${Number(value).toFixed(digits)}%`;
}

export function formatAddress({ street, houseNumber, postalCode, city }) {
    if (!street && !city) return "-";

    return `${street ?? ""} ${houseNumber ?? ""}, ${postalCode ?? ""} ${city ?? ""}`.replace(/\s+/g, " ").trim();
}

export function formatFullName(firstName, lastName) {
    if (!firstName && !lastName) return "-";

    return `${firstName ?? ""} ${lastName ?? ""}`.trim();
}