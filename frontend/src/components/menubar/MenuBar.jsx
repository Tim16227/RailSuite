import {
    useState,
} from "react";

import {
    LayoutToolbar,
} from "../layout/LayoutToolbar";

import "./MenuBar.css";

const menus = {
    Projekt: [
        {
            label: "Neu",
            icon: "📄",
        },
        {
            label: "Öffnen",
            icon: "📂",
        },
        {
            label: "Speichern",
            icon: "💾",
        },
        {
            separator: true,
        },
        {
            label: "Projekt schließen",
            icon: "✖",
        },
    ],

    Railroad: [
        {
            label: "Gleisplan",
            icon: "🛤️",
        },
        {
            label: "Lokomotiven",
            icon: "🚂",
        },
        {
            label: "Wagen",
            icon: "🚃",
        },
    ],

    Bearbeiten: [],

    Gleis: [
        {
            label: "Gleis hinzufügen",
            icon: "➕",
        },
        {
            label: "Gleis bearbeiten",
            icon: "✏️",
        },
        {
            label: "Gleis löschen",
            icon: "🗑️",
        },
        {
            separator: true,
        },
        {
            label: "Weiche",
            icon: "🔀",
        },
        {
            label: "Drehscheibe",
            icon: "🔄",
        },
    ],

    Zubehör: [
        {
            label: "Signal",
            icon: "🚦",
        },
        {
            label: "Weiche",
            icon: "🔀",
        },
        {
            label: "Bahnübergang",
            icon: "🚧",
        },
        {
            label: "Beleuchtung",
            icon: "💡",
        },
    ],

    Betrieb: [
        {
            label: "Start",
            icon: "▶️",
        },
        {
            label: "Pause",
            icon: "⏸️",
        },
        {
            label: "Stopp",
            icon: "⏹️",
        },
        {
            separator: true,
        },
        {
            label: "Automatikbetrieb",
            icon: "⚙️",
        },
        {
            label: "Fahrplan",
            icon: "📋",
        },
    ],

    Betriebsstelle: [
        {
            label: "Bahnhof",
            icon: "🏢",
        },
        {
            label: "Schattenbahnhof",
            icon: "🏭",
        },
        {
            label: "Blockstelle",
            icon: "🚦",
        },
    ],

    Ansicht: [
        {
            label: "Zoom +",
            icon: "🔍",
        },
        {
            label: "Zoom -",
            icon: "🔎",
        },
        {
            label: "Gleisplan zentrieren",
            icon: "⊙",
        },
        {
            separator: true,
        },
        {
            label: "Raster anzeigen",
            icon: "▦",
        },
    ],

    Fenster: [
        {
            label: "Layout",
            icon: "▣",
        },
        {
            label: "Lokomotiven",
            icon: "🚂",
        },
        {
            label: "Rückmeldungen",
            icon: "📡",
        },
    ],

    Hilfe: [
        {
            label: "Dokumentation",
            icon: "📖",
        },
        {
            label: "Tastaturkürzel",
            icon: "⌨️",
        },
        {
            separator: true,
        },
        {
            label: "Über die Anwendung",
            icon: "ℹ️",
        },
    ],
};

const menuNames = [
    "Projekt",
    "Railroad",
    "Bearbeiten",
    "Gleis",
    "Zubehör",
    "Betrieb",
    "Betriebsstelle",
    "Ansicht",
    "Fenster",
    "Hilfe",
];

export default function MenuBar({
    tool,
    setTool,
    editMode,
    setEditMode,
}) {
    const [
        activeMenu,
        setActiveMenu,
    ] = useState(null);

    function handleMenuClick(
        menuName
    ) {
        setActiveMenu(
            activeMenu === menuName
                ? null
                : menuName
        );
    }

    function handleEditModeToggle() {
        setEditMode(
            (current) => !current
        );
    }

    return (
        <div className="menu-container">

            {/* =========================
                Hauptmenü
                ========================= */}

            <div className="main-menu">

                {menuNames.map(
                    (menuName) => (
                        <button
                            key={menuName}
                            type="button"
                            className={
                                `main-menu-item ${
                                    activeMenu ===
                                    menuName
                                        ? "active"
                                        : ""
                                }`
                            }
                            onClick={() =>
                                handleMenuClick(
                                    menuName
                                )
                            }
                        >
                            {menuName}
                        </button>
                    )
                )}

                {/* =========================
                    Editiermodus
                    ========================= */}

                <button
                    type="button"
                    className={
                        `edit-mode-button ${
                            editMode
                                ? "active"
                                : ""
                        }`
                    }
                    onClick={
                        handleEditModeToggle
                    }
                    title={
                        editMode
                            ? "In den Betriebsmodus wechseln"
                            : "In den Editiermodus wechseln"
                    }
                >
                    <span>
                        {editMode
                            ? "✏️"
                            : "▶️"}
                    </span>

                    <span>
                        {editMode
                            ? "Editiermodus"
                            : "Betriebsmodus"}
                    </span>
                </button>
            </div>

            {/* =========================
                Tool Ribbon
                ========================= */}

            {activeMenu && (
                <div className="tool-ribbon">

                    {/* =========================
                        Bearbeiten
                        ========================= */}

                    {activeMenu ===
                        "Bearbeiten" && (
                        <LayoutToolbar
                            tool={tool}
                            setTool={setTool}
                        />
                    )}

                    {/* =========================
                        Projekt
                        ========================= */}

                    {activeMenu ===
                        "Projekt" && (
                        <>
                            <button
                                type="button"
                                className="tool-button"
                            >
                                <span className="tool-icon">
                                    📄
                                </span>

                                <span className="tool-label">
                                    Neu
                                </span>
                            </button>

                            <button
                                type="button"
                                className="tool-button"
                            >
                                <span className="tool-icon">
                                    📂
                                </span>

                                <span className="tool-label">
                                    Öffnen
                                </span>
                            </button>

                            <button
                                type="button"
                                className="tool-button"
                            >
                                <span className="tool-icon">
                                    💾
                                </span>

                                <span className="tool-label">
                                    Speichern
                                </span>
                            </button>
                        </>
                    )}

                    {/* =========================
                        Gleis
                        ========================= */}

                    {activeMenu ===
                        "Gleis" && (
                        <>
                            <button
                                type="button"
                                className="tool-button"
                            >
                                <span className="tool-icon">
                                    🛤️
                                </span>

                                <span className="tool-label">
                                    Gleis hinzufügen
                                </span>
                            </button>

                            <button
                                type="button"
                                className="tool-button"
                            >
                                <span className="tool-icon">
                                    🔀
                                </span>

                                <span className="tool-label">
                                    Weiche
                                </span>
                            </button>
                        </>
                    )}

                    {/* =========================
                        Alle übrigen Menüs
                        ========================= */}

                    {activeMenu !==
                        "Bearbeiten" &&
                        activeMenu !==
                        "Projekt" &&
                        activeMenu !==
                        "Gleis" && (
                        <>
                            {menus[
                                activeMenu
                            ].map(
                                (
                                    item,
                                    index
                                ) => {
                                    if (
                                        item.separator
                                    ) {
                                        return (
                                            <div
                                                key={
                                                    index
                                                }
                                                className="tool-separator"
                                            />
                                        );
                                    }

                                    return (
                                        <button
                                            key={
                                                item.label
                                            }
                                            type="button"
                                            className="tool-button"
                                        >
                                            <span className="tool-icon">
                                                {
                                                    item.icon
                                                }
                                            </span>

                                            <span className="tool-label">
                                                {
                                                    item.label
                                                }
                                            </span>
                                        </button>
                                    );
                                }
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
}