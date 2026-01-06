import { AuthProvider } from "@aha-app/aha-develop-react";
import React, { useState, useEffect } from "react";
import { Styles } from "./Styles";
import { determineService } from "../lib/determineService";

export const ExtensionRoot: React.FC<{}> = ({ children }) => {
  const [serviceName, setServiceName] = useState(null as null | string);

  useEffect(() => {
    determineService().then(setServiceName);
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
