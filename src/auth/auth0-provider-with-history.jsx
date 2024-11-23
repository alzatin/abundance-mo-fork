// src/auth/auth0-provider-with-history.js

import React from "react";
import { useNavigate } from "react-router-dom";
import { Auth0Provider } from "@auth0/auth0-react";

const Auth0ProviderWithHistory = ({ children }) => {
  const domain = import.meta.env.VITE__AUTH0_DOMAIN;
  const clientId = import.meta.env.VITE__AUTH0_CLIENT_ID;
  const audience = import.meta.env.VITE_APP_AUTH0_AUDIENCE;
  const navigate = useNavigate();

  const onRedirectCallback = (appState) => {
    console.log("onRedirectCallback");
    console.log(appState);
    navigate(appState?.returnTo || window.location.pathname);
  };

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      onRedirectCallback={onRedirectCallback}
      redirectUri="https://alzatin.github.io/abundance-mo-fork"
      audience={audience}
      authorizationParams={{
        redirect_uri: "https://alzatin.github.io/abundance-mo-fork",
        audience: audience,
      }}
    >
      {children}
    </Auth0Provider>
  );
};

export default Auth0ProviderWithHistory;
