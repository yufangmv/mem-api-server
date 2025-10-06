# MemMachine API UI

A modern, reactive web interface for testing MemMachine memory system APIs.

## Features

- 🎨 **Modern UI**: Clean, responsive design with Alpine.js reactivity
- 🔧 **Complete API Coverage**: All MemMachine endpoints supported
- 🛡️ **CORS Handling**: Built-in proxy server to handle cross-origin requests
- ⚡ **Real-time Updates**: Live status monitoring and response display
- 🔒 **Safety Features**: Confirmation dialogs for destructive operations

## Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm (comes with Node.js)
- MemMachine API server running on `https://localhost:8000`

### Installation & Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the server:**
   ```bash
   npm start
   ```
   
   Or use the convenience script:
   ```bash
   ./start.sh
   ```

3. **Open your browser:**
   Navigate to `http://localhost:3000`

## API Endpoints Supported

### Memory Management
- **Add Memory**: Create new memory episodes
- **Search Memories**: Search both episodic and profile memories
- **Delete Session Data**: Remove all data for a session

### Session Management
- **Get All Sessions**: Retrieve all available sessions
- **Filter Sessions**: Get sessions by user, group, or agent

### MCP Server APIs
- All MCP endpoints are proxied through the server

## Configuration

### Changing API Base URL

Edit the `DEFAULT_API_BASE` constant in `server.js`:

```javascript
const DEFAULT_API_BASE = 'https://your-api-server.com/v1';
```

### Environment Variables

You can also set the port via environment variable:

```bash
PORT=8080 npm start
```

## Development

### File Structure

```
ui-for-security/
├── index.html          # Main UI with Alpine.js
├── server.js           # Express.js server with API proxy
├── package.json        # Dependencies and scripts
├── start.sh           # Convenience startup script
└── README.md          # This file
```

### Scripts

- `npm start` - Start the production server
- `npm run dev` - Start with nodemon for development (auto-restart)

### Adding New Features

The UI uses Alpine.js for reactivity. Key patterns:

- **Data binding**: `x-model="variableName"`
- **Event handling**: `@click="methodName()"`
- **Conditional display**: `x-show="condition"`
- **Dynamic classes**: `:class="dynamicClass"`

## Troubleshooting

### Common Issues

1. **"Connection refused" error**
   - Ensure your MemMachine API server is running
   - Check the API base URL in the configuration

2. **CORS errors**
   - The proxy server handles CORS automatically
   - Make sure you're accessing the UI through the proxy (port 3000)

3. **Port already in use**
   - Change the port: `PORT=8080 npm start`
   - Or kill the process using port 3000

### Server Status

The UI includes a server status indicator that shows:
- ✅ **Connected**: Server is running and accessible
- ❌ **Disconnected**: Server is down or unreachable

## Security Notes

- This UI is designed for development and testing
- The proxy server handles authentication headers
- All API requests go through the proxy to avoid CORS issues
- Delete operations require confirmation

## License

MIT License - feel free to modify and distribute.
