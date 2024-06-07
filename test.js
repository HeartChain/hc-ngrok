const request = require('request');

request('http://localhost:3000', (error, response, body) => {
    if (error) {
        console.error('Error:', error);
        return;
    }
    console.log('Server responded with:', body);
})