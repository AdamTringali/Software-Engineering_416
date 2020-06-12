import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Row, Container, Form, Col, Button, Card, Spinner } from 'react-bootstrap';
import Slider, { Range } from 'rc-slider';
import Tooltip from 'rc-tooltip';
import BootstrapTable from 'react-bootstrap-table-next';
import * as Constants from './../../constants/constants.js'
import 'react-bootstrap-table2-filter/dist/react-bootstrap-table2-filter.min.css';
import 'rc-slider/assets/index.css';
import ToolkitProvider, { ColumnToggle } from 'react-bootstrap-table2-toolkit';
import filterFactory from 'react-bootstrap-table2-filter';
import Select from 'react-select'


export default function CollegeScreen(props) {
    const [loading, setLoading] = useState(true)
    const { ToggleList } = ColumnToggle;
    const Handle = Slider.Handle;
    const [rowcount, setRowCount] = useState(0);
    const [listOfColleges, setListOfColleges] = useState({ list: [], set: false })
    const [listOfStates, setListOfStates] = useState({ list: [], set: false })
    const [filterInfo, setFilterInfo] = useState({
        strict: true, admissionRateMin: 0, admissionRateMax: 0, rankingMin: 0, rankingMax: 0,
        sizeMin: 0, sizeMax: 0, satMathMin: 0, satMathMax: 0, satEBRWMin: 0, satEBRWMax: 0, actCompositeMin: 0,
        actCompositeMax: 0, maxTuition: 0, name: "", major1: "", major2: "", location: [false, false, false, false], states: []
    })

    const [hidden, setHidden] = useState({
        collegeName: false,
        admissionRate: false,
        costInState: true,
        costOutState: true,
        ranking: false,
        SAT_math: true,
        SAT_EBRW: true,
        ACT_Composite: true,
        size: false,
        similarScore: true
    })
    const columns = [
        {
            dataField: 'collegeName',
            text: 'College Name',
            sort: true,
            hidden: hidden.collegeName
        }, {
            dataField: 'admissionRate',
            text: 'Admission Rate',
            sort: true,
            hidden: hidden.admissionRate
        }, {
            dataField: 'costInState',
            text: 'In State Cost',
            sort: true,
            hidden: hidden.costInState
        }, {
            dataField: 'costOutState',
            text: 'Out of state cost',
            sort: true,
            hidden: hidden.costOutState
        }, {
            dataField: 'ranking',
            text: 'Ranking',
            sort: true,
            hidden: hidden.ranking
        }, {
            dataField: 'SAT_math',
            text: 'SAT Math',
            sort: true,
            hidden: hidden.SAT_math
        }, {
            dataField: 'SAT_EBRW',
            text: 'SAT EBRW',
            sort: true,
            hidden: hidden.SAT_EBRW
        }, {
            dataField: 'ACT_Composite',
            text: 'ACT Composite',
            sort: true,
            hidden: hidden.ACT_Composite

        }, {
            dataField: 'size',
            text: 'Size',
            sort: true,
            hidden: hidden.size
        }, {
            dataField: 'similarScore',
            text: 'Recommendation Score',
            sort: true,
            hidden: hidden.similarScore
    }];
    
    function toggleHidden(e) {
        console.log("ToggleHidden", e)

        switch (e) {
            case "costOutState":
                setHidden({ ...hidden, costOutState: !hidden.costOutState });
                break;
            case "collegeName":
                setHidden({ ...hidden, collegeName: !hidden.collegeName });
                break;
            case "admissionRate":
                setHidden({ ...hidden, admissionRate: !hidden.admissionRate });
                break;
            case "costInState":
                setHidden({ ...hidden, costInState: !hidden.costInState });
                break;
            case "ranking":
                setHidden({ ...hidden, ranking: !hidden.ranking });
                break;
            case "SAT_math":
                setHidden({ ...hidden, SAT_math: !hidden.SAT_math });
                break;
            case "SAT_EBRW":
                setHidden({ ...hidden, SAT_EBRW: !hidden.SAT_EBRW });
                break;
            case "ACT_Composite":
                setHidden({ ...hidden, ACT_Composite: !hidden.ACT_Composite });
                break;
            case "size":
                setHidden({ ...hidden, size: !hidden.size });
                break;
            case "similarScore":
                setHidden({ ...hidden, similarScore: !hidden.similarScore });
                break;
            default: 
                break;
        }



    }

    async function getRecommColleges() {
        try {
            const res_data = await axios.post(`${Constants.port}/colleges/recommendation`, {colleges: listOfColleges.list});
            if (res_data.status !== 200) {
                throw new Error(res_data.data.error);
            }
            let data = res_data.data.colleges;
            setListOfColleges({ list: data });
            setLoading(true);
            console.log("fetching data_recommended: ", res_data)
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

    async function getListOfStates() {
        try {
            const res_data = await axios.get(`${Constants.port}/colleges/states`);
            if (res_data.status !== 200) {
                throw new Error(res_data.data.error);
            }
            console.log("fetching data-college-states: ", res_data)
            let newlist = []
            for (var i = 0; i < res_data.data.states.length; i++) {
                const x = {
                    value: i,
                    label: res_data.data.states[i]
                }
                newlist[i] = x;
            }
            setListOfStates({list: newlist})

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

    async function getListOfColleges() {
        try {
            const res_data = await axios.get(`${Constants.port}/colleges`);
            if (res_data.status !== 200) {
                throw new Error(res_data.data.error);
            }
            let data = res_data.data.colleges;
            setListOfColleges({ list: data });
            setRowCount(data.length)
            setLoading(true);
            return res_data;
        } catch (error) {
            if (error.response) {
                if (error.response.data.error_msg === "Authentication failed. Please login")
                    props.history.push('/login')
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

    function genereateRecommendations() {
        console.log("generating recommendations, ", listOfColleges.list)

        setLoading(false);
        getRecommColleges();
        // setTimeout(() => {
        //     setLoading(true);
        // }, 20000);
        if (hidden.similarScore)
            setHidden({ ...hidden, similarScore: false });



    }

    function applyFilters() {
        console.log("FilterInfo:", filterInfo)

        async function getFilteredColleges() {
            try {
                const res_data = await axios.post(`${Constants.port}/colleges/search`, filterInfo);
                if (res_data.status !== 200) {
                    throw new Error(res_data.data.error);
                }
                let data = res_data.data.colleges;
                setListOfColleges({ list: data });
                console.log("fetching data_filtered: ", data)
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
        getFilteredColleges();


    }

    const rowEvents = {
        onClick: (e, row, rondex) => {
            props.history.push(`/college/${row._id.replace(/ /g, "-")}`)
        },
    };

    const rowEvents_location = {
        onClick: (e, row, rowIndex) => {
            let cpy = filterInfo.location;
            cpy[rowIndex] = !cpy[rowIndex];
            setFilterInfo({ ...filterInfo, location: cpy })
        }
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

    const handleDataChange = ({ dataSize }) => {
        setRowCount(dataSize);
    }

    const handleChange_states = (newValue, actionMeta) => {
        var list = [];
        if (newValue == null) {
            setFilterInfo({ ...filterInfo, states: [] });
            return;
        }
        for (var i = 0; i < newValue.length; i++) {
            list[i] = newValue[i].label;
        }
        setFilterInfo({ ...filterInfo, states: list })
    };

    useEffect(() => {
        setLoading(false);
        getListOfColleges();
        getListOfStates();
        // setTimeout(() => {
        //     setLoading(true);
        // }, 1500);
    }, [props]);

    return (
        <div className="cardpadding">
            <Card>
                <Card.Header style={{ fontSize: "35px", paddingRight: "10px" }}>
                    <Row >
                        <p style={{ margin: "auto" }}>College Search {' '}</p>
                        <Button style={{ margin: "auto" }} variant="primary" onClick={() => genereateRecommendations()}>Generate Recommendations</Button>
                    </Row>
                </Card.Header>

                <Container style={{ paddingBottom: "50px", maxWidth: "1500px", minWidth: "1000px", paddingLeft: "35px" }}>
                    <br />
                    <Row /* style={{ paddingLeft: "35px" }} */>
                        <Col xs={3} style={{ borderStyle: "groove", paddingTop: "15px", textAlign: "center" }}>
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

                            <p style={{ textAlign: "center" }}>Admission Rate</p>
                            <Range onAfterChange={(e) => setFilterInfo({ ...filterInfo, admissionRateMin: e[0] / 100, admissionRateMax: e[1] / 100 })} allowCross={false} min={0} max={100} handle={handle} defaultValue={[0, 100]} />

                            <p style={{ textAlign: "center" }}>Ranking</p>
                            <Range onAfterChange={(e) => setFilterInfo({ ...filterInfo, rankingMin: e[0], rankingMax: e[1] })} allowCross={false} min={1} max={800} handle={handle} defaultValue={[1, 800]} />

                            <p style={{ textAlign: "center" }}>Size</p>
                            <Range onAfterChange={(e) => setFilterInfo({ ...filterInfo, sizeMin: e[0], sizeMax: e[1] })} allowCross={false} min={500} max={60000} handle={handle} defaultValue={[500, 60000]} />

                            <p style={{ textAlign: "center" }}>SAT Math</p>
                            <Range onAfterChange={(e) => setFilterInfo({ ...filterInfo, satMathMin: e[0], satMathMax: e[1] })} allowCross={false} min={200} max={800} handle={handle} defaultValue={[0, 800]} />

                            <p style={{ textAlign: "center" }}>SAT EBRW</p>
                            <Range onAfterChange={(e) => setFilterInfo({ ...filterInfo, satEBRWMin: e[0], satEBRWMax: e[1] })} allowCross={false} min={200} max={800} handle={handle} defaultValue={[0, 800]} />

                            <p style={{ textAlign: "center" }}>ACT Composite</p>
                            <Range onAfterChange={(e) => setFilterInfo({ ...filterInfo, actCompositeMin: e[0], actCompositeMax: e[1] })} allowCross={false} min={0} max={36} handle={handle} defaultValue={[0, 35]} />

                            <p style={{ textAlign: "center" }}>Cost of Attendance</p>
                            <Slider onAfterChange={(e) => setFilterInfo({ ...filterInfo, maxTuition: e })} allowCross={false} min={0} max={80000} handle={handle} defaultValue={80000} />
                            <br />
                            <Form>

                                <BootstrapTable
                                    bootstrap4
                                    striped
                                    hover
                                    condensed
                                    keyField="loc"
                                    data={Constants.locations}
                                    columns={Constants.loc_columns}
                                    selectRow={Constants.selectRow_loc}
                                    rowEvents={rowEvents_location}

                                />
                                <div style={{marginBottom:"10px"}}>
                                    <Select
                                        style={{ maxHeight: "150px", overflow: "scroll" }}
                                        isMulti
                                        onChange={handleChange_states}
                                        options={listOfStates.list}
                                        placeholder="Select any # of states"
                                    />
                                </div>
                                <Row>
                                    <Col style={{ paddingBottom: "10px" }}>
                                        <Form.Control onChange={(e) => setFilterInfo({ ...filterInfo, name: e.target.value })} placeholder="College Name" />
                                    </Col>
                                </Row>
                                <Row>
                                    <Col style={{ paddingBottom: "10px" }}>
                                        <Form.Control onChange={(e) => setFilterInfo({ ...filterInfo, major1: e.target.value })} placeholder="Major" />
                                    </Col>
                                </Row>
                                <Row>
                                    <Col style={{ paddingBottom: "10px" }}>
                                        <Form.Control onChange={(e) => setFilterInfo({ ...filterInfo, major2: e.target.value })} placeholder="Major" />
                                    </Col>
                                </Row>
                                <br />
                                <Button variant="primary" onClick={() => applyFilters()}>Apply Filters</Button>
                                <br /><br />
                                <Button variant="primary" onClick={() => setFilterInfo({
                                    strict: true, admissionRateMin: 0, admissionRateMax: 0, rankingMin: 0, rankingMax: 0,
                                    sizeMin: 0, sizeMax: 0, satMathMin: 0, satMathMax: 0, satEBRWMin: 0, satEBRWMax: 0, actCompositeMin: 0,
                                    actCompositeMax: 0, maxTuition: 0, name: "", major1: "", major2: "", location: [false, false, false, false]
                                })}>Reset Filters</Button>
                            </Form>
                            <br />


                        </Col>
                        <Col xs={9} style={{ overflowY: "scroll", maxHeight: "900px" }}>
                            <ToolkitProvider
                                bootstrap4
                                keyField='_id'
                                data={listOfColleges.list}
                                columns={columns}
                                rowEvents={rowEvents}
                                columnToggle
                            >
                                {

                                    props => (

                                        <div>
                                            <ToggleList {...props.columnToggleProps} onColumnToggle={(e, row) => toggleHidden(e, row)} />
                                            <hr />
                                            <h5>Number of Colleges:<span className="badge">{rowcount}</span></h5>
                                            {loading ?
                                                <BootstrapTable
                                                    onDataSizeChange={handleDataChange}
                                                    rowEvents={rowEvents}
                                                    defaultSorted={Constants.defaultSorted}
                                                    hover
                                                    filter={filterFactory()}

                                                    {...props.baseProps}
                                                /> : <div className="spinnerpadding">  <Spinner animation="border" role="status">
                                                    <span className="sr-only">Loading...</span>
                                                </Spinner> </div>}
                                        </div>
                                    )
                                }
                            </ToolkitProvider>
                        </Col>


                    </Row>

                </Container>
            </Card>
        </div>
    )
}