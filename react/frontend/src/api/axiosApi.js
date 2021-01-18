import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'http://127.0.0.1:8000/api/',
    timeout: 5000,
    headers: {
        'Authorization': "Bearer " + localStorage.getItem('access_token'),
        'Content-Type': 'application/json',
        'accept': 'application/json',
    }
});

axiosInstance.interceptors.response.use(
    response => response,
    error => {
        const originalRequest = error.config;

        if (error.response.status === 401 && error.response.statusText === "Unauthorized") {
            const refresh_token = localStorage.getItem('refresh_token');

            return axiosInstance
                .post('/token/refresh/', { refresh: refresh_token })
                .then((response) => {

                    localStorage.setItem('access_token', response.data.access);
                    localStorage.setItem('refresh_token', response.data.refresh);

                    axiosInstance.defaults.headers['Authorization'] = "Bearer " + response.data.access;
                    originalRequest.headers['Authorization'] = "Bearer " + response.data.access;

                    return axiosInstance(originalRequest);
                })
                .catch(err => {
                    console.log(err)
                });
        }
        return Promise.reject(error);
    }
);

const apiUserLogin = (data) => {
    return axiosInstance
        .post('token/obtain/', data)
        .then((response) => {
            return response.data;
        }).catch(error => {
            return error;
        });
};

const apiUserLogout = () => {
    axiosInstance.defaults.headers['Authorization'] = "";
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
}

const googleLogin = async (accesstoken) => {
    let res = await axios.post(
        "http://localhost:8000/api/dj-rest-auth/google/",
        {
            access_token: accesstoken,
        }
    );
    // console.log('service google login res: ', res);
    return await res;
};

const getHello = () => {
    return axiosInstance
        .get('hello')
        .then((response) => {
            return response;
        }).catch(error => {
            return error;
        });
}

export default {
    axiosInstance,
    apiUserLogin,
    apiUserLogout,
    getHello,
    googleLogin
};