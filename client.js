const WebSocket = require('ws');
const request = require('request');

const localPort = process.argv[2];
const clientId = process.argv[3] || '1111';

const serverUrl = `wss://p${clientId}.you2.travel?clientId=p${clientId}&port=${localPort}`; // Unique ID for the tunnel

const ws = new WebSocket(serverUrl);

// When WebSocket connection is open
ws.on('open', () => {
    console.log('Forwarding to ...', `https://p${clientId}.you2.travel`);
});

// When WebSocket connection receives a message
ws.on('message', (message) => {
    const requestDetails = JSON.parse(message);
    const id = requestDetails.id;
    const options = {
        url: `http://localhost:${localPort}${requestDetails.url}`,
        port: localPort,
        path: requestDetails.url,
        method: requestDetails.method,
        headers: requestDetails.headers
    };

    // Forward the request to the local server
    request(options, (error, response, body) => {
        if (error) {
            const errorResponse = {
                id,
                statusCode: 500,
                headers: {},
                body: `Proxy request error: ${error.message}`,
            };
            ws.send(JSON.stringify(errorResponse));
            return;
        }

        const resHeaders = response.headers;
        delete resHeaders['content-encoding']; // Prevent encoding issues

        const res = {
            id,
            statusCode: response.statusCode,
            headers: resHeaders,
            body: body.toString('base64') // Encode body as base64 to handle binary data
        };

        // Send the response back through WebSocket
        ws.send(JSON.stringify(res));
    });
});

// When WebSocket connection is closed
ws.on('close', () => {
    console.log('WebSocket connection closed');
});