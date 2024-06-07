const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const httpProxy = require('http-proxy');
const url = require('url');

const app = express();
const proxy = httpProxy.createProxyServer({});
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

app.use((req, res) => {
    const hostname = req.headers.host;
    const clientId = hostname.split('.')[0] || 'p1111';


    if (clientId && clients[clientId]) {
        const targetPort = clients[clientId].port;
        proxy.web(req, res, { target: `http://localhost:${targetPort}` });
    } else {
        res.status(404).send(`Client ${clientId} not found`);
    }
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});