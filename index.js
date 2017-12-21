'user strict';

const express = require('express')
path = require('path'),
PORT = process.env.PORT || 5000,
bodyParser = require('body-parser'),
app = express().use(bodyParser.json());

const request = require('request');


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.listen(PORT, () => console.log(`Listening on ${PORT}`));

app.get('/', function (req, res) {
    res.send("Hi I am a chat bot")
});

app.post('/webhook/', (req, res) => {
    console.log("req", req.body);
    if (req.body.object === "page") {
        req.body.entry.forEach(function (entry) {
            entry.messaging.forEach(function (event) {
				console.log("event",event);
                if (event.postback) {
                    processPostback(event);
                }

            });
        });
        res.sendStatus(200)
    }
});

function processPostback(event) {
    var senderId = event.sender.id;
    var payLoad = event.postback.payload;
    console.log("pLoad",payLoad);
    if (payLoad === "Greeting") {

        request({
            url: "https://graph.facebook.com/v2.6/" + senderId,
            qs: {
                access_token: process.env.PAGE_ACCESS_TOKEN,
                fields: "first_name"
            },
            method: "GET"
        }, function (error, response, body) {
            var greeting = "";
            if (error) {
                console.log("Error getting user's name " + error);
            } else {
                var bodyObj = JSON.parse(body);
                name = bodyObj.first_name;
                greeting = "Hi" + " " + name + ".";
            }

            var message = greeting + " Let me tell you a joke today.";
            sendMessage(senderId, { text: message });

        });
    }
}

function sendMessage(recipientId, message) {

    request({
        url: "https://graph.facebook.com/v2.6/me/messages",
        qs: { access_token: process.env.PAGE_ACCESS_TOKEN },
        method: "POST",
        json: {
            recipient: { id: recipient },
            message: message,
        }
    }, function (error, response, body) {
        if (error) {
            console.log("Error", response.error);
        }
    });
}


app.get('/webhook/', (req, res) => {

    let VERIFY_TOKEN = "ShrimpMantis"

    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];

    if (mode && token) {

        if (mode === "subscribe" && token == VERIFY_TOKEN) {

            console.log("WEBHOOK_VERIFIED");
            res.status(200).send(challenge);
        }
        else {

            res.sendStatus(403);
        }
    }
});

