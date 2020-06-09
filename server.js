require('dotenv').config();
const axios = require('axios');
const express = require('express');
const stripe = require('stripe')('sk_test_UQj253dJNoxIiCP4mjq2W7Pz00t51pPy3J');
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get('/', (req, res) => res.sendFile(__dirname + '/index.html'))

app.get('/checkout', (req, res) => res.sendFile(__dirname + '/checkout.html'))

app.post('/api/access-token', (req, res) => {
    axios({
        url: "https://api.sandbox.lulu.com/auth/realms/glasstree/protocol/openid-connect/token",
        method: "post",
        data: "grant_type=client_credentials",
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + process.env.AUTH_CODE
        }
    }).then(function(response) {
        res.json(response.data);
    }).catch(function(error) {
        console.log(error);
    })
});

app.post('/api/refresh-token', (req, res) => {
    const refreshToken = req.body.refresh_token;
    axios({
        url: "https://api.sandbox.lulu.com/auth/realms/glasstree/protocol/openid-connect/token",
        method: "post",
        data: "grant_type=client_credentials&refresh_token=" + refreshToken,
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": "Basic " + process.env.AUTH_CODE
        }
    }).then(function(response) {
        res.json(response.data);
    }).catch(function(error) {
        console.log(error);
    })
});

app.listen(port, () => console.log(`Listening at http://localhost:${port}`));

