// src/auth/auth0-provider-with-history.js

import React from "react";
import { useNavigate } from "react-router-dom";
import { Auth0Provider } from "@auth0/auth0-react";

const Auth0ProviderWithHistory = ({ children }) => {
  const domain = import.meta.env.VITE__AUTH0_DOMAIN;
  const clientId = import.meta.env.VITE__AUTH0_CLIENT_ID;
  const audience = import.meta.env.VITE_APP_AUTH0_AUDIENCE;
  const navigate = useNavigate();

  console.log("Deployment Nov 25/24");

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      redirectUri={import.meta.env.VITE_APP_DEV}
      audience={audience}
      authorizationParams={{
        redirect_uri: import.meta.env.VITE_APP_DEV,
        audience: audience,
      }}
    >
      {children}
    </Auth0Provider>
  );
};

export default Auth0ProviderWithHistory;
