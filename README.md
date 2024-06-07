# Node.js WebSocket HTTP Proxy

This project demonstrates a Node.js-based WebSocket HTTP proxy, similar to ngrok, which forwards HTTP requests from a public server to a local server using WebSocket connections.

## Features

- **WebSocket Communication**: Establishes a WebSocket connection between the public server and local clients.
- **HTTP Proxying**: Forwards HTTP requests from the public server to the local server.
- **UUID-Based Request Handling**: Ensures that each request-response cycle is handled uniquely.
- **Error Handling**: Prevents content decoding issues by managing `accept-encoding` headers.

## Requirements

- Node.js (v12 or later)
- NPM (Node Package Manager)

## Installation

1. Clone the repository:

```bash
npm install
```

## How to forward

```bash
node client 3000 tindrrrr
```