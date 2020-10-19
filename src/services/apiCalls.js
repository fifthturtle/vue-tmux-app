// jshint esversion:8

import axios from 'axios';

//const baseURL = "http://dev3.boolean.tv/tmux_monitor/";
//const baseURL = "10.224.8.22:8061";
const baseURL = window.location.href;

const client = axios.create({
    baseURL,
    withCredentials: false
});


export default {
    async get(path) {
        return await client.get(path)
            .then(res => {
                return res.data;
            })
            .catch(err => {
                return err;
            });
    },
    async headers(path, params) {
        console.log({
            params
        });
        return await client.get(path, {
                params
            })
            .then(res => {
                return res.data;
            })
            .catch(err => {
                console.log("ERROR", err);
            });
    }
};