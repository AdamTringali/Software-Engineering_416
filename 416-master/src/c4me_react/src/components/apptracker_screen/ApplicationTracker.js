import React, { useState, useEffect } from 'react';
import { Row, Col, Card, DropdownButton, Dropdown, Form, Button, Spinner } from 'react-bootstrap';
import * as Constants from './../../constants/constants.js';
import axios from 'axios';
import BootstrapTable from 'react-bootstrap-table-next';
import { Bubble } from 'react-chartjs-2';
import Tooltip from 'rc-tooltip';
import Slider, { Range } from 'rc-slider';
import ProfileModal from '../profile_screen/ProfileModal.js'
import Select from 'react-select'
import 'chartjs-plugin-annotation';


export default function ApplicationTracker(props) {
    const [averageStatus, setAverageStatus] = useState({ status: "All" });
    const [appsList, setAppsList] = useState({ list: props.apps })
    const [statistics, setStastics] = useState({
        avg_act: 0,
        avg_act_accept: 0,
        avg_ebrw: 0,
        avg_ebrw_accept: 0,
        avg_gpa: 0,
        avg_gpa_accept: 0,
        avg_math: 0,
        avg_math_accept: 0,
    });
    const [filterInfo, setFilterInfo] = useState({
        id: props.match.params.id,
        strict: true,
        classMin: 2000,
        classMax: 2030,
        status: [],
        highschool: []
    });
    const Handle = Slider.Handle;
    const [xAxis, setXAxis] = useState({ x: "Select a value" })
    const [count, setCount] = useState(0);
    const [show, setShow] = useState(false);
    const [scatterUpdate, setScatterUpdate] = useState(false);
    const [userid, setUserid] = useState({ id: "" });
    const [scatterData, setScatterData] = useState({ accepted: [], denied: [], other: [] });
    const [loading, setLoading] = useState(true);
    const [mean, setMean] = useState({ x: 0, y: 0 });
    const options = {
        annotation: {
            annotations: [{
                type: 'line',
                mode: 'horizontal',
                scaleID: 'y-axis-0',
                value: mean.y,
                borderColor: 'rgb(75, 192, 192)',
                borderWidth: 2,
                label: {
                    enabled: false,
                    content: 'Test label'
                },
                borderDash:[8,8]
            },
            {
                type: 'line',
                mode: 'vertical',
                scaleID: 'x-axis-0',
                value: mean.x,
                borderColor: 'rgb(75, 192, 192)',
                borderWidth: 2,
                label: {
                    enabled: false,
                    content: 'Test label'
                },
                borderDash:[8,8]
            }]
        }
    };
    const data = {
        datasets: [
            {
                label: 'Accepted',
                fill: false,
                lineTension: 0.1,
                backgroundColor: 'rgba(3, 209, 0, 1)',
                /* borderColor: 'rgba(75,192,192,1)', */
                borderCapStyle: 'butt',
                borderDash: [],
                borderDashOffset: 0.0,
                borderJoinStyle: 'miter',
                pointBorderColor: 'rgba(75,192,192,1)',
                pointBackgroundColor: '#fff',
                pointBorderWidth: 1,
                pointHoverRadius: 5,
                pointHoverBackgroundColor: 'rgba(75,192,192,1)',
                pointHoverBorderColor: 'rgba(220,220,220,1)',
                pointHoverBorderWidth: 2,
                pointRadius: 1,
                pointHitRadius: 10,
                data: scatterData.accepted
            },
            {
                label: 'Denied',
                fill: false,
                lineTension: 0.1,
                backgroundColor: 'rgba(209, 0, 0, 1)',
                /* borderColor: 'rgba(75,192,192,1)', */
                borderCapStyle: 'butt',
                borderDash: [],
                borderDashOffset: 0.0,
                borderJoinStyle: 'miter',
                pointBorderColor: 'rgba(75,192,192,1)',
                pointBackgroundColor: '#fff',
                pointBorderWidth: 1,
                pointHoverRadius: 5,
                pointHoverBackgroundColor: 'rgba(75,192,192,1)',
                pointHoverBorderColor: 'rgba(220,220,220,1)',
                pointHoverBorderWidth: 2,
                pointRadius: 1,
                pointHitRadius: 10,
                data: scatterData.denied
            },
            {
                label: 'Other',
                fill: false,
                lineTension: 0.1,
                backgroundColor: 'rgba(255, 217, 0, 1)',
                /* borderColor: 'rgba(75,192,192,1)', */
                borderCapStyle: 'butt',
                borderDash: [],
                borderDashOffset: 0.0,
                borderJoinStyle: 'miter',
                pointBorderColor: 'rgba(75,192,192,1)',
                pointBackgroundColor: '#fff',
                pointBorderWidth: 1,
                pointHoverRadius: 5,
                pointHoverBackgroundColor: 'rgba(75,192,192,1)',
                pointHoverBorderColor: 'rgba(220,220,220,1)',
                pointHoverBorderWidth: 2,
                pointRadius: 1,
                pointHitRadius: 10,
                data: scatterData.other
            }
        ]
    };

    const handle = (props) => {
        const { value, dragging, index, ...restProps } = props;
        return (
            <Tooltip
                prefixCls="rc-slider-tooltip"
                overlay={value}
                visible={dragging}
                placement="top"
                key={index}
            >
                <Handle value={value} {...restProps} />
            </Tooltip>
        );
    };

    const rowEvents = {
        onClick: (e, row, rowIndex) => {
            //props.history.push(`/students/${row.userid}`)
            console.log("RowEvent - userid: ", row.userid);
            setUserid({ id: row.userid });
            setShow(true);
        },
    };

    const handleChange = (newValue, actionMeta) => {
        var list = [];
        if (newValue == null) {
            setFilterInfo({ ...filterInfo, highschool: [] });
            return;
        }
        for (var i = 0; i < newValue.length; i++) {
            list[i] = newValue[i].label;
        }
        setFilterInfo({ ...filterInfo, highschool: list })
    };

    const handleChange_status = (newValue, actionMeta) => {
        if (newValue == null) {
            setFilterInfo({ ...filterInfo, status: [] });
            return;
        }
        var list = [];
        for (var i = 0; i < newValue.length; i++) {
            list[i] = newValue[i].label;
        }
        setFilterInfo({ ...filterInfo, status: list });
    };

    function getScatterData() {
        var accepted_list = []
        var denied_list = []
        var other_list = []

        for (var i = 0; i < appsList.list.length; i++) {

            if (xAxis.x === "ACT Composite" && appsList.list[i].scatter_act != null) {
                setMean({ x: statistics.avg_act, y: statistics.avg_gpa })
                if (appsList.list[i].status.toLowerCase() === "accepted") 
                    accepted_list.push({ x: appsList.list[i].scatter_act, y: appsList.list[i].gpa, r: 5 })
                else if (appsList.list[i].status.toLowerCase() === "denied")
                    denied_list.push({ x: appsList.list[i].scatter_act, y: appsList.list[i].gpa, r: 5 })
                else
                    other_list.push({ x: appsList.list[i].scatter_act, y: appsList.list[i].gpa, r: 5 })
                
            } else if (xAxis.x === "SAT (Math + EBRW)" && appsList.list[i].scatter_sat != null) {
                setMean({ x: (statistics.avg_math + statistics.avg_ebrw), y: statistics.avg_gpa })
                if (appsList.list[i].status.toLowerCase() === "accepted")
                    accepted_list.push({ x: appsList.list[i].scatter_sat, y: appsList.list[i].gpa, r: 5 })
                else if (appsList.list[i].status.toLowerCase() === "denied")
                    denied_list.push({ x: appsList.list[i].scatter_sat, y: appsList.list[i].gpa, r: 5 })
                else
                    other_list.push({ x: appsList.list[i].scatter_sat, y: appsList.list[i].gpa, r: 5 })

            } else if (xAxis.x === "Weighted Average" && appsList.list[i].scatter_avg != null) {
                setMean({ x: 65, y: statistics.avg_gpa })
                if (appsList.list[i].status.toLowerCase() === "accepted")
                    accepted_list.push({ x: appsList.list[i].scatter_avg, y: appsList.list[i].gpa, r: 5 })
                else if (appsList.list[i].status.toLowerCase() === "denied")
                    denied_list.push({ x: appsList.list[i].scatter_avg, y: appsList.list[i].gpa, r: 5 })
                else
                    other_list.push({ x: appsList.list[i].scatter_avg, y: appsList.list[i].gpa, r: 5 })
            }
        }
    
    setScatterData({ accepted: accepted_list, denied: denied_list, other: other_list })
}

async function getFilteredApps() {
    try {
        const res_data = await axios.post(`${Constants.port}/colleges/applications`, filterInfo);
        if (res_data.status !== 200) {
            throw new Error(res_data.data.error);
        }
        let dataa = res_data.data;
        //setCollegeInfo(data)
        console.log("fetching data-filtered_apps", res_data);
        setAppsList({ list: dataa.applications });
        setStastics(dataa.statistics);
        setLoading(true);
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

function applyFilters() {
    console.log(" Application Tracker. filterinfo ", filterInfo)

    setLoading(false);

    getFilteredApps();

}

useEffect(() => {
    if (scatterUpdate === false) {
        setLoading(false);

        getFilteredApps();
        getScatterData();
    }
    else {
        getScatterData();
    }

}, [count])

return (
    <div className="cardpadding">
        {show ? <ProfileModal show={show} userid={userid.id} onHide={() => setShow(false)} /> : null}
        <Card>
            <Card.Body>
                <Row>
                    <Col>
                        <h2 style={{ textAlign: "center", fontWeight: 100 }}>Applications</h2>

                        <Card >
                            <Card.Body>
                                <Row>
                                    <Col xs={3} style={{ /* borderStyle: "groove", */ paddingTop: "15px", textAlign: "center" }}>
                                        <h2 style={{ textAlign: "center", fontWeight: 100, borderBottom: "ridge", paddingBottom: "10px" }}>Filters</h2>

                                        <Form>
                                            <Form.Group as={Row} style={{ placeContent: "center" }}>
                                                <Form.Check
                                                    inline
                                                    id="custom-switch"
                                                    type="switch"
                                                    label="Strict"
                                                    name="formHorizontalRadios"
                                                    checked={filterInfo.strict}
                                                    onChange={() => setFilterInfo({ ...filterInfo, strict: !filterInfo.strict })}
                                                />
                                                <Form.Check
                                                    inline
                                                    id="custom-switch2"
                                                    type="switch"
                                                    label="Lax"
                                                    name="formHorizontalRadios"
                                                    checked={!filterInfo.strict}
                                                    onChange={() => setFilterInfo({ ...filterInfo, strict: !filterInfo.strict })}
                                                />
                                            </Form.Group>
                                        </Form>
                                        <br />
                                        <p style={{ textAlign: "center" }}>College Class</p>
                                        <Range onAfterChange={(e) => setFilterInfo({ ...filterInfo, classMin: e[0], classMax: e[1] })} allowCross={false} min={2000} max={2030} handle={handle} defaultValue={[2000, 2030]} />
                                        <br />
                                        <p style={{ textAlign: "center" }}>Application Status</p>
                                        <Select
                                            style={{ maxHeight: "150px", overflow: "scroll" }}
                                            isMulti
                                            onChange={handleChange_status}
                                            options={Constants.app_status}
                                            placeholder=""
                                        />
                                        <br />
                                        <p style={{ textAlign: "center" }}>High schools</p>
                                        <Select
                                            style={{ maxHeight: "150px", overflow: "scroll" }}
                                            isMulti
                                            onChange={handleChange}
                                            options={props.names}
                                            placeholder=""
                                        />
                                        <br />
                                        <Button variant="primary" onClick={() => applyFilters()}>Apply Filters</Button>
                                    </Col>
                                    <Col xs={9}>
                                        <div style={{ /* maxWidth: "500px", */ maxHeight: "500px", textAlign: "center", overflowY: "scroll" }}>
                                            {loading ? <BootstrapTable
                                                bootstrap4
                                                hover
                                                keyField='userid'
                                                data={appsList.list}
                                                columns={Constants.student_columns}
                                                defaultSorted={Constants.defaultSorted_apps}
                                                /* cellEdit={cellEdit} */
                                                /* selectRow={Constants.selectRow} */
                                                rowEvents={rowEvents}
                                            /> :

                                                <div className="spinnerpadding">
                                                    <BootstrapTable
                                                        bootstrap4
                                                        hover
                                                        keyField='userid'
                                                        data={[]}
                                                        columns={Constants.student_columns}
                                                        defaultSorted={Constants.defaultSorted_apps}
                                                        /* cellEdit={cellEdit} */
                                                        /* selectRow={Constants.selectRow} */
                                                        rowEvents={rowEvents}
                                                    />
                                                    <Spinner animation="border" role="status">
                                                        <span className="sr-only">Loading...</span>
                                                    </Spinner> </div>}
                                        </div>
                                    </Col>

                                </Row>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
                <Row style={{ paddingTop: "40px"/* , borderTop: "groove" */ }}>
                    <Col>
                        <Card >
                            <Card.Body>
                                <Row >
                                    <Col>
                                        <h2 style={{ textAlign: "center", fontWeight: 100 }}>Scatterplot</h2>
                                        {loading ?
                                            <div style={{/*  maxWidth: "700px", maxHeight: "500px", */ marginLeft: "20px", textAlign: "center" }}>
                                                {/* <div className= "vertical_line">
                                                    <div className="horoz_line"> */}
                                                <Bubble className="chart-container" data={data} height={350} width={650} options={options} />
                                                {/* </div>
                                                    </div> */}
                                                <Row style={{ placeContent: "center", paddingTop: "10px" }}>
                                                    <DropdownButton id="dropdown-item-button" title={xAxis.x} onClick={(e) => { setXAxis({ x: e.target.innerHTML }); setCount(count + 1); setScatterUpdate(true) }} >
                                                        <Dropdown.Item as="button">ACT Composite</Dropdown.Item>
                                                        <Dropdown.Item as="button">SAT (Math + EBRW)</Dropdown.Item>
                                                        <Dropdown.Item as="button">Weighted Average</Dropdown.Item>
                                                    </DropdownButton>
                                                </Row>
                                            </div> :
                                            <div style={{ textAlign: "center" }}>
                                                <br />
                                                <Spinner animation="border" role="status">
                                                    <span className="sr-only">Loading...</span>
                                                </Spinner>
                                            </div>}
                                    </Col>
                                    <Col >
                                        <Row style={{ justifyContent: "center" }}>
                                            <h3 style={{ textAlign: "center", fontWeight: 100, paddingRight: "10px" }}>Averages with Application status: </h3>
                                            <DropdownButton id="dropdown-item-button" title={averageStatus.status} onClick={(e) => setAverageStatus({ status: e.target.innerHTML })}>
                                                <Dropdown.Item as="button">All</Dropdown.Item>
                                                <Dropdown.Item as="button">Accepted</Dropdown.Item>
                                            </DropdownButton>
                                        </Row>
                                        <br />
                                        <Row style={{ justifyContent: "center" }}>
                                            <Card style={{ alignItems: "center", padding: "10px", width: "205px", marginRight: "25px" }}>
                                                <p style={{ fontSize: "35px" }}> GPA </p>
                                                <p style={{ fontSize: "30px" }}> {averageStatus.status === "All" ? statistics.avg_gpa : statistics.avg_gpa_accept} </p>
                                            </Card>
                                            <Card style={{ alignItems: "center", padding: "10px", width: "205px" }}>
                                                <p style={{ fontSize: "35px" }}> SAT Math </p>
                                                <p style={{ fontSize: "30px" }}> {averageStatus.status === "All" ? statistics.avg_math : statistics.avg_math_accept} </p>
                                            </Card>
                                        </Row>
                                        <br />
                                        <Row style={{ justifyContent: "center" }}>
                                            <Card style={{ alignItems: "center", padding: "10px", width: "205px", marginRight: "25px" }}>
                                                <p style={{ fontSize: "35px" }}> SAT EBRW </p>
                                                <p style={{ fontSize: "30px" }}> {averageStatus.status === "All" ? statistics.avg_ebrw : statistics.avg_ebrw_accept} </p>
                                            </Card>
                                            <Card style={{ alignItems: "center", padding: "10px", width: "205px" }}>
                                                <p style={{ fontSize: "35px" }}> ACT Comp. </p>
                                                <p style={{ fontSize: "30px" }}> {averageStatus.status === "All" ? statistics.avg_act : statistics.avg_act_accept} </p>
                                            </Card>
                                        </Row>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Card.Body>
        </Card>

    </div>
)
}