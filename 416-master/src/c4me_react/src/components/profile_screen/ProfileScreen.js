import React, { useState, useEffect } from 'react';
import { Modal, Button, Row, Container, Col, Form, Tabs, Tab, Card, DropdownButton, Dropdown, Alert } from 'react-bootstrap';
import axios from 'axios';
import BootstrapTable from 'react-bootstrap-table-next';
import * as Constants from './../../constants/constants.js'
import cellEditFactory from 'react-bootstrap-table2-editor';
import Select from 'react-select'

export default function ProfileScreen(props) {

    const [studentInfo, setStudentInfo] = useState({
        applications: [],
        residence_state: "",
        high_school_name: "",
        high_school_city: "",
        high_school_state: "",
        college_class: "",
        major_1: "",
        major_2: "",
        SAT_math: 0,
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
        gpa:0
    })
    const [count, setCount] = useState(0);
    const [isEditing, setIsEditing] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [addCollege, setAddCollege] = useState({ collegeName: "", status: "Select a status" });
    const [alert, setAlert] = useState({ show: false, msg: "" })
    const [alertHeader, setAlertHeader] = useState({ show: false, msg: "" })
    const [collegeNames, setCollegeNames] = useState({ list: []})

    const cellEdit = cellEditFactory({
        mode: 'click',
        blurToSave: true,
        beforeSaveCell
    });

    async function getCollegeNames() {
        try {
            console.log("studentInfo", studentInfo)
            const res_data = await axios.get(`${Constants.port}/colleges/collegeName`);
            if (res_data.status !== 200) {
                throw new Error(res_data.data.error);
            }
            console.log("fetching college-name-data", res_data)
            let newlist = []
            for (var i = 0; i < res_data.data.collegenames.length; i++) {
                const x = {
                    value: i,
                    label: res_data.data.collegenames[i]
                }
                newlist[i] = x;
            }
            setCollegeNames({list: newlist})
            return res_data;
        } catch (error) {
            if (error.response) {
                console.log(error.response.data.error_msg);
            } else if (error.request) {
                console.log(error.request);
            } else {
                console.log('Error', error.message);
            }
            return false;
        }
    }

    async function updateStudentInfo() {
        try {
            console.log("studentInfo", studentInfo)
            const res_data = await axios.post(`${Constants.port}/profile`, studentInfo);
            if (res_data.status !== 200) {
                throw new Error(res_data.data.error);
            }
            setCount(count + 1);

            return res_data;
        } catch (error) {
            if (error.response) {
                setAlertHeader({ show: true, msg: error.response.data.error_msg })
                console.log(error.response.data.error_msg);
            } else if (error.request) {
                console.log(error.request);
            } else {
                console.log('Error', error.message);
            }
            return false;
        }
    }

    async function getProfileInfo() {
        try {
            const res_data = await axios.get(`${Constants.port}/profile`);
            if (res_data.status !== 200) {
                throw new Error(res_data.data.error);
            }
            let data = res_data.data.student;
            //setListOfProfiles({list: data});
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

    async function addApplication() {
        try {
            const res_data = await axios.post(`${Constants.port}/addapp`, addCollege);
            if (res_data.status !== 200) {
                throw new Error(res_data.data.error);
            }
            console.log('fetching data-add-app', res_data);
            createNewApplication();
            setCount(count+1)
            return res_data;
        } catch (error) {
            if (error.response) {
                setAlert({ show: true, msg: error.response.data.error_msg })
                console.log(error.response.data.error_msg);
            } else if (error.request) {
                console.log(error.request);
            } else {
                console.log('Error', error.message);
            }
            return null;
        }
    }

    async function updateApplicationStatus(item){
        try {
            console.log("item: ", item)
            const res_data = await axios.post(`${Constants.port}/updateapp`, item);
            if (res_data.status !== 200) {
                throw new Error(res_data.data.error);
            }
            console.log('fetching data', res_data);
            return res_data;
        } catch (error) {
            if (error.response) {
                setAlert({ show: true, msg: error.response.data.error_msg })
                console.log(error.response.data.error_msg);
            } else if (error.request) {
                console.log(error.request);
            } else {
                console.log('Error', error.message);
            }
            return null;
        }
    }

    function saveChanges() {
        updateStudentInfo();
        setIsEditing(false);
    }

    function createNewApplication() {
        const item = {
            collegeName: addCollege.collegeName,
            status: addCollege.status
        }
        let newApps = studentInfo.applications;
        newApps.push(item);
        console.log("added item: ", item)
        //addApplication();
        setStudentInfo({ ...studentInfo, applications: newApps });
        setAddCollege({ collegeName: "", status: "Select a status" });
    }

    function updateStatus(row, newValue){
        const item = {
            _id: row._id,
            collegeName: row.collegeName,
            status: newValue
        }
        updateApplicationStatus(item)
    }

    function beforeSaveCell(oldValue, newValue, row, column, done) {
        setTimeout(() => {
          if (window.confirm('Do you want to accep this change?')) {
            updateStatus(row, newValue)
            done(true);
          } else {
            done(false);
          }
        }, 0);
        return { async: true };
      }

      const handleChange = (newValue, actionMeta) => {
        console.log("handle change, newvalue: ", newValue);
        if (newValue == null) {
            setAddCollege({ ...addCollege, collegeName: "" });
            return;
        }
        setAddCollege({ ...addCollege, collegeName: newValue.label });
    };

    useEffect(() => {
        getCollegeNames();
        getProfileInfo();

    }, [count, props]);

    return (
        <div className="cardpadding">
            <Card>
                <Card.Header style={{ fontSize: "35px", textAlign:"center" }}>{studentInfo.userid} |  {' '}
                    <Button onClick={() => setIsEditing(true)} disabled={isEditing} variant="primary">Edit Profile</Button>{' '}{' '}
                    <Button onClick={() => saveChanges()} disabled={!isEditing} variant="primary">Save Changes</Button>{' '}{' '}
                    {alertHeader.show ? <Alert style={{fontSize:"25px"}} dismissible onClose={()=>setAlertHeader({show: false, msg: ""})} variant="danger">
                                    {alertHeader.msg}
                                </Alert>
                                    :
                                    null}

                </Card.Header>
                <Card.Body>
                   
                    <Container>
                        <Row>
                            <Col>
                                <br />
                                <Form>
                                    <Row >
                                        <h2 style={{fontWeight:300}}>User Info</h2>
                                    </Row>
                                    <Form.Group as={Row} bsPrefix="profileItem" >
                                        <Form.Label column sm={3}> High School </Form.Label>
                                        <Col sm={5}> <Form.Control onChange={(e) => setStudentInfo({ ...studentInfo, high_school_name: e.target.value })} disabled={!isEditing} value={studentInfo.high_school_name} /> </Col>
                                    </Form.Group>
                                    <Form.Group as={Row} bsPrefix="profileItem"  >
                                        <Form.Label column sm={4}> High School City </Form.Label>
                                        <Col sm={4}> <Form.Control disabled={!isEditing} value={studentInfo.high_school_city} onChange={(e) => setStudentInfo({ ...studentInfo, high_school_city: e.target.value })} /> </Col>
                                    </Form.Group>
                                    <Form.Group as={Row} bsPrefix="profileItem" >
                                        <Form.Label column sm={4}> High School State </Form.Label>
                                        <Col sm={4}> <Form.Control onChange={(e) => setStudentInfo({ ...studentInfo, high_school_state: e.target.value })} disabled={!isEditing} value={studentInfo.high_school_state} /> </Col>
                                    </Form.Group>
                                    <Form.Group as={Row} bsPrefix="profileItem" >
                                        <Form.Label column sm={4}> Graduation Year </Form.Label>
                                        <Col sm={4}> <Form.Control onChange={(e) => setStudentInfo({ ...studentInfo, college_class: e.target.value })} disabled={!isEditing} value={studentInfo.college_class > 0 ? studentInfo.college_class : null} /> </Col>
                                    </Form.Group>
                                    <Form.Group as={Row} bsPrefix="profileItem" >
                                        <Form.Label column sm={4}> Major 1 </Form.Label>
                                        <Col sm={4}> <Form.Control onChange={(e) => setStudentInfo({ ...studentInfo, major_1: e.target.value })} disabled={!isEditing} value={studentInfo.major_1} /> </Col>
                                    </Form.Group>
                                    <Form.Group as={Row} bsPrefix="profileItem" > <Form.Label column sm={4}> Major 2 </Form.Label>
                                        <Col sm={4}> <Form.Control onChange={(e) => setStudentInfo({ ...studentInfo, major_2: e.target.value })} disabled={!isEditing} value={studentInfo.major_2} /> </Col>
                                    </Form.Group>
                                    <Form.Group as={Row} bsPrefix="profileItem" >
                                        <Form.Label column sm={4}> #AP Passed </Form.Label>
                                        <Col sm={4}> <Form.Control onChange={(e) => setStudentInfo({ ...studentInfo, num_AP_passed: e.target.value })} disabled={!isEditing} value={studentInfo.num_AP_passed > 0 ? studentInfo.num_AP_passed : null} /> </Col>
                                    </Form.Group>
                                    <Form.Group as={Row} bsPrefix="profileItem" >
                                        <Form.Label column sm={4}> GPA </Form.Label>
                                        <Col sm={4}> <Form.Control onChange={(e) => setStudentInfo({ ...studentInfo, gpa: e.target.value })} disabled={!isEditing} value={studentInfo.gpa > 0 ? studentInfo.gpa : null} /> </Col>
                                    </Form.Group>
                                </Form>
                            </Col>
                            <Col>

                                <br />
                                <Row >
                                    <h3 style={{fontWeight:300}} >Test Scores</h3>
                                </Row>
                                <Tabs defaultActiveKey="sat" id="uncontrolled-tab-example">
                                    <Tab eventKey="sat" title="SAT">
                                        <br />
                                        <Form.Group as={Row} bsPrefix="profileItem" >
                                        <Form.Label column sm={3} > EBRW </Form.Label>
                                            <Col sm={2}><Form.Control onChange={(e) => setStudentInfo({ ...studentInfo, SAT_EBRW: e.target.value })} disabled={!isEditing} value={studentInfo.SAT_EBRW > 0 ? studentInfo.SAT_EBRW : null} /></Col>
                                            <Form.Label column sm={3} > US History </Form.Label>
                                            <Col sm={2}><Form.Control onChange={(e) => setStudentInfo({ ...studentInfo, SAT_US_hist: e.target.value })} disabled={!isEditing} value={studentInfo.SAT_US_hist > 0 ? studentInfo.SAT_US_hist : null} /></Col>
                                          
                                        </Form.Group>
                                        <Form.Group as={Row} bsPrefix="profileItem" >
                                            <Form.Label column sm={3}> Math </Form.Label>
                                            <Col sm={2}><Form.Control onChange={(e) => setStudentInfo({ ...studentInfo, SAT_math: e.target.value })} disabled={!isEditing} value={studentInfo.SAT_math > 0 ? studentInfo.SAT_math : null} /></Col>
                                            <Form.Label column sm={3}> World History </Form.Label>
                                            <Col sm={2}><Form.Control onChange={(e) => setStudentInfo({ ...studentInfo, SAT_world_hist: e.target.value })} disabled={!isEditing} value={studentInfo.SAT_world_hist > 0 ? studentInfo.SAT_world_hist : null} /></Col>
                                        </Form.Group>
                                        <Form.Group as={Row} bsPrefix="profileItem" >
                                            <Form.Label column sm={3}> Math l </Form.Label>
                                            <Col sm={2}><Form.Control onChange={(e) => setStudentInfo({ ...studentInfo, SAT_math_I: e.target.value })} disabled={!isEditing} value={studentInfo.SAT_math_I > 0 ? studentInfo.SAT_math_I : null} /></Col>
                                            <Form.Label column sm={3}> Bio Ecological </Form.Label>
                                            <Col sm={2}><Form.Control onChange={(e) => setStudentInfo({ ...studentInfo, SAT_eco_bio: e.target.value })} disabled={!isEditing} value={studentInfo.SAT_eco_bio > 0 ? studentInfo.SAT_eco_bio : null} /></Col>
                                        </Form.Group>
                                        <Form.Group as={Row} bsPrefix="profileItem" >
                                            <Form.Label column sm={3}> Math ll </Form.Label>
                                            <Col sm={2}><Form.Control onChange={(e) => setStudentInfo({ ...studentInfo, SAT_math_II: e.target.value })} disabled={!isEditing} value={studentInfo.SAT_math_II > 0 ? studentInfo.SAT_math_II : null} /></Col>
                                            <Form.Label column sm={3}> Bio Molecular </Form.Label>
                                            <Col sm={2}><Form.Control onChange={(e) => setStudentInfo({ ...studentInfo, SAT_mol_bio: e.target.value })} disabled={!isEditing} value={studentInfo.SAT_mol_bio > 0 ? studentInfo.SAT_mol_bio : null} /></Col>
                                        </Form.Group>
                                        <Form.Group as={Row} bsPrefix="profileItem" >
                                            <Form.Label column sm={3}> Chemistry </Form.Label>
                                            <Col sm={2}><Form.Control onChange={(e) => setStudentInfo({ ...studentInfo, SAT_chemistry: e.target.value })} disabled={!isEditing} value={studentInfo.SAT_chemistry > 0 ? studentInfo.SAT_chemistry : null} /></Col>
                                        </Form.Group>
                                    </Tab>
                                    <Tab eventKey="act" title="ACT">
                                        <br />
                                        <Form.Group as={Row} bsPrefix="profileItem" >
                                            <Form.Label column sm={3}> English </Form.Label>
                                            <Col sm={2}><Form.Control onChange={(e) => setStudentInfo({ ...studentInfo, ACT_English: e.target.value })} disabled={!isEditing} value={studentInfo.ACT_English > 0 ? studentInfo.ACT_English : null} /></Col>
                                            <Form.Label column sm={3}> Reading </Form.Label>
                                            <Col sm={2}><Form.Control onChange={(e) => setStudentInfo({ ...studentInfo, ACT_reading: e.target.value })} disabled={!isEditing} value={studentInfo.ACT_reading > 0 ? studentInfo.ACT_reading : null} /></Col>
                                        </Form.Group>
                                        <Form.Group as={Row} bsPrefix="profileItem" >
                                            <Form.Label column sm={3}> Science </Form.Label>
                                            <Col sm={2}><Form.Control onChange={(e) => setStudentInfo({ ...studentInfo, ACT_science: e.target.value })} disabled={!isEditing} value={studentInfo.ACT_science > 0 ? studentInfo.ACT_science : null} /></Col>
                                            <Form.Label column sm={3}> Composite </Form.Label>
                                            <Col sm={2}><Form.Control onChange={(e) => setStudentInfo({ ...studentInfo, ACT_composite: e.target.value })} disabled={!isEditing} value={studentInfo.ACT_composite > 0 ? studentInfo.ACT_composite : null} /></Col>
                                        </Form.Group>
                                        <Form.Group as={Row} bsPrefix="profileItem" >
                                            <Form.Label column sm={3}> Math </Form.Label>
                                            <Col sm={2}><Form.Control onChange={(e) => setStudentInfo({ ...studentInfo, ACT_math: e.target.value })} disabled={!isEditing} value={studentInfo.ACT_math > 0 ? studentInfo.ACT_math : null} /></Col>
                                        </Form.Group>
                                    </Tab>
                                </Tabs>
                                <br/>
                                <Row >
                                    <h3 style={{fontWeight:300}}>Applications</h3>
                                </Row>
                                {alert.show ? <Alert dismissible onClose={()=>setAlert({show: false, msg: ""})} variant="danger">
                                    {alert.msg}
                                </Alert>
                                    :
                                    null}
                                {!isEditing ? <BootstrapTable
                                    bootstrap4
                                    keyField='collegeName'
                                    data={studentInfo.applications}
                                    columns={Constants.application_columns}
                                    defaultSorted={Constants.defaultSorted}
                                    selectRow={Constants.selectRow}
                                />
                                    :
                                    <BootstrapTable
                                        bootstrap4
                                        hover
                                        keyField='collegeName'
                                        data={studentInfo.applications}
                                        columns={Constants.application_columns}
                                        defaultSorted={Constants.defaultSorted}
                                        cellEdit={cellEdit}
                                        selectRow={Constants.selectRow}
                                    />}
                                <div style={{ width: "100%" }}>
                                    <Col className="reset-page">

                                        <Button variant="primary" disabled={!isEditing} onClick={() => setShowModal(true)}>Add Application</Button>{' '}
                                        <Modal show={showModal} onHide={() => {setShowModal(false); setAddCollege({status:"Select a status", collegeName:""})}}>
                                            <Modal.Header closeButton>
                                                <Modal.Title>Add Application</Modal.Title>
                                            </Modal.Header>
                                            <Modal.Body>
                                                <Container>
                                                    <Row>
                                                        <Col>
                                                            <Form.Group as={Row} bsPrefix="profileItem" >
                                                                <Form.Label column sm={4}> College Name </Form.Label>
                                                                <Col sm={5}> 
                                                                <Select
                                                                    style={{ maxHeight: "150px", overflow: "scroll" }}
                                                                    onChange={handleChange}
                                                                    options={collegeNames.list}
                                                                    placeholder=""
                                                                />
                                                                    {/* <Form.Control onChange={(e) => setAddCollege({ ...addCollege, collegeName: e.target.value })} value={addCollege.collegeName} />  */}
                                                                </Col>
                                                            </Form.Group>
                                                            <Form.Group as={Row} bsPrefix="profileItem" >
                                                                <Form.Label column sm={4}> Status </Form.Label>
                                                                <Col sm={5}>
                                                                <DropdownButton id="dropdown-item-button" title={addCollege.status} onClick={(e)=>setAddCollege({ ...addCollege, status: e.target.innerHTML })}>
                                                                    <Dropdown.Item as="button">Accepted</Dropdown.Item>
                                                                    <Dropdown.Item as="button">Pending</Dropdown.Item>
                                                                    <Dropdown.Item as="button">Wait-listed</Dropdown.Item>
                                                                    <Dropdown.Item as="button">Denied</Dropdown.Item>
                                                                    <Dropdown.Item as="button">Deferred</Dropdown.Item>
                                                                    <Dropdown.Item as="button">Withdrawn</Dropdown.Item>
                                                                </DropdownButton>
                                                                </Col>
                                                            </Form.Group>
                                                        </Col>
                                                    </Row>
                                                </Container>
                                            </Modal.Body>
                                            <Modal.Footer>
                                                <Button variant="secondary" onClick={() => {setShowModal(false); setAddCollege({status:"Select a status", collegeName:""})}}>
                                                    Close
                </Button>
                                                <Button variant="primary" onClick={() => { setShowModal(false); addApplication() }}>
                                                    Save Changes
                </Button>
                                            </Modal.Footer>
                                        </Modal>
                                    </Col>
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