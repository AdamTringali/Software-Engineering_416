import React from "react";
import { Route, Redirect } from "react-router-dom";
import { useAuth } from "./auth";

function AdminRoute({ component: Component, ...rest }) {
  const { authTokens } = useAuth();
  console.log("ADMINROUTE authtokens: ", authTokens );

  return (
    <Route
      {...rest}
      render={props =>
        authTokens >= 2 ? (
          <Component {...props} />
        ) : (
            <Redirect to="/home" />
        )
      }
    />
  );
}

export default AdminRoute;