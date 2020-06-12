import React, { useState, useEffect } from 'react';
import { Row, Container, Col, Form, Tabs, Tab, Card } from 'react-bootstrap';
import axios from 'axios';
import BootstrapTable from 'react-bootstrap-table-next';
import * as Constants from '../../constants/constants.js'

export default function ViewOtherProfile(props) {

    const [studentInfo, setStudentInfo] = useState({
        applications: [],
        residence_state: "",
        high_school_name: "",
        high_school_city: "",
        high_school_state: "",
        college_class: "",
        major_1: "",
        major_2: "",
        SAT_math: "",
        SAT_EBRW: 0,
        ACT_English: 0,
        ACT_math: 0,
        ACT_reading: 0,
        ACT_science: 0,
        ACT_composite: 0,
        SAT_literature: 0,
        SAT_US_hist: 0,
        SAT_world_hist: 0,
        SAT_math_I: 0,
        SAT_math_II: 0,
        SAT_eco_bio: 0,
        SAT_mol_bio: 0,
        SAT_chemistry: 0,
        SAT_physics: 0,
        num_AP_passed: 0,
        _id: "",
        userid: "",
        gpa: 0
    })

    useEffect(() => {
        async function getProfile() {
            try {
                const res_data = await axios.get(`${Constants.port}/students/${props.match.params.id}`);
                if (res_data.status !== 200) {
                    throw new Error(res_data.data.error);
                }
                let data = res_data.data.student;
                setStudentInfo(data);
                console.log('fetching data', data);
                return res_data;
            } catch (error) {
                if (error.response)
                    props.history.push('/error', { error: 'Status Code ' + error.response.status + ' ' + error.response.data.error });
                else if (error.request)
                    props.history.push('/error', { error: 'request was made but no response was received: ' + error.request });
                else
                    props.history.push('/error', { error: 'something happened in setting up the request that triggered an error: ' + error.message });
            }
        }
        getProfile();

    }, [props]);

    if (studentInfo === null) {
        props.history.push('/error', { error: "Failed to get students profile" });
        return null;
    }

    return (
        <div className="cardpadding">
            <Card>
                <Card.Header style={{ fontSize: "35px", textAlign: "center" }}>Student '{studentInfo.userid}'
                </Card.Header>
                <Card.Body>

                    <Container>
                        <Row>
                            <Col>
                                <br />
                                <Form>
                                    <Row >
                                        <h2 >User Info</h2>
                                    </Row>
                                    <Form.Group as={Row} bsPrefix="profileItem" >
                                        <Form.Label column sm={3}> High School </Form.Label>
                                        <Col sm={5}> <Form.Control onChange={(e) => setStudentInfo({ ...studentInfo, high_school_name: e.target.value })} disabled={true} value={studentInfo.high_school_name} /> </Col>
                                    </Form.Group>
                                    <Form.Group as={Row} bsPrefix="profileItem"  >
                                        <Form.Label column sm={4}> High School City </Form.Label>
                                        <Col sm={4}> <Form.Control disabled={true} value={studentInfo.high_school_city} onChange={(e) => setStudentInfo({ ...studentInfo, high_school_city: e.target.value })} /> </Col>
                                    </Form.Group>
                                    <Form.Group as={Row} bsPrefix="profileItem" >
                                        <Form.Label column sm={4}> High School State </Form.Label>
                                        <Col sm={4}> <Form.Control onChange={(e) => setStudentInfo({ ...studentInfo, high_school_state: e.target.value })} disabled={true} value={studentInfo.high_school_state} /> </Col>
                                    </Form.Group>
                                    <Form.Group as={Row} bsPrefix="profileItem" >
                                        <Form.Label column sm={4}> Graduation Year </Form.Label>
                                        <Col sm={4}> <Form.Control onChange={(e) => setStudentInfo({ ...studentInfo, college_class: e.target.value })} disabled={true} value={studentInfo.college_class} /> </Col>
                                    </Form.Group>
                                    <Form.Group as={Row} bsPrefix="profileItem" >
                                        <Form.Label column sm={4}> Major 1 </Form.Label>
                                        <Col sm={4}> <Form.Control onChange={(e) => setStudentInfo({ ...studentInfo, major_1: e.target.value })} disabled={true} value={studentInfo.major_1} /> </Col>
                                    </Form.Group>
                                    <Form.Group as={Row} bsPrefix="profileItem" > <Form.Label column sm={4}> Major 2 </Form.Label>
                                        <Col sm={4}> <Form.Control onChange={(e) => setStudentInfo({ ...studentInfo, major_2: e.target.value })} disabled={true} value={studentInfo.major_2} /> </Col>
                                    </Form.Group>
                                    <Form.Group as={Row} bsPrefix="profileItem" >
                                        <Form.Label column sm={4}> #AP Passed </Form.Label>
                                        <Col sm={4}> <Form.Control onChange={(e) => setStudentInfo({ ...studentInfo, num_AP_passed: e.target.value })} disabled={true} value={studentInfo.num_AP_passed} /> </Col>
                                    </Form.Group>
                                    <Form.Group as={Row} bsPrefix="profileItem" >
                                        <Form.Label column sm={4}> GPA </Form.Label>
                                        <Col sm={4}> <Form.Control onChange={(e) => setStudentInfo({ ...studentInfo, gpa: e.target.value })} disabled={true} value={studentInfo.gpa} /> </Col>
                                    </Form.Group>
                                </Form>
                            </Col>
                            <Col>

                                <br />
                                <Row >
                                    <h3 >Test Scores</h3>
                                </Row>
                                <Tabs defaultActiveKey="sat" id="uncontrolled-tab-example">
                                    <Tab eventKey="sat" title="SAT">
                                        <br />
                                        <Form.Group as={Row} bsPrefix="profileItem" >
                                            <Form.Label column sm={3} > EBRW </Form.Label>
                                            <Col sm={2}><Form.Control onChange={(e) => setStudentInfo({ ...studentInfo, SAT_EBRW: e.target.value })} disabled={true} value={studentInfo.SAT_EBRW} /></Col>
                                            <Form.Label column sm={3} > US History </Form.Label>
                                            <Col sm={2}><Form.Control onChange={(e) => setStudentInfo({ ...studentInfo, SAT_US_hist: e.target.value })} disabled={true} value={studentInfo.SAT_US_hist} /></Col>

                                        </Form.Group>
                                        <Form.Group as={Row} bsPrefix="profileItem" >
                                            <Form.Label column sm={3}> Math </Form.Label>
                                            <Col sm={2}><Form.Control onChange={(e) => setStudentInfo({ ...studentInfo, SAT_math: e.target.value })} disabled={true} value={studentInfo.SAT_math} /></Col>
                                            <Form.Label column sm={3}> World History </Form.Label>
                                            <Col sm={2}><Form.Control onChange={(e) => setStudentInfo({ ...studentInfo, SAT_world_hist: e.target.value })} disabled={true} value={studentInfo.SAT_world_hist} /></Col>
                                        </Form.Group>
                                        <Form.Group as={Row} bsPrefix="profileItem" >
                                            <Form.Label column sm={3}> Math l </Form.Label>
                                            <Col sm={2}><Form.Control onChange={(e) => setStudentInfo({ ...studentInfo, SAT_math_I: e.target.value })} disabled={true} value={studentInfo.SAT_math_I} /></Col>
                                            <Form.Label column sm={3}> Bio Ecological </Form.Label>
                                            <Col sm={2}><Form.Control onChange={(e) => setStudentInfo({ ...studentInfo, SAT_eco_bio: e.target.value })} disabled={true} value={studentInfo.SAT_eco_bio} /></Col>
                                        </Form.Group>
                                        <Form.Group as={Row} bsPrefix="profileItem" >
                                            <Form.Label column sm={3}> Math ll </Form.Label>
                                            <Col sm={2}><Form.Control onChange={(e) => setStudentInfo({ ...studentInfo, SAT_math_II: e.target.value })} disabled={true} value={studentInfo.SAT_math_II} /></Col>
                                            <Form.Label column sm={3}> Bio Molecular </Form.Label>
                                            <Col sm={2}><Form.Control onChange={(e) => setStudentInfo({ ...studentInfo, SAT_mol_bio: e.target.value })} disabled={true} value={studentInfo.SAT_mol_bio} /></Col>
                                        </Form.Group>
                                        <Form.Group as={Row} bsPrefix="profileItem" >
                                            <Form.Label column sm={3}> Chemistry </Form.Label>
                                            <Col sm={2}><Form.Control onChange={(e) => setStudentInfo({ ...studentInfo, SAT_chemistry: e.target.value })} disabled={true} value={studentInfo.SAT_chemistry} /></Col>
                                        </Form.Group>
                                    </Tab>
                                    <Tab eventKey="act" title="ACT">
                                        <br />
                                        <Form.Group as={Row} bsPrefix="profileItem" >
                                            <Form.Label column sm={3}> English </Form.Label>
                                            <Col sm={2}><Form.Control onChange={(e) => setStudentInfo({ ...studentInfo, ACT_English: e.target.value })} disabled={true} value={studentInfo.ACT_English} /></Col>
                                            <Form.Label column sm={3}> Reading </Form.Label>
                                            <Col sm={2}><Form.Control onChange={(e) => setStudentInfo({ ...studentInfo, ACT_reading: e.target.value })} disabled={true} value={studentInfo.ACT_reading} /></Col>
                                        </Form.Group>
                                        <Form.Group as={Row} bsPrefix="profileItem" >
                                            <Form.Label column sm={3}> Science </Form.Label>
                                            <Col sm={2}><Form.Control onChange={(e) => setStudentInfo({ ...studentInfo, ACT_science: e.target.value })} disabled={true} value={studentInfo.ACT_science} /></Col>
                                            <Form.Label column sm={3}> Composite </Form.Label>
                                            <Col sm={2}><Form.Control onChange={(e) => setStudentInfo({ ...studentInfo, ACT_composite: e.target.value })} disabled={true} value={studentInfo.ACT_composite} /></Col>
                                        </Form.Group>
                                        <Form.Group as={Row} bsPrefix="profileItem" >
                                            <Form.Label column sm={3}> Math </Form.Label>
                                            <Col sm={2}><Form.Control onChange={(e) => setStudentInfo({ ...studentInfo, ACT_math: e.target.value })} disabled={true} value={studentInfo.ACT_math} /></Col>
                                        </Form.Group>
                                    </Tab>
                                </Tabs>
                                <Row >
                                    {/* <PeopleFill style={{ width: "45px", height: "35px" }} /> */}
                                    <h3 >Applications</h3>
                                </Row>
                                <div style={{ maxHeight: "500px", overflowY: "scroll" }}>
                                    <BootstrapTable
                                        bootstrap4
                                        keyField='collegeName'
                                        data={studentInfo.applications}
                                        columns={Constants.application_columns}
                                        defaultSorted={Constants.defaultSorted}
                                    /* selectRow={Constants.selectRow} */
                                    />
                                </div>


                            </Col>
                        </Row>
                    </Container>
                </Card.Body>
            </Card>
            <br />

        </div>
    )
}