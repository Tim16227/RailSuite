import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import keycloak from "./auth/keycloak";

import "./index.css";
import "./styles/theme.css";



keycloak
    .init({
        onLoad: "login-required",
    })
    .then(() => {

        ReactDOM
            .createRoot(
                document.getElementById("root")
            )
            .render(

                <BrowserRouter>

                    <App />

                </BrowserRouter>

            );

    });