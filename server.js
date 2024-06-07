const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const url = require('url');
const uuid = require('uuid').v4;

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let clients = {};

wss.on('connection', (ws, req) => {
    const query = url.parse(req.url, true).query;
    const clientId = query.clientId;
    const port = query.port;

    if (clientId && port) {
        clients[clientId] = { ws, port };
        console.log(`Client registered: ${clientId} on port ${port}`);

        ws.on('close', () => {
            delete clients[clientId];
            console.log(`Client disconnected: ${clientId}`);
        });
    }
});

// health check
app.get('/health', (req, res) => {
    res.send('OK');
});

app.use((req, res) => {
    const hostname = req.headers.host;
    const clientId = hostname.split('.')[0] || 'p1111';

    if (clientId && clients[clientId]) {
        const targetPort = clients[clientId].port;
        const ws = clients[clientId].ws;

        const requestId =  uuid();
        delete req.headers['accept-encoding'];

        ws.send(JSON.stringify({
            id: requestId,
            port: targetPort,
            method: req.method,
            url: req.url,
            headers: req.headers,
        }));

        const handleResponse = (message) => {
            const response = JSON.parse(message);
            if (response.id !== requestId) {
                return;
            }
            ws.removeListener('message', handleResponse);
            res.writeHead(response.statusCode, response.headers);
            res.end(response.body);
            // Remove the message event listener after handling the request
        };

        ws.on('message', handleResponse);
    } else {
        res.status(404).send(`Client ${clientId} not found`);
    }
});


const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});