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
    editMode,
    setEditMode,
    tool,
    setTool,
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

    return (
        <div className="menu-container">

            {/* Hauptmenü */}

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
            </div>

            <div className="edit-mode-area">
                <button
                    type="button"
                    className={
                        editMode
                            ? "edit-mode-button active"
                            : "edit-mode-button"
                    }
                    onClick={() =>
                        setEditMode(
                            (current) => !current
                        )
                    }
                    title={
                        editMode
                            ? "Editiermodus beenden"
                            : "Editiermodus aktivieren"
                    }
                >
                    <span className="edit-mode-icon">
                        {editMode ? "🔧" : "▶️"}
                    </span>

                    <span>
                        {editMode
                            ? "Editiermodus"
                            : "Betrieb"}
                    </span>
                </button>
            </div>

            {/* Toolbereich */}

            {activeMenu && (
                <div className="tool-ribbon">

                    {activeMenu ===
                        "Bearbeiten" && (
                        <LayoutToolbar
                            tool={tool}
                            setTool={setTool}
                        />
                    )}

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
