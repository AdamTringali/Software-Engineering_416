import React, { useState, useEffect } from 'react';
import { Alert, Button, Container, Row, Col, Card/* , Spinner, Modal */ } from 'react-bootstrap';
import axios from 'axios';
import * as Constants from './../../constants/constants.js'
import BootstrapTable from 'react-bootstrap-table-next';
import ProfileModal from '.././profile_screen/ProfileModal.js'

export default function AdminScreen(props) {

    const [success, setSuccess] = useState({ show: false, msg: "" });
    const [count, setCount] = useState(0);
    const [show, setShow] = useState(false);
    const [failure, setFailure] = useState({ show: false, attempt: "", errmsg: "" });
    const [isLoading, setLoading] = useState({ current: false, delProfiles: false, delDatabase: false, studentProfiles: false, collegeData: false, ranking: false, scorecard: false });
    const [questionableApps, setQuestionableApps] = useState({ list: [] });
    const [selectedApp, setSelecetdApp] = useState({ item: {} });
    const rowEvents = {
        onClick: (e, row, rondex) => {
            console.log("row event, ", row)
            setSelecetdApp({ item: row })
            setShow(true)

        },
    };
    async function resetMongoDB() {
        try {
            const res_data = await axios.post(`${Constants.port}/admin/reset`);

            if (res_data.status !== 200)
                throw new Error("RETURNED: " + res_data.data.error);
            setSuccess({ show: true, msg: "Database reset was successful" });
            return res_data;

        } catch (error) {
            if (error.response)
                setFailure({ show: true, errmsg: 'Status Code ' + error.response.status + ' ' + error.response.data.error });
            else if (error.request)
                setFailure({ show: true, errmsg: 'request was made but no response was received: ' + error.request });
            else
                setFailure({ show: true, errmsg: 'something happened in setting up the request that triggered an error: ' + error.message });
        }
    }
    async function deleteStudents() {
        try {
            const res_data = await axios.post(`${Constants.port}/admin/delete_students`);
            if (res_data.status !== 200)
                throw new Error("RETURNED: " + res_data.data.error);
            setSuccess({ show: true, msg: "Delete students was successful" });
            return res_data;
        } catch (error) {
            if (error.response)
                setFailure({ show: true, errmsg: 'Status Code ' + error.response.status + ' ' + error.response.data.error });
            else if (error.request)
                setFailure({ show: true, errmsg: 'request was made but no response was received: ' + error.request });
            else
                setFailure({ show: true, errmsg: 'something happened in setting up the request that triggered an error: ' + error.message });
        }
    }
    async function importScorecard() {
        try {
            const res_data = await axios.post(`${Constants.port}/admin/import_scorecard`);
            if (res_data.status !== 200)
                throw new Error("RETURNED: " + res_data.data.error);
            setSuccess({ show: true, msg: "Import scorecard was successful" });
            return res_data;
        } catch (error) {
            if (error.response)
                setFailure({ show: true, attempt: "import scorecard", errmsg: 'Status Code ' + error.response.status + ' ' + error.response.data.error });
            else if (error.request)
                setFailure({ show: true, attempt: "import scorecard", errmsg: 'request was made but no response was received: ' + error.request });
            else
                setFailure({ show: true, attempt: "import scorecard", errmsg: 'something happened in setting up the request that triggered an error: ' + error.message });
        }
    }
    async function getProfiles() {
        try {
            const res_data = await axios.post(`${Constants.port}/admin/import_students`);
            if (res_data.status !== 200)
                throw new Error("RETURNED: " + res_data.data.error);
            setSuccess({ show: true, msg: "Import student profiles successful" });
            return res_data;
        } catch (error) {
            if (error.response)
                setFailure({ show: true, attempt: "import student profiles", errmsg: 'Status Code ' + error.response.status + ' ' + error.response.data.error });
            else if (error.request)
                setFailure({ show: true, attempt: "import student profiles", errmsg: 'request was made but no response was received: ' + error.request });
            else
                setFailure({ show: true, attempt: "import student profiles", errmsg: 'something happened in setting up the request that triggered an error: ' + error.message });
        }
    }
    async function getData() {
        try {
            const res_data = await axios.post(`${Constants.port}/admin/scrap_collegedata`);
            if (res_data.status !== 200)
                throw new Error("RETURNED: " + res_data.data.error);
            setSuccess({ show: true, msg: "Scrape college data successful" });
            return res_data;
        } catch (error) {
            if (error.response)
                setFailure({ show: true, attempt: "scrape collegedata", errmsg: 'Status Code ' + error.response.status + ' ' + error.response.data.error });
            else if (error.request)
                setFailure({ show: true, attempt: "scrape collegedata", errmsg: 'request was made but no response was received: ' + error.request });
            else
                setFailure({ show: true, attempt: "scrape collegedata", errmsg: 'something happened in setting up the request that triggered an error: ' + error.message });
        }
    }
    async function getRanks() {
        try {
            const res_data = await axios.post(`${Constants.port}/admin/scrap_collegerank`);
            if (res_data.status !== 200)
                throw new Error("RETURNED: " + res_data.data.error);
            setSuccess({ show: true, msg: "Scrape college rank successful" });
            return res_data;
        } catch (error) {
            if (error.response)
                setFailure({ show: true, attempt: "scrape college ranks", errmsg: 'Status Code ' + error.response.status + ' ' + error.response.data.error });
            else if (error.request)
                setFailure({ show: true, attempt: "scrape college ranks", errmsg: 'request was made but no response was received: ' + error.request });
            else
                setFailure({ show: true, attempt: "scrape college ranks", errmsg: 'something happened in setting up the request that triggered an error: ' + error.message });
        }
    }
    async function getQuestionableApps() {
        try {
            const res_data = await axios.get(`${Constants.port}/admin/questionableapps`);
            if (res_data.status !== 200)
                throw new Error("RETURNED: " + res_data.data.error);
            console.log("questionable apps data: ", res_data)
            setQuestionableApps({ list: res_data.data.apps })
            return res_data;
        } catch (error) {
            console.log("Error loading questionable apps, ", error);
        }
    }
    async function updateQuestionableApps() {
        try {
            const res_data = await axios.post(`${Constants.port}/admin/updateQuestionable`, selectedApp.item);
            if (res_data.status !== 200)
                throw new Error("RETURNED: " + res_data.data.error);
            console.log("questionable apps data: ", res_data)
            //setQuestionableApps({list: res_data.data.apps})
            return res_data;
        } catch (error) {
            console.log("Error loading questionable apps, ", error);
        }
    }
    function resetDatabase() {
        setLoading({ ...isLoading, delDatabase: true, current: true })
        resetMongoDB().then(() => {
            setLoading({ ...isLoading, delDatabase: false, current: false })
        });

    }

    function delete_students() {
        setLoading({ ...isLoading, delProfiles: true, current: true })
        deleteStudents().then(() => {
            setLoading({ ...isLoading, delProfiles: false, current: false })
        });

    }

    function import_scorecard() {
        setLoading({ ...isLoading, scorecard: true, current: true });
        importScorecard().then(() => {
            setLoading({ ...isLoading, scorecard: false, current: false });
        });
    }

    function import_studentprofiles() {
        setLoading({ ...isLoading, studentProfiles: true, current: true })
        getProfiles().then(() => {
            setLoading({ ...isLoading, studentProfiles: false, current: false })
        });

    }

    function scrape_collegedata() {
        setLoading({ ...isLoading, collegeData: true, current: true })
        getData().then(() => {
            setLoading({ ...isLoading, collegeData: false, current: false })
        });
    }

    function scrape_collegeranks() {
        setLoading({ ...isLoading, ranking: true, current: true })
        getRanks().then(() => {
            setLoading({ ...isLoading, ranking: false, current: false })
        });
    }

    function removeQuestionableApp() {
        console.log("removing questionable app")
        updateQuestionableApps();
        console.log("after removing questionable app")
        setCount(count + 1)
    }

    useEffect(() => {
        getQuestionableApps();
    }, [props, count])

    return (

        <div className="cardpadding">
            {show ? <ProfileModal show={show} userid={selectedApp.item.userid} onHide={() => setShow(false)} /> : null}
            <Card>
                <Card.Header style={{ fontSize: "30px" }}>
                    c4me Control Center
                        </Card.Header>
                <Card.Body style={{ textAlign: "center" }}>
                    <Row>
                        <Col>
                            <h2 style={{ textAlign: "center", fontWeight: 100 }}>Database Control</h2>
                            <br />
                            {/* <Modal show={true}  >
                <Modal.Body style={{margin:"auto", height:"100vh"}}>
                    <Spinner style={{position: "absolute", top:"50%"}} animation="border" role="status">
                        <span className="sr-only">Loading...</span>
                    </Spinner>
                </Modal.Body>
            </Modal> */}
                            {success.show ?
                                <Alert style={{ display: "inline-grid", height: "125px", width: "300px" }} variant="success" onClose={() => setSuccess(false)} dismissible>
                                    <Alert.Heading>{success.msg}</Alert.Heading>
                                    <p>Congrats</p>
                                </Alert>
                                : null}
                            {failure.show ?
                                <Alert style={{ display: "inline-grid", height: "125px", width: "300px" }} variant="danger" onClose={() => setFailure({ show: false })} dismissible>
                                    <Alert.Heading>{failure.attempt}</Alert.Heading>
                                    <p>
                                        {failure.errmsg}
                                    </p>
                                </Alert>
                                : null}
                            <Container>
                                <Row> <Col>
                                    <Button disabled={isLoading.current} onClick={!isLoading.studentProfiles ? () => import_studentprofiles() : null} variant="primary">{isLoading.studentProfiles ? 'Loading…' : 'Import Student Profiles'}</Button>{' '}
                                    <Button disabled={isLoading.current} onClick={!isLoading.collegeData ? () => scrape_collegedata() : null} variant="secondary">{isLoading.collegeData ? 'Loading…' : 'Scrape college data'}</Button>{' '}
                                </Col> </Row>
                                <Row style={{ paddingTop: "10px" }}> <Col>
                                    <Button disabled={isLoading.current} onClick={!isLoading.scorecard ? () => import_scorecard() : null} variant="primary"> {isLoading.scorecard ? 'Loading…' : 'Import college score card'}
                                    </Button>{' '}
                                    <Button disabled={isLoading.current} onClick={!isLoading.ranking ? () => scrape_collegeranks() : null} variant="secondary">{isLoading.ranking ? 'Loading…' : 'Scrape ranking'}</Button>{' '}
                                </Col> </Row>
                                <Row style={{ paddingTop: "10px" }}> <Col>
                                    <Button disabled={isLoading.current} onClick={!isLoading.delProfiles ? () => delete_students() : null} variant="danger">{isLoading.delProfiles ? 'Loading…' : 'Delete student profiles'}</Button>{' '}
                                    {' '}
                                    <Button disabled={isLoading.current} onClick={!isLoading.delDatabase ? () => resetDatabase() : null} variant="danger">{isLoading.delDatabase ? 'Loading…' : 'Reset Database'}</Button>{' '}
                                </Col> </Row>
                            </Container>

                        </Col>
                        <Col>
                            <h2 style={{ textAlign: "center", fontWeight: 100 }}>Review Acceptence Decisions</h2>
                            <Card >
                                <Card.Body>
                                    <div style={{ maxWidth: "500px", maxHeight: "500px", margin: "auto" }}>
                                        <div style={{ marginBottom: "10px" }}>
                                            <Button onClick={() => removeQuestionableApp()} variant="primary">Mark non questionable</Button>{' '}
                                        </div>
                                        <div style={{overflowY:"scroll", maxHeight:"450px"}}>
                                            <BootstrapTable
                                                bootstrap4
                                                hover
                                                keyField='_id'
                                                data={questionableApps.list}
                                                columns={Constants.review_student_columns}
                                                defaultSorted={Constants.defaultSorted_apps}
                                                /* cellEdit={cellEdit} */
                                                selectRow={Constants.selectRow}
                                                rowEvents={rowEvents}

                                            />
                                        </div>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>
        </div>
    )
}