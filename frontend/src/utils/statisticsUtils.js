export function calculatePercentChange(current, previous) {
    if (!previous || previous === 0) {
        return 0;
    }

    return ((current - previous) / previous) * 100;
}

export function getPercentChangeClass(value) {
    if (value > 0) {
        return "positive";
    }

    if (value < 0) {
        return "negative";
    }

    return "neutral";
}

export function formatPercentChange(value) {
    return `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;
}