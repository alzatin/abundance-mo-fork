import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { createRoot } from "react-dom/client";
import { Auth0Provider } from "@auth0/auth0-react";

// This is here to compensate for a bug in vite
import "replicad-opencascadejs/src/replicad_single.wasm?url";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Auth0Provider
      domain="dev-ln37eaqfk7dp2480.us.auth0.com"
      clientId="zNpgG4wQuLXBdwjkqKEbGImYnYeqPXc3"
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: "https://api.github.com/", // The audience for GitHub API
        scope: "repo user", // Requested scopes
      }}
    >
      <App />
    </Auth0Provider>
    ,
  </React.StrictMode>
);

// Hot Module Replacement (HMR) - Remove this snippet to remove HMR.
// Learn more: https://vitejs.dev/guide/api-hmr.html
if (import.meta.hot) {
  import.meta.hot.accept();
}
