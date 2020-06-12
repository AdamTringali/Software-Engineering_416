import React/* , { useState, useEffect } */ from 'react';
import { Navbar, Nav } from 'react-bootstrap';
import * as Constants from './../../constants/constants.js';
import axios from 'axios';
import { useAuth } from "../../authentication/auth.js";
import 'bootstrap/dist/css/bootstrap.min.css';

export default function Navigation(props) {
    const { setAuthTokens } = useAuth();
    const { authTokens } = useAuth();

    function logout() {
        async function sign_off() {
            try {
                const res_data = await axios.post(`${Constants.port}/logout`);
                if (res_data.status !== 200) {
                    throw new Error(res_data.data.error);
                }
                console.log("fetching data, logout:", res_data);
                /* setValid(false) */
                return res_data;
            } catch (error) {
                if (error.response) {
                    console.log(error.response.data);
                    console.log(error.response.status);
                    console.log(error.response.headers);
                  } else if (error.request) {
                    console.log(error.request);
                  } else {
                    console.log('Error', error.message);
                  }
                  console.log(error.config);
                
            }
        }
        console.log("signing off.")
        sign_off();
        setAuthTokens(0);
    }
    return (
        authTokens == 2 ? 
        <Navbar bg="dark" variant="dark">
        <Navbar.Brand>c4me</Navbar.Brand>
        <Nav className="mr-auto">
            <Nav.Link className="navbar__link"  href="/home">Home</Nav.Link>
            <Nav.Link className="navbar__link" href="/profile">Profile</Nav.Link>
            <Nav.Link className="navbar__link" href="/college">College Search</Nav.Link>
            {/* <Nav.Link className="navbar__link" href="/applicationstracker">Application Tracker</Nav.Link> */}
        </Nav>
        <Nav >
            <Nav.Link className="navbar__link"  href="/login" onClick={()=>logout()}>Logout</Nav.Link>
            <Nav.Link className="navbar__link"  href="/admin" style={{ color: "#18a6ff" }}>Admin</Nav.Link>
            <Nav.Link className="navbar__link"  href="/allProfiles" style={{ color: "#18a6ff" }}>All Profiles</Nav.Link>
            <Navbar.Collapse className="justify-content-end">
                {/* <Navbar.Text>
                    Signed in as: username
                </Navbar.Text> */}
            </Navbar.Collapse>
        </Nav>
    </Navbar> 
    :
        authTokens == 1 ?   
        <Navbar bg="dark" variant="dark">
            <Navbar.Brand>c4me</Navbar.Brand>
            <Nav className="mr-auto">
                <Nav.Link className="navbar__link"  href="/home">Home</Nav.Link>
                <Nav.Link className="navbar__link"  href="/profile">Profile</Nav.Link>
                <Nav.Link className="navbar__link"  href="/college">College Search</Nav.Link>
               {/*  <Nav.Link className="navbar__link"  href="/applicationstracker">Application Tracker</Nav.Link> */}
            </Nav>
            <Nav >
                <Nav.Link className="navbar__link"  href="/login" onClick={()=>logout()}>Logout</Nav.Link>
                <Navbar.Collapse className="justify-content-end">
                    {/* <Navbar.Text>
                        Signed in as: username
                    </Navbar.Text> */}
                </Navbar.Collapse>
            </Nav>
        </Navbar> 
        :                
        <Navbar bg="dark" variant="dark">
            <Navbar.Brand>c4me</Navbar.Brand>
            <Nav className="mr-auto">
                <Nav.Link className="navbar__link"  href="/home">Home</Nav.Link>
                <Nav.Link className="navbar__link"  href="/login">Login</Nav.Link>

            </Nav>
         
        </Navbar>
    );
}