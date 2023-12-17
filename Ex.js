const fs = require('fs'); 
const https = require('https');
const express = require("express");
const app = express();
const requestIp = require('request-ip');

const MAX_REQUESTS_PER_SECOND = 10;  // Limit for requests per second per IP
const MAX_CONNECTIONS_PER_IP = 3; // Limit for concurrent connections per IP
const RATE_LIMIT_TIME_MS = 60 * 1000;  // Time window for rate limiting in milliseconds
const REQUEST_STORAGE = {}; 
const CONNECTION_STORAGE = {}; 

app.use(requestIp.mw()); // You will need the to be above the requestLimiter & connectionLimiter or It can't grab ip!!!
app.use(requestLimiter)
app.use(connectionLimiter);

// Request limiting function
function requestLimiter(req, res, next) {
    const userIP = req.clientIp; // Get user's IP address
    const currentTime = Date.now(); // Get current time
    const userData = REQUEST_STORAGE[userIP]; // Get user data from storage

    // If user data doesn't exist, initialize it
    if (!userData) {
        REQUEST_STORAGE[userIP] = {
            requestTime: currentTime,
            requestCount: 1,
            blockUntil: null
        };
        return next();
    }

    // Check if user is currently blocked
    if (userData.blockUntil && currentTime < userData.blockUntil) {
        return res.status(429).json({ error: 'Rate limit exceeded. Please try again later.' });
    }

    // If within rate limit time window, increment request count
    if (currentTime - userData.requestTime < 1000) {
        userData.requestCount += 1;
        if (userData.requestCount > MAX_REQUESTS_PER_SECOND) {
            userData.blockUntil = currentTime + RATE_LIMIT_TIME_MS;
            return res.status(429).json({ error: 'Rate limit exceeded. Please try again later.' });
        }
    } else {
        // Reset count if outside time window
        userData.requestTime = currentTime;
        userData.requestCount = 1;
    }
    next();
}

// Connection limiting function
function connectionLimiter(req, res, next) {
    const userIP = req.clientIp; // Get user's IP address

    // Initialize connection count for new IP
    if (!CONNECTION_STORAGE[userIP]) {
        CONNECTION_STORAGE[userIP] = 0;
    }
    CONNECTION_STORAGE[userIP] += 1;

    // If connection count exceeds limit, return error
    if (CONNECTION_STORAGE[userIP] > MAX_CONNECTIONS_PER_IP) {
        return res.status(429).json({ error: 'Too many connections. Please complete existing requests before making new ones.' });
    }

    next();

    // Decrease connection count on response finish
    res.on('finish', () => {
        CONNECTION_STORAGE[userIP] -= 1;
        if (CONNECTION_STORAGE[userIP] === 0) {
            delete CONNECTION_STORAGE[userIP];
        }
    });
}

// I will be adding more for stuff like headers verifacation and IP Abuse rating when I fell like it.

const privateKey = fs.readFileSync('Path Here', 'utf8');
const certificate = fs.readFileSync('Path Here', 'utf8');
const credentials = { key: privateKey, cert: certificate };
const httpsServer = https.createServer(credentials, app);
httpsServer.listen(443, () => 
{
  console.log(`HTTPS Server running on port 443`);
});