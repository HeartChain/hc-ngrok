const WebSocket = require('ws');
const http = require('http');
const httpProxy = require('http-proxy');
const url = require('url');

// Get the local server port and client ID from the command line arguments
const localServerPort = process.argv[2];
const clientId = process.argv[3] || '1111';

if (!localServerPort || !clientId) {
    console.error('Usage: node client.js <localServerPort> <clientId>');
    process.exit(1);
}

const wsUrl = `ws://localhost:8080/?clientId=p${clientId}&port=${localServerPort}`;

// Create a WebSocket connection to the server
const ws = new WebSocket(wsUrl);

ws.on('open', () => {
    console.log(`Connected to WebSocket server as client: ${clientId}`);
});

ws.on('message', (message) => {
    console.log(`Received message: ${message}`);
});

ws.on('close', () => {
    console.log(`Disconnected from WebSocket server`);
});

ws.on('error', (error) => {
    console.error(`WebSocket error: ${error}`);
});

// Create an HTTP server to receive requests from the proxy
const proxy = httpProxy.createProxyServer({});
const server = http.createServer((req, res) => {
    proxy.web(req, res, { target: `http://localhost:${localServerPort}` });
});

server.listen(localServerPort, () => {
    console.log(`Local HTTP server is running on port ${localServerPort}`);
});