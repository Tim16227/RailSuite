import Keycloak from "keycloak-js";

const keycloak = new Keycloak({
    url: "http://localhost:8081",
    realm: "railsuite",
    clientId: "frontend"
});

export default keycloak;