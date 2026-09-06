import { useState } from "react";

import { LayoutToolbar } from "../layout/LayoutToolbar";
import "./MenuBar.css";

const menus = {
  Projekt: [
    { label: "Neu", icon: "📄" },
    { label: "Öffnen", icon: "📂" },
    { label: "Speichern", icon: "💾" },
    { separator: true },
    { label: "Projekt schließen", icon: "✖" },
  ],

  Railroad: [
    { label: "Gleisplan", icon: "🛤️" },
    { label: "Lokomotiven", icon: "🚂" },
    { label: "Wagen", icon: "🚃" },
  ],

  Bearbeiten: [
    { label: "Rückgängig", icon: "↶" },
    { label: "Wiederholen", icon: "↷" },
    { separator: true },
    { label: "Ausschneiden", icon: "✂" },
    { label: "Kopieren", icon: "📋" },
    { label: "Einfügen", icon: "📌" },
  ],

  Gleis: [
    { label: "Gleis hinzufügen", icon: "➕" },
    { label: "Gleis bearbeiten", icon: "✏️" },
    { label: "Gleis löschen", icon: "🗑️" },
    { separator: true },
    { label: "Weiche", icon: "🔀" },
    { label: "Drehscheibe", icon: "🔄" },
  ],

  Zubehör: [
    { label: "Signal", icon: "🚦" },
    { label: "Weiche", icon: "🔀" },
    { label: "Bahnübergang", icon: "🚧" },
    { label: "Beleuchtung", icon: "💡" },
  ],

  Betrieb: [
    { label: "Start", icon: "▶️" },
    { label: "Pause", icon: "⏸️" },
    { label: "Stopp", icon: "⏹️" },
    { separator: true },
    { label: "Automatikbetrieb", icon: "⚙️" },
    { label: "Fahrplan", icon: "📋" },
  ],

  Betriebsstelle: [
    { label: "Bahnhof", icon: "🏢" },
    { label: "Schattenbahnhof", icon: "🏭" },
    { label: "Blockstelle", icon: "🚦" },
  ],

  Ansicht: [
    { label: "Zoom +", icon: "🔍" },
    { label: "Zoom -", icon: "🔎" },
    { label: "Gleisplan zentrieren", icon: "⊙" },
    { separator: true },
    { label: "Raster anzeigen", icon: "▦" },
  ],

  Fenster: [
    { label: "Layout", icon: "▣" },
    { label: "Lokomotiven", icon: "🚂" },
    { label: "Rückmeldungen", icon: "📡" },
  ],

  Hilfe: [
    { label: "Dokumentation", icon: "📖" },
    { label: "Tastaturkürzel", icon: "⌨️" },
    { separator: true },
    { label: "Über die Anwendung", icon: "ℹ️" },
  ],
};

export default function MenuBar() {
  const [activeMenu, setActiveMenu] = useState(null);

  const handleMenuClick = (menuName) => {
    setActiveMenu(
      activeMenu === menuName ? null : menuName
    );
  };

  return (
    <div className="menu-container">

      {/* Hauptmenü */}
      <div className="main-menu">
        {[
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
        ].map((menuName) => (
          <button
            key={menuName}
            className={`main-menu-item ${
              activeMenu === menuName ? "active" : ""
            }`}
            onClick={() => handleMenuClick(menuName)}
          >
            {menuName}
          </button>
        ))}
      </div>


      {/* Toolbereich */}
      {activeMenu && (
        <div className="tool-ribbon">

          {activeMenu === "Bearbeiten" && (
            <LayoutToolbar />
          )}

          {activeMenu === "Projekt" && (
            <>
              <button className="tool-button">
                <span className="tool-icon">📄</span>
                <span className="tool-label">Neu</span>
              </button>

              <button className="tool-button">
                <span className="tool-icon">📂</span>
                <span className="tool-label">Öffnen</span>
              </button>

              <button className="tool-button">
                <span className="tool-icon">💾</span>
                <span className="tool-label">Speichern</span>
              </button>
            </>
          )}

          {activeMenu === "Gleis" && (
            <>
              <button className="tool-button">
                <span className="tool-icon">🛤️</span>
                <span className="tool-label">
                  Gleis hinzufügen
                </span>
              </button>

              <button className="tool-button">
                <span className="tool-icon">🔀</span>
                <span className="tool-label">
                  Weiche
                </span>
              </button>
            </>
          )}

        </div>
      )}

    </div>
  );
}