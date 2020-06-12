import React, { useState, useEffect } from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import axios from 'axios';
import * as Constants from './../../constants/constants.js'
import { Col, Spinner, Card } from 'react-bootstrap';
axios.defaults.withCredentials = true

export default function AllProfilesScreen(props) {
    const [listOfProfiles, setListOfProfiles] = useState({list: [], set: false});
    const [loading, setLoading] = useState(true);

    async function getListOfProfiles() {
        try{
            const res_data = await axios.get(`${Constants.port}/students`);
            if(res_data.status !== 200){
                throw new Error(res_data.data.error);
            }
            let data = res_data.data.students;
            setListOfProfiles({list: data});
            setLoading(true);
            console.log('fetching data',data);
            return res_data;
        }catch(error)
        {
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
        getListOfProfiles();

      },[ props] );

      const rowEvents = {
        onClick: (e, row, rowIndex) => {
            // '/ /g' replaces all spaces with underscores for url
            props.history.push(`/students/${row.userid}`)
        },
    };

    return (
        <div className="cardpadding">
            <Card >
            
              <Card.Header style={{ fontSize: "30px" }}>  
            <h1 style={{paddingRight: "15px"}}>All Profiles</h1>
            
            </Card.Header>
            { loading ? 
            <Card.Body style={{ textAlign: "center" }}>
            
            <Col xs={9} style={{minWidth:"750px", margin:"auto", maxHeight:"600px", overflowY:"scroll"}}>
              
                <BootstrapTable
                    hover
                    bootstrap4
                    keyField='_id'
                    data={listOfProfiles.list}
                    columns={Constants.profile_columns}
                    defaultSorted={Constants.defaultSorted}
                    rowEvents={rowEvents}
                />
               
            </Col>
            </Card.Body>
             :<div className="spinnerpadding"> <Spinner animation="border" role="status">
             <span className="sr-only">Loading...</span>
           </Spinner> </div> }
            
            </Card>
        </div>
    )
}