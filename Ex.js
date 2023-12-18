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
app.use(urlsanitizer);
app.use(requestLimiter);
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

// Got the idea from null Thanks bro.
// URL & Query sanitizer function.
function urlsanitizer(req, res, next) {
    // Extract query parameters and URL path from the request
    const requestQuery = req.query;
    const urlPath = req.path;
    // Iterate over each query parameter
    for (const key in requestQuery) {
        let value = requestQuery[key];
        // Check if the query parameter matches any of the defined patterns
        if (checkForPatterns(key + '=' + value)) {
            // If a pattern is matched, return a 403 Forbidden response
            return res.status(403).json({ error: 'Invalid query detected!' });
        }
    }

    // Check if the URL path matches any of the defined patterns
    if (checkForPatterns(urlPath)) {
        // If a pattern is matched in the path, return a 403 Forbidden response
        return res.status(403).json({ error: 'Invalid path detected!' });
    }

    // If no patterns are matched, continue to the next middleware
    next();
}

function checkForPatterns(str)
{
    // Define regular expression patterns to detect suspicious strings
    const pattern1 = /=([0-9]{9,})/;
    const pattern2 = /([0-9]{12,})=([0-9]{12,})/;
    const pattern3 = /[0-9]{0,18}[a-zA-Z0-9]{3}[0-9]{18}[a-zA-Z0-9]{1}/;
    const pattern4 = /\/[0-9]{10,19}/;

    // Test the string against each pattern
    return pattern1.test(str) || pattern2.test(str) || pattern3.test(str) || pattern4.test(str);
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
