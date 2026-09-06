import { useState } from "react";
import keycloak from "../../../auth/keycloak";
import { FiLogOut, FiUser } from "react-icons/fi";
import "./UserMenu.css";

export default function UserMenu() {
  const [open, setOpen] = useState(false);

  const username =
    keycloak?.tokenParsed?.preferred_username || "User";

  const handleLogout = () => {
    keycloak.logout({
      redirectUri: window.location.origin,
    });
  };

  return (
    <div className="user-menu">
      {/* Trigger */}
      <button
        className="user-menu-trigger"
        onClick={() => setOpen(!open)}
      >
        <span>{username}</span>
        <span className={`arrow ${open ? "open" : ""}`}>▼</span>
      </button>

      {open && (
        <div className="user-menu-dropdown">
          <button className="dropdown-item">
            <FiUser style={{ marginRight: 8 }} />
            Persönliche Daten
          </button>
        </div>
      )}
    </div>
  );
}