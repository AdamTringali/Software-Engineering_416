import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as Constants from './../../constants/constants.js'
import { Alert } from 'react-bootstrap';


export default function ResetScreen(props) {

  const [success, setSuccess] = useState(false);
  const [failure, setFailure] = useState({ show: false, errmsg: "" });


  function resetDatabase() {
    async function resetMongoDB() {
      try {
        const res_data = await axios.post(`${Constants.port}/admin/reset`);

        if (res_data.status !== 200) {
          throw new Error("RETURNED: " + res_data.data.error);
        }
        setSuccess(true);
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
    resetMongoDB();

  }

  //  useEffect(() => {
  //      setSuccess(false);
  //  },[count]);
  return (
    <div className="reset-page"/* style={{textAlign:"-webkit-center"}} */>

      <h1>Reset Screen</h1>
      {success ?
        <Alert style={{ height: "125px", width: "300px" }} variant="success" onClose={() => setSuccess(false)} dismissible>
          <Alert.Heading>Database reset was successful</Alert.Heading>
          <p>
            Congrats
          </p>
        </Alert>

        :
        null
      }

      {failure.show ?
        <Alert style={{ height: "125px", width: "300px" }} variant="danger" onClose={() => setFailure({ show: false })} dismissible>
          <Alert.Heading>Database reset Unsuccessful!</Alert.Heading>
          <p>
            {failure.errmsg}            
          </p>
        </Alert>
        :
        null}
      {/*<button onClick={() => console.log("clearing database")}>Clear database </button>*/}
      <button onClick={() => resetDatabase()}>Reset database</button>




    </div>
  );
}