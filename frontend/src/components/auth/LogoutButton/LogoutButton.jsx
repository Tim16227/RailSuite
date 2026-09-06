import "./LogoutButton.css";

import keycloak from "../../../auth/keycloak";
import { FiLogOut } from "react-icons/fi";

export default function LogoutButton() {
  const handleLogout = () => {
    keycloak.logout({
      redirectUri: window.location.origin
    });
  };

  return (
    <button className="logout-btn" onClick={handleLogout}>
      <FiLogOut style={{ marginRight: 6 }} />
      Ausloggen
    </button>
  );
}