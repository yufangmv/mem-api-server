const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Default API base URL
const DEFAULT_API_BASE = 'http://127.0.0.1:8080/v1';

// Proxy function to handle API requests
async function proxyRequest(req, res, endpoint) {
    try {
        const apiBase = DEFAULT_API_BASE;
        const url = `${apiBase}${endpoint}`;
        const contentType = req.body.contentType || 'application/json';
        
        const config = {
            method: req.method,
            url: url,
            headers: {
                'Content-Type': contentType,
            },
            timeout: 30000, // 30 second timeout
            maxRedirects: 0, // Disable redirects
        };

        if (req.method !== 'GET' && req.body.data) {
            // Handle different content types
            if (contentType === 'application/json') {
                // For JSON content type, check if it's already parsed or needs parsing
                if (typeof req.body.data === 'string') {
                    try {
                        config.data = JSON.parse(req.body.data);
                    } catch (e) {
                        // If parsing fails, treat as raw string
                        config.data = req.body.data;
                    }
                } else {
                    // Already parsed JSON object, clean it
                    const cleanPayload = { ...req.body.data };
                    if (cleanPayload.apiBase) {
                        console.warn('Warning: apiBase should not be sent in the request body. It is used only for proxying. So it will be removed.');
                        delete cleanPayload.apiBase;
                    }
                    if (cleanPayload.contentType) {
                        console.warn('Warning: contentType should not be sent in the request body. It is used only for proxying. So it will be removed.');
                        delete cleanPayload.contentType;
                    }
                    config.data = cleanPayload;
                }
            } else {
                // For non-JSON content types, send as raw data
                config.data = typeof req.body.data === 'string' ? req.body.data : JSON.stringify(req.body.data);
            }
        }

        console.info('------request+url:', req.method, req.originalUrl, '->', url);
        console.info('Request headers:', config.headers);
        if (config.data) {
            console.info('Request payload:', config.data);
        } else {
            console.info('No request payload');
        }

        const response = await axios(config);
        if (response.data === null) {
            res.status(response.status).json({ message: 'No content' });
        } else {
            res.status(response.status).json(response.data);
        }

        console.info('Response status:', response.status);
    } catch (error) {

        if (error.response) {
            res.status(error.response.status).json({
                error: error.response.data || error.message,
                status: error.response.status
            });
        } else if (error.code === 'ECONNREFUSED') {
            res.status(503).json({
                error: 'Connection refused. Please check if the MemMachine API server is running.',
                status: 503
            });
        } else {
            res.status(500).json({
                error: error.message,
                status: 500
            });
        }

        // Log error in red color
        const red = '\x1b[31m';
        const reset = '\x1b[0m';
        console.error(`${red}API Proxy Error:`, error.message, `${reset}`, "\n");
    }
}

// API Proxy Routes
app.post('/api/memories', (req, res) => {
    proxyRequest(req, res, '/memories');
});

app.delete('/api/memories', (req, res) => {
    proxyRequest(req, res, '/memories');
});

app.post('/api/memories/search', (req, res) => {
    proxyRequest(req, res, '/memories/search');
});

app.post('/api/memories/episodic', (req, res) => {
    proxyRequest(req, res, '/memories/episodic');
});

app.get('/api/sessions', (req, res) => {
    proxyRequest(req, res, '/sessions');
});

app.get('/api/users/:userId/sessions', (req, res) => {
    proxyRequest(req, res, `/users/${req.params.userId}/sessions`);
});

app.get('/api/groups/:groupId/sessions', (req, res) => {
    proxyRequest(req, res, `/groups/${req.params.groupId}/sessions`);
});

app.get('/api/agents/:agentId/sessions', (req, res) => {
    proxyRequest(req, res, `/agents/${req.params.agentId}/sessions`);
});

// MCP API Routes
app.post('/api/mcp/add_session_memory', (req, res) => {
    proxyRequest(req, res, '/mcp/add_session_memory');
});

app.post('/api/mcp/search_session_memory', (req, res) => {
    proxyRequest(req, res, '/mcp/search_session_memory');
});

app.post('/api/mcp/delete_session_data', (req, res) => {
    proxyRequest(req, res, '/mcp/delete_session_data');
});

app.post('/api/mcp/delete_data', (req, res) => {
    proxyRequest(req, res, '/mcp/delete_data');
});

app.get('/api/mcp/sessions', (req, res) => {
    proxyRequest(req, res, '/mcp/sessions');
});

app.get('/api/mcp/users/:userId/sessions', (req, res) => {
    proxyRequest(req, res, `/mcp/users/${req.params.userId}/sessions`);
});

app.get('/api/mcp/groups/:groupId/sessions', (req, res) => {
    proxyRequest(req, res, `/mcp/groups/${req.params.groupId}/sessions`);
});

app.get('/api/mcp/agents/:agentId/sessions', (req, res) => {
    proxyRequest(req, res, `/mcp/agents/${req.params.agentId}/sessions`);
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        message: 'MemMachine UI Server is running',
        timestamp: new Date().toISOString()
    });
});

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Other not matching cases
app.all('*', (req, res) => {
    const blue = '\x1b[34m';
    const reset = '\x1b[0m';
    console.warn(`${blue}***Unsupported request+url:`, req.method, req.originalUrl, `${reset}`);
    proxyRequest(req, res, req.originalUrl);
});

app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        const red = '\x1b[31m';
        const reset = '\x1b[0m';
        console.error(`${red}\n===Invalid JSON received:${reset}`);
        console.error(`${red}Method:${reset}`, req.method);
        console.error(`${red}URL:${reset}`, req.originalUrl);
        console.error(`${red}Body:${reset}`, err.message,'\n');
        res.status(400).json({ error: 'Invalid JSON in request body', detail: err.message });
    } else if (err instanceof URIError) {
        const red = '\x1b[31m';
        const reset = '\x1b[0m';
        console.error(`${red}\n===Malformed URL received:${reset}`);
        console.error(`${red}Method:${reset}`, req.method);
        console.error(`${red}URL:${reset}`, req.originalUrl, '\n');
        console.error(`${red}Body:${reset}`, err.message,'\n');
        res.status(400).json({ error: 'Malformed URL', detail: err.message });
    } else {
        next(err);
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 MemMachine UI Server running on http://localhost:${PORT}`);
    console.log(`📡 API Proxy configured for: ${DEFAULT_API_BASE}`);
    console.log(`🔧 To change API base URL, update DEFAULT_API_BASE in server.js`);
});

module.exports = app;
