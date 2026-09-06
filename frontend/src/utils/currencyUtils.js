export function formatEuro(value) {
    if (value == null) {
        return "-";
    }

    return `${value.toLocaleString("de-DE")} €`;
}