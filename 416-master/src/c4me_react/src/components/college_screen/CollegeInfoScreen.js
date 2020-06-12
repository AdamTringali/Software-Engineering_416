import React, { useState, useEffect } from 'react';
import { Row, Container, Col, Form, ListGroup, Card, Button, Spinner } from 'react-bootstrap';
import * as Constants from './../../constants/constants.js';
import axios from 'axios';
import { ClipboardData, InfoSquare } from 'react-bootstrap-icons';
import ApplicationTracker from '../apptracker_screen/ApplicationTracker.js'
import ToolkitProvider, { ColumnToggle } from 'react-bootstrap-table2-toolkit';
import CreatableSelect from 'react-select/creatable';
import BootstrapTable from 'react-bootstrap-table-next';

export default function CollegeInfoScreen(props) {
    const { ToggleList } = ColumnToggle;

    const [showSimiliarHS, setShowSimiliarHS] = useState(0);
    const [loading, setLoading] = useState(true);
    const [appTracker, setAppTracker] = useState(0);

    const expandRow = {
        renderer: row => (
            <div style={{marginLeft:"15px"}}>
                <Row>
                    <p style={{fontSize:"20px"}}>{row.name}</p>
                </Row>
                {/* <Row>
                    <p style={{fontSize:"13px"}}>City:  </p> <p>{row.city}</p>
                </Row> */}
                
            </div>
        )
    };

    const [highschoolFullNameList, sethighschoolFullNameList] = useState({ list: [] });
    const [highschoolNameList, sethighschoolNameList] = useState({ list: [] });
    const [highschool, setHighschool] = useState({ name: "" })
    const [highschoolList, setHighschoolList] = useState({ list: [] });


    const [collegeInfo, setCollegeInfo] = useState(
        {
            collegeName: "College name",
            admissionRate: 123,
            stateAbbr: "stateabbr",
            admRate: 123,
            size: 123,
            websiteUrl: "web url", /* NEED */
            avgGpa: 123,
            ranking: 123,
            pictureUrl: "pic url", /* NEED */
            costInState: 123,
            costOutState: 123,
            SAT_math: 123,
            SAT_EBRW: 123,
            ACT_Composite: 123,
            majors: [],
            applications: [],
            institution_type: "institution type",
            completionRate: 0,
            grad_debt_median: 100000
        });

    function getHighschool(checkNew) {
        if (!checkNew) {
            const currentOption = highschoolFullNameList.list.find(option => option === highschool.name);
            return currentOption
        }
    }

    function handleCreate(inputValue) {
        console.group('Option created');
        console.log(inputValue)
    };

    function getSimilarHS(e) {
        setHighschool({ name: e.label })
        console.log("hs name: ", e.label)
        async function getSimHS() {
            try {
                const res_data = await axios.post(`${Constants.port}/hs/similar`, { search: e.label });
                if (res_data.status !== 200) {
                    throw new Error(res_data.data.error);
                }
                let dataa = res_data.data;
                console.log("fetching data-highschools-similar", dataa);
                setHighschoolList({ list: dataa.highschools })
                return res_data;
            } catch (error) {
                if (error.response) {
                    console.log(error.response.data.error_msg);
                } else if (error.request) {
                    console.log(error.request);
                } else {
                    console.log('Error', error.message);
                }
                console.log("Error getting similar")
            }
        }
        getSimHS();
    }
    async function getHSnamesforCollege() {
        try {
            const res_data = await axios.post(`${Constants.port}/colleges/names`, { id: props.match.params.id });
            if (res_data.status !== 200) {
                throw new Error(res_data.data.error);
            }
            let dataa = res_data.data;
            console.log("fetching data-highschools-names", dataa.names);
            let newlist = []
            for (var i = 0; i < dataa.names.length; i++) {
                const x = {
                    value: i,
                    label: dataa.names[i]
                }
                newlist[i] = x;
            }
            sethighschoolNameList({ list: newlist })

            return res_data;
        } catch (error) {
            if (error.response) {
                console.log(error.response.data.error_msg);
            } else if (error.request) {
                console.log(error.request);
            } else {
                console.log('Error', error.message);
            }
            console.log("ERROR with colleges/highschools")
        }
    }

    async function getAllhighschoolNames() {
        try {
            const res_data = await axios.get(`${Constants.port}/hs/names`);
            if (res_data.status !== 200) {
                throw new Error(res_data.data.error);
            }
            let dataa = res_data.data;
            console.log("fetching data-all-highschools-names", dataa);
            let newlist = []
            for (var i = 0; i < dataa.names.length; i++) {
                const x = {
                    value: i,
                    label: dataa.names[i]
                }
                newlist[i] = x;
            }
            sethighschoolFullNameList({ list: newlist })
            return res_data;
        } catch (error) {
            if (error.response) {
                console.log(error.response.data.error_msg);
            } else if (error.request) {
                console.log(error.request);
            } else {
                console.log('Error', error.message);
            }
            console.log("Error getting names")
        }
    }
    async function getCollegeInfo() {
        try {
            const res_data = await axios.get(`${Constants.port}/colleges/college/${props.match.params.id}`);
            if (res_data.status !== 200) {
                throw new Error(res_data.data.error);
            }
            let data = res_data.data.college;
            setCollegeInfo(data)
            console.log("fetching data", data);
            return res_data;

        } catch (error) {
            if (error.response) {
                console.log(error.response.data.error_msg);
            } else if (error.request) {
                console.log(error.request);
            } else {
                console.log('Error', error.message);
            }
        }
    }
    useEffect(() => {
        setLoading(false);
        getCollegeInfo();
        getAllhighschoolNames();
        getHSnamesforCollege();
        setTimeout(() => {
            setLoading(true);
        }, 200);
    }, [ props]);

    if (showSimiliarHS === 0)
        return (
            <div className="cardpadding">
                <Card>
                    <Card.Header style={{ fontSize: "35px" }}>
                        {appTracker === 0 ?
                            <Row >
                                <p style={{ /* margin: "auto", */ marginLeft: "20px", marginRight: "auto" }}>{collegeInfo.collegeName} {' '}</p>
                                <Row style={{ marginRight: "20px" }}>
                                    <Container>
                                        <Button style={{ margin: "auto" }} variant="primary" onClick={() => setShowSimiliarHS(1)} >Find Similar Highschools</Button>
                                        {' '} <Button style={{ margin: "auto" }} variant="primary" onClick={() => setAppTracker(1)} >Application Tracker</Button>
                                    </Container>
                                </Row>
                            </Row> :
                            <Row >
                                <p style={{ /* margin: "auto", */ marginLeft: "20px", marginRight: "auto" }}>{collegeInfo.collegeName} : Application Tracker {' '}</p>
                                <Row style={{ marginRight: "20px" }}>
                                    <Container>
                                        <Button style={{ margin: "auto" }} variant="primary" onClick={() => setShowSimiliarHS(1)} >Find Similar Highschools</Button>{' '}
                                        <Button style={{ margin: "auto" }} variant="primary" onClick={() => setAppTracker(0)} >College Information</Button>
                                    </Container>
                                </Row>
                            </Row>}
                    </Card.Header>
                    {appTracker === 0 ?
                        loading ?
                            (<Card.Body>
                                <Container >
                                    <Row>
                                        <Col>
                                            <Row style={{ borderBottom: "outset", width: "100%" }}>
                                                <InfoSquare style={{ width: "45px", height: "35px" }} />
                                                <h3 style={{ paddingLeft: "10px", fontWeight: 300 }}>Statistics</h3>
                                            </Row>
                                            <ListGroup.Item bsPrefix="collegeInfoItem">
                                                <Form.Label bsPrefix="firstLabelCollegeInfo"> Completion Rate: </Form.Label>
                                                <Form.Label bsPrefix="rightLabel"> {collegeInfo.completionRate} </Form.Label>
                                            </ListGroup.Item>
                                            <ListGroup.Item bsPrefix="collegeInfoItem">
                                                <Form.Label bsPrefix="firstLabelCollegeInfo"> Institution type: </Form.Label>
                                                <Form.Label bsPrefix="rightLabel"> {collegeInfo.costInState === collegeInfo.costOutState ? "Private" : "Public"} </Form.Label>
                                            </ListGroup.Item>
                                            <ListGroup.Item bsPrefix="collegeInfoItem">
                                                <Form.Label bsPrefix="firstLabelCollegeInfo" style={{ paddingRight: "147px" }}> State: </Form.Label>
                                                <Form.Label bsPrefix="rightLabel"> {collegeInfo.stateAbbr} </Form.Label>
                                            </ListGroup.Item>
                                            <ListGroup.Item bsPrefix="collegeInfoItem" >
                                                <Form.Label bsPrefix="firstLabelCollegeInfo" style={{ paddingRight: "131px" }}> Size: </Form.Label>
                                                <Form.Label bsPrefix="rightLabel"> {collegeInfo.size} </Form.Label>
                                            </ListGroup.Item>
                                            <ListGroup.Item bsPrefix="collegeInfoItem" >
                                                <Form.Label bsPrefix="firstLabelCollegeInfo" style={{ paddingRight: "119px" }}> Ranking: </Form.Label>
                                                <Form.Label bsPrefix="rightLabel"> {collegeInfo.ranking} </Form.Label>
                                            </ListGroup.Item>
                                            <ListGroup.Item bsPrefix="collegeInfoItem">
                                                <Form.Label bsPrefix="firstLabelCollegeInfo"> Admission Rate: </Form.Label>
                                                <Form.Label bsPrefix="rightLabel"> {collegeInfo.admissionRate} </Form.Label>
                                            </ListGroup.Item>

                                            <br />

                                            <Row style={{ borderBottom: "outset", width: "100%" }}>
                                                <ClipboardData style={{ width: "45px", height: "35px" }} />
                                                <h3 style={{ paddingLeft: "10px", fontWeight: 300 }}>Money Matters</h3>
                                            </Row>
                                            <ListGroup.Item bsPrefix="collegeInfoItem" >
                                                <Form.Label bsPrefix="firstLabelCollegeInfo" style={{ paddingRight: "81px" }}> Cost in state: </Form.Label>
                                                <Form.Label bsPrefix="rightLabel"> {collegeInfo.costInState} </Form.Label>
                                            </ListGroup.Item>
                                            <ListGroup.Item bsPrefix="collegeInfoItem">
                                                <Form.Label bsPrefix="firstLabelCollegeInfo"> Cost out of state: </Form.Label>
                                                <Form.Label bsPrefix="rightLabel"> {collegeInfo.costOutState} </Form.Label>
                                            </ListGroup.Item>
                                            <ListGroup.Item bsPrefix="collegeInfoItem" >
                                                <Form.Label bsPrefix="firstLabelCollegeInfo" style={{ paddingRight: "40px" }}> Avg. {/* Completed */} Student Debt: </Form.Label>
                                                <Form.Label bsPrefix="rightLabel"> {collegeInfo.grad_debt_median} </Form.Label>
                                            </ListGroup.Item>
                                        </Col>

                                        <Col>
                                            <Row style={{ borderBottom: "outset", width: "100%" }}>
                                                <h3 style={{ paddingLeft: "10px", fontWeight: 300 }}>Qualifications of Enrolled Freshmen</h3>
                                            </Row>
                                            <ListGroup.Item bsPrefix="collegeInfoItem" >
                                                <Form.Label bsPrefix="firstLabelCollegeInfo" style={{ paddingRight: "82px" }}> AVG GPA: </Form.Label>
                                                <Form.Label bsPrefix="rightLabel"> {collegeInfo.avgGpa} </Form.Label>
                                            </ListGroup.Item>
                                            <ListGroup.Item bsPrefix="collegeInfoItem" >
                                                <Form.Label bsPrefix="firstLabelCollegeInfo" style={{ paddingRight: "94px" }}> SAT Math: </Form.Label>
                                                <Form.Label bsPrefix="rightLabel"> {collegeInfo.SAT_math} </Form.Label>
                                            </ListGroup.Item>
                                            <ListGroup.Item bsPrefix="collegeInfoItem" >
                                                <Form.Label bsPrefix="firstLabelCollegeInfo" style={{ paddingRight: "90px" }}> SAT EBRW: </Form.Label>
                                                <Form.Label bsPrefix="rightLabel"> {collegeInfo.SAT_EBRW} </Form.Label>
                                            </ListGroup.Item>
                                            <ListGroup.Item bsPrefix="collegeInfoItem" >
                                                <Form.Label bsPrefix="firstLabelCollegeInfo"> ACT Composite: </Form.Label>
                                                <Form.Label bsPrefix="rightLabel"> {collegeInfo.ACT_Composite} </Form.Label>
                                            </ListGroup.Item>
                                        </Col>
                                        <Col>
                                            <Form.Group as={Row} >
                                                <Row style={{ borderBottom: "outset", width: "100%" }}>
                                                    <InfoSquare style={{ width: "45px", height: "35px" }} />
                                                    <h3 style={{ paddingLeft: "10px", fontWeight: 300 }}>Majors</h3>
                                                </Row>
                                                <ListGroup variant="flush">
                                                    <Row bsPrefix="majorsList">
                                                        {collegeInfo.majors && collegeInfo.majors.map(item => (
                                                            <ListGroup.Item key={item}> {item} </ListGroup.Item>

                                                        ))}
                                                    </Row>
                                                </ListGroup>
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                </Container>
                            </Card.Body>) : <div className="spinnerpadding"> <Spinner animation="border" role="status">
                                <span className="sr-only">Loading...</span>
                            </Spinner> </div>
                        : <ApplicationTracker apps={collegeInfo.applications} names={highschoolNameList.list} {...props} />}
                </Card>

            </div>
        )
    else
        return (
            <div className="cardpadding">
                <Card>
                    <Card.Header style={{ fontSize: "35px" }}>
                        <Row style={{ placeContent: "center" }}>
                            <p style={{ marginLeft: "20px", marginRight: "auto" }}>{collegeInfo.collegeName} : Find Similiar Highschools {' '}</p>
                            <Row style={{ marginRight: "20px" }}>
                                <Container>
                                    <Button style={{ margin: "auto" }} variant="primary" onClick={() => { setAppTracker(1); setShowSimiliarHS(0) }} >Application Tracker</Button>
                                </Container>
                            </Row>
                        </Row>
                    </Card.Header>
                    <Card.Body>
                        <Row>
                            <Col style={{ maxWidth: "75%", margin: "auto" }}>
                                <div >
                                    <CreatableSelect
                                        value={(getHighschool())}
                                        onChange={e => getSimilarHS(e)}
                                        onCreateOption={handleCreate}
                                        options={highschoolFullNameList.list}
                                        placeholder="Enter your high school name"
                                    />
                                </div>
                                <br />
                                <ToolkitProvider
                                    bootstrap4
                                    keyField='name'
                                    data={highschoolList.list}
                                    columns={Constants.highschool_columns}
                                    expandRow={expandRow}
                                    columnToggle
                                >
                                    {props => (
                                        <div>
                                            <ToggleList {...props.columnToggleProps} />
                                            <hr />
                                            <BootstrapTable
                                                expandRow={expandRow}
                                                defaultSorted={Constants.defaultSorted_hs}
                                                hover
                                                {...props.baseProps}
                                            />
                                        </div>
                                    )}
                                </ToolkitProvider>
                            </Col>
                        </Row>
                    </Card.Body>

                </Card>

            </div>)

}