const WebSocket = require('ws');
const http = require('http');

const localPort = process.argv[2];
const clientId = process.argv[3] || '1111';

const serverUrl = `wss://p${clientId}.you2.travel?clientId=${clientId}&port=${localPort}`; // Unique ID for the tunnel

const ws = new WebSocket(serverUrl);

// When WebSocket connection is open
ws.on('open', () => {
    console.log('WebSocket connection established');
});

// When WebSocket connection receives a message
ws.on('message', (message) => {
    const requestDetails = JSON.parse(message);
    const id = requestDetails.id;
    const options = {
        hostname: 'localhost',
        port: localPort,
        path: requestDetails.url,
        method: requestDetails.method,
        headers: requestDetails.headers
    };

    // Forward the request to the local server
    const proxyReq = http.request(options, (proxyRes) => {
        let body = '';
        proxyRes.on('data', (chunk) => {
            body += chunk;
        });

        proxyRes.on('end', () => {
            const response = {
                id,
                statusCode: proxyRes.statusCode,
                headers: proxyRes.headers,
                body: body
            };
            console.log(response);
            // Send the response back through WebSocket
            ws.send(JSON.stringify(response));
        });
    });

    proxyReq.on('error', (e) => {
        const errorResponse = {
            id,
            statusCode: 500,
            headers: {},
            body: `Proxy request error: ${e.message}`
        };
        ws.send(JSON.stringify(errorResponse));
    });

    proxyReq.end();
});

// When WebSocket connection is closed
ws.on('close', () => {
    console.log('WebSocket connection closed');
});