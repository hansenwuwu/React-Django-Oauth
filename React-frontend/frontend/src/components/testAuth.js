import React, { useState, useEffect } from 'react'
import axiosApi from '../api/axiosApi';

function TestAuth() {

    const [message, setMessage] = useState("");

    useEffect(() => {
        axiosApi.getHello().then(res => {
            console.log(res.data);
            setMessage(res.data.hello);
        }).catch(err => {
            console.log(err);
        });
    }, [])

    return (
        <div>
            {message}
        </div>
    )
}

export default TestAuth
