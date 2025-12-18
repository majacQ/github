import { AuthProvider } from "@aha-app/aha-develop-react";
import React, { useState, useEffect } from "react";
import { Styles } from "./Styles";
import { IDENTIFIER } from "extension";

/**
 * Set up the styles and auth provider
 */
export const ExtensionRoot: React.FC<{}> = ({ children }) => {
  const [serviceName, setServiceName] = useState(null as null | string);

  useEffect(() => {
    async function determineService() {
      const clientId = await aha.settings.get(`${IDENTIFIER}.oauthClientId`);

      if (clientId) {
        setServiceName("github_enterprise");
      } else {
        setServiceName("github");
      }
    }
    determineService();
  }, []);

  if (!serviceName) return null;

  return (
    <>
      <Styles />
      <AuthProvider serviceName={serviceName} serviceParameters={{ scope: "repo" }}>
        {children}
      </AuthProvider>
    </>
  );
};
