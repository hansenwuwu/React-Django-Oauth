import React, { useState, useEffect } from 'react'
import axiosApi from '../api/axiosApi';
import Button from '@material-ui/core/Button';
import { useHistory } from 'react-router-dom';

function TestAuth() {

    let history = useHistory();

    const [message, setMessage] = useState("");

    useEffect(() => {
        axiosApi.getHello().then(res => {
            console.log(res.data);
            setMessage(res.data.user);
        }).catch(err => {
            console.log(err);
            setMessage("");
        });
    }, [])

    const logout = () => {
        axiosApi.apiUserLogout();
        history.go('/testAuth');
    }

    return (
        <div>

            { message !== "" && (<div><h1>hello!</h1><h2>{message}</h2> <Button variant="contained" onClick={logout}>Logout</Button></div>)}
            { message === "" && <h1>need to sign in</h1>}

        </div>
    )
}

export default TestAuth
