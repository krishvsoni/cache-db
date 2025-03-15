const http = require('http');
const { URL } = require('url');
const cacheDB = require('./Release/cache_db.node');
const winston = require('winston');

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp(),
        winston.format.simple()
    ),
    transports: [
        new winston.transports.Console({ format: winston.format.simple() })
    ]
});

const setCacheData = (db, key, value, ttl, persistenceOption = null) => {
    try {
        logger.info(`Setting cache for ${db}:${key} with TTL: ${ttl} and Persistence: ${persistenceOption}`);
        cacheDB.setCache(`${db}:${key}`, value, ttl, persistenceOption);
        logger.info(`Cache set for ${db}:${key}`);
    } catch (error) {
        logger.error(`Error setting cache for ${db}:${key} - ${error.message}`);
        throw error;
    }
};

const getCacheData = (db, key, query = null) => {
    try {
        logger.info(`Getting cache for ${db}:${key} with query: ${query}`);
        const value = cacheDB.getCache(`${db}:${key}`, query);
        logger.info(`Cache value for ${db}:${key}: ${value}`);
        if (value === "Key has expired" || value === "Key not found") {
            logger.warn(`Cache miss for ${db}:${key}`);
        }
        return value;
    } catch (error) {
        logger.error(`Error getting cache for ${db}:${key} - ${error.message}`);
        throw error;
    }
};

const server = http.createServer((req, res) => {
    const { method, url } = req;
    const parsedUrl = new URL(url, `http://${req.headers.host}`);
    const pathname = parsedUrl.pathname.split('/').filter(Boolean);

    logger.info(`Request URL: ${url}`);
    logger.info(`Parsed pathname: ${pathname}`);

    if (pathname.length < 1) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify({ message: 'Database name is required in the URL path' }));
    }

    const dbName = pathname[0];
    const action = pathname[1];

    if (action === 'set' && method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk;
        });

        req.on('end', () => {
            try {
                const { key, value, ttl, persistence } = JSON.parse(body);
                if (key && value && ttl) {
                    setCacheData(dbName, key, value, ttl, persistence);
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ message: 'Cache set successfully!' }));
                } else {
                    res.statusCode = 400;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ message: 'Missing required parameters: key, value, ttl' }));
                }
            } catch (error) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ message: 'Invalid JSON format' }));
            }
        });
    } else if (action === 'get' && method === 'GET') {
        const key = parsedUrl.searchParams.get('key');
        const query = parsedUrl.searchParams.get('query');

        if (key) {
            try {
                const value = getCacheData(dbName, key, query);
                if (value === "Key has expired" || value === "Key not found") {
                    res.statusCode = 404;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ message: value }));
                } else {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ key, value }));
                }
            } catch (error) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ message: 'Internal Server Error' }));
            }
        } else {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ message: 'Key is required' }));
        }
    } else {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ message: 'Not Found' }));
    }
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
    logger.info(`Server running on http://localhost:${port}`);
});

process.on('SIGINT', () => {
    logger.info('Server shutting down gracefully...');
    server.close(() => {
        logger.info('Server shutdown complete');
        process.exit(0);
    });
});
