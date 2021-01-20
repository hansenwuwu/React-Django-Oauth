import React, { useState } from 'react';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';

import axiosApi from '../api/axiosApi';
import { useHistory } from 'react-router-dom';
import { GoogleLogin } from 'react-google-login';

const useStyles = makeStyles((theme) => ({
    paper: {
        marginTop: theme.spacing(8),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    avatar: {
        margin: theme.spacing(1),
        backgroundColor: theme.palette.secondary.main,
    },
    form: {
        width: '100%', // Fix IE 11 issue.
        marginTop: theme.spacing(1),
    },
    submit: {
        margin: theme.spacing(3, 0, 2),
    },
}));

export default function Login() {
    let history = useHistory();
    const classes = useStyles();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleUsernameChange = (event) => {
        setUsername(event.target.value);
    }

    const handlePasswordChange = (event) => {
        setPassword(event.target.value);
    }

    const handleSubmit = (event) => {
        // alert('A username and password was submitted: ' + username + " " + password);
        event.preventDefault();

        axiosApi.apiUserLogin({
            username: username,
            password: password
        }).then(res => {
            localStorage.setItem('access_token', res.data.access);
            localStorage.setItem('refresh_token', res.data.refresh);
            axiosApi.axiosInstance.defaults.headers['Authorization'] = "Bearer " + res.data.access;
            history.push('/testAuth');
        }).catch(err => {
            // console.log('login error message: ', err);
            console.log('login fail!');
        });

    }

    const responseGoogle = async (response) => {
        let googleResponse = await axiosApi.googleLogin(response.accessToken);
        console.log('googleResponse: \n', googleResponse);

        if (googleResponse.status === 200) {
            localStorage.setItem('access_token', googleResponse.data.access_token);
            localStorage.setItem('refresh_token', googleResponse.data.refresh_token);
            axiosApi.axiosInstance.defaults.headers['Authorization'] = "Bearer " + googleResponse.data.access_token;
            history.push('/testAuth');
        }

    }

    return (
        <Container component="main" maxWidth="xs">
            <CssBaseline />
            <div className={classes.paper}>
                <Avatar className={classes.avatar}>
                    <LockOutlinedIcon />
                </Avatar>
                <Typography component="h1" variant="h5">
                    Sign in
                </Typography>
                <form className={classes.form} noValidate onSubmit={handleSubmit}>
                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        id="email"
                        label="Username"
                        name="email"
                        autoComplete="email"
                        autoFocus
                        onChange={handleUsernameChange}
                    />
                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Password"
                        type="password"
                        id="password"
                        autoComplete="current-password"
                        onChange={handlePasswordChange}
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="primary"
                        className={classes.submit}
                    >
                        Sign In
                    </Button>
                </form>

                <GoogleLogin
                    clientId="825125488667-64c1nnp90qase1f6s1okgc2glq8vc84j.apps.googleusercontent.com"
                    buttonText="Login"
                    onSuccess={responseGoogle}
                    onFailure={responseGoogle}
                    cookiePolicy={'single_host_origin'}
                />

            </div>
        </Container>
    );
}