import React, { useState/* , useEffect */ } from 'react';
import { Form, Col, Row, Button, Card, Container, Alert } from 'react-bootstrap'
import * as Constants from './../../constants/constants.js';
import axios from 'axios';
import { useAuth } from "../../authentication/auth.js";

export default function LoginScreen(props) {
    const [alert, setAlert] = useState({ show: false, msg: "" })
    const [alert_register, setAlert_register] = useState({ show: false, msg: "" })
    const [userInfo, setUserInfo] = useState({
        username: "", password: ""
    })
    const { setAuthTokens } = useAuth();

    function successfulLogin() {
        setAlert({ show: false, msg: "" })
        props.history.push('/home');
    }


    function logIn() {
        async function signIn() {
            try {
                const res_data = await axios.post(`${Constants.port}/login`, userInfo);
                if (res_data.status !== 200) {
                    throw new Error(res_data.data.error);
                }
                console.log("fetching data", res_data);
                successfulLogin();
                try {
                    const res_data = await axios.get(`${Constants.port}/verifyAuth`);
                    if (res_data.status !== 200)
                        throw new Error(res_data.data.error);
                    setAuthTokens(1);
                    try {
                        const res_data_admin = await axios.get(`${Constants.port}/verifyAdminAuth`);
                        if (res_data_admin.status === 200)
                            setAuthTokens(2);
                    } catch (error) { }
                    return res_data;
                } catch (error) {
                    setAuthTokens(0);
                }
                return true;
            } catch (error) {
                if (error.response) {
                    setAlert({ show: true, msg: "Invalid username or password" })
                    console.log(error.response.data.error_msg);
                } else if (error.request) {
                    console.log(error.request);
                } else {
                    console.log('Error', error.message);
                }
                return false;
            }
        }
        if (userInfo.username !== "" && userInfo.password !== "") {
            console.log("logging in", userInfo)
            signIn();
        }
        else
            setAlert({ show: true, msg: "Enter a username and password" })
    }

    function createAccount() {
        console.log("creating account", userInfo)

        async function registerAccount() {
            try {
                const res_data = await axios.post(`${Constants.port}/register`, userInfo);
                if (res_data.status !== 200) {
                    throw new Error(res_data.data.error);
                }
                console.log("fetching data", res_data);
                logIn();
                return res_data;
            } catch (error) {
                setAlert_register({ show: true, msg: error.response.data.error_msg })
                if (error.response) {
                    console.log(error.response.data.error_msg);
                } else if (error.request) {
                    console.log(error.request);
                } else {
                    console.log('Error', error.message);
                }
            }
        }
        if (userInfo.username !== "" && userInfo.password !== "") {
            console.log("registering account.")
            registerAccount();
        }
        else
            setAlert_register({ show: true, msg: "Enter a username and password" })



    }

    return (
        <div>
            <Container>

                <Row>
                    <Col>
                        <Card className="login-card">
                            <Card.Header style={{ fontSize: "35px", textAlign: "center" }}>Sign in  {' '}

                            </Card.Header>
                            <Card.Body>
                                <Form>
                                    <Form.Group as={Row} >
                                        <Form.Label column sm={5}>
                                            Username
                                        </Form.Label>
                                        <Col sm={7}>
                                            <Form.Control required placeholder="Username" onChange={(e) => setUserInfo({ ...userInfo, username: e.target.value })} />
                                        </Col>
                                    </Form.Group>

                                    <Form.Group as={Row} controlId="formHorizontalPassword1">
                                        <Form.Label column sm={5}>
                                            Password
                                        </Form.Label>
                                        <Col sm={7}>
                                            <Form.Control /* type="password" */ required placeholder="Password" onChange={(e) => setUserInfo({ ...userInfo, password: e.target.value })} />
                                        </Col>
                                    </Form.Group>

                                    <Form.Group as={Row} style={{ placeContent: "center" }}>
                                        <Button onClick={() => { logIn() }} /* href='/home' */>Sign in</Button>
                                    </Form.Group>
                                </Form>

                                {alert.show ? <Alert variant="danger">
                                    {alert.msg}
                                </Alert>
                                    :
                                    null}
                            </Card.Body>
                        </Card>

                    </Col>
                    <Col>
                        <Card className="login-card">
                            <Card.Header style={{ fontSize: "35px", textAlign: "center" }}>Create Account

                            </Card.Header>
                            <Card.Body>
                                <Form>
                                    <Form.Group as={Row} >
                                        <Form.Label column sm={5}>
                                            Username
                                        </Form.Label>
                                        <Col sm={7}>
                                            <Form.Control required placeholder="Username" onChange={(e) => setUserInfo({ ...userInfo, username: e.target.value })} />
                                        </Col>
                                    </Form.Group>

                                    <Form.Group as={Row} controlId="formHorizontalPassword">
                                        <Form.Label column sm={5}>
                                            Password
                                        </Form.Label>
                                        <Col sm={7}>
                                            <Form.Control required type="password" placeholder="Password" onChange={(e) => setUserInfo({ ...userInfo, password: e.target.value })} />
                                        </Col>
                                    </Form.Group>

                                    <Form.Group as={Row} style={{ placeContent: "center" }}>
                                        <Button onClick={() => createAccount()}>Register</Button>
                                    </Form.Group>
                                </Form>
                                {alert_register.show ? <Alert variant="danger">
                                    {alert_register.msg}
                                </Alert>
                                    :
                                    null}
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    )
}