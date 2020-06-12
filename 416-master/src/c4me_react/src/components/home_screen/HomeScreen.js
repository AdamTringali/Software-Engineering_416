import React/* , { useState, useEffect } */ from 'react';

import axios from 'axios';
axios.defaults.withCredentials = true

export default function HomeScreen(props) {

    return (
        <div className="reset-page">
            <h1>The Walruses - C4ME</h1>
            <img style={{ margin: "auto" }}
                className="d-block w-50"
                src="https://www.kuzmaclass.org/sandbox2019/BradyOsech/Walruses/Images/dw1.png"
                alt="Second slide"
            />
        </div>
    )
}