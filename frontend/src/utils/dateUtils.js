export function formatDate(date) {
    if (!date) return "-";

    const d = new Date(date);

    if (isNaN(d.getTime())) {
        return "-";
    }

    return d.toLocaleDateString("de-DE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
}

export function formatDateTime(date) {
    if (!date) return "-";

    const d = new Date(date);

    if (isNaN(d.getTime())) {
        return "-";
    }

    return d.toLocaleString("de-DE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export function isToday(date) {
    if (!date) return false;

    const d = new Date(date);
    const today = new Date();

    return (
        d.getDate() === today.getDate() &&
        d.getMonth() === today.getMonth() &&
        d.getFullYear() === today.getFullYear()
    );
}

export function addDays(date, days) {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
}

export function formatDay(day, weekStart) {
    const days = {
        MONDAY: "Montag",
        TUESDAY: "Dienstag",
        WEDNESDAY: "Mittwoch",
        THURSDAY: "Donnerstag",
        FRIDAY: "Freitag",
        SATURDAY: "Samstag",
        SUNDAY: "Sonntag"
    };

    const start = new Date(weekStart);

    const dayIndex = {
        MONDAY: 0,
        TUESDAY: 1,
        WEDNESDAY: 2,
        THURSDAY: 3,
        FRIDAY: 4,
        SATURDAY: 5,
        SUNDAY: 6
    }[day];

    const date = new Date(start);
    date.setDate(start.getDate() + dayIndex);

    return `${days[day]}, ${date.toLocaleDateString("de-DE")}`;
}