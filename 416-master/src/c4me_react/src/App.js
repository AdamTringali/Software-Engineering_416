import React, { useState } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import LoginScreen from './components/login_screen/LoginScreen.js';
import HomeScreen from './components/home_screen/HomeScreen.js';
import AdminScreen from './components/admin_screen/AdminScreen.js';
import Navigation from './global_components/navigation/Navigation.js';
import ProfileScreen from './components/profile_screen/ProfileScreen.js';
import ViewOtherProfile from './components/profile_screen/ViewOtherProfile.js';
import CollegeScreen from './components/college_screen/CollegeScreen.js';
import CollegeInfoScreen from './components/college_screen/CollegeInfoScreen.js';
import ErrorScreen from './components/error_screen/ErrorScreen.js';
import AllProfilesScreen from './components/profile_screen/AllProfilesScreen.js';
import { AuthContext } from "./authentication/auth.js";
import PrivateRoute from './authentication/PrivateRoute.js';
import AdminRoute from './authentication/AdminRoute.js';


export default function App() {

  const existingTokens = localStorage.getItem("accessCode");
  const [authTokens, setAuthTokens] = useState(existingTokens);
  const setTokens = (data) => {
    localStorage.setItem("accessCode", data);
    setAuthTokens(data);
  }

  return (
    <div className="App">
      <AuthContext.Provider value={{ authTokens, setAuthTokens: setTokens }}>
        <Router>
          <div className="">
            <Navigation />
              <Switch>
                <Route exact path="/" component={HomeScreen} />
                <Route path="/login" component={LoginScreen} />
                <PrivateRoute path="/profile" component={ProfileScreen} />
                <PrivateRoute exact path="/college" component={CollegeScreen} />
                <PrivateRoute exact path="/college/:id" component={CollegeInfoScreen} />
                <AdminRoute path="/admin" component={AdminScreen} adminOnly={true} />
                <Route path="/error" component={ErrorScreen} />
                <AdminRoute exact path="/allProfiles" component={AllProfilesScreen} />
                <PrivateRoute path="/students/:id" component={ViewOtherProfile} />
                <Route path="/:any" component={HomeScreen} />
              </Switch>
          </div>
        </Router>
      </AuthContext.Provider>
    </div>
  );
}


