const http = require('http');
const WebSocket = require('ws');

class IOSLogServer {
  constructor() {
    this.logs = [];
    this.maxLogs = 500; // Keep last 500 log entries
    this.isConnected = false;
    this.ws = null;
    this.reconnectInterval = null;
  }

  addLog(level, message) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${level}] ${message}`;

    this.logs.push(logEntry);

    // Keep only the last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    console.log(logEntry);
  }

  async getDebugTarget() {
    return new Promise((resolve, reject) => {
      const req = http.get('http://localhost:9221/json', (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const targets = JSON.parse(data);
            if (targets.length === 0) {
              reject(new Error('No debugging targets found'));
              return;
            }
            resolve(targets[0]);
          } catch (e) {
            reject(e);
          }
        });
      });

      req.on('error', reject);
      req.setTimeout(5000, () => {
        req.destroy();
        reject(new Error('Timeout connecting to ios_webkit_debug_proxy'));
      });
    });
  }

  connectToSafari() {
    this.addLog('INFO', 'Attempting to connect to Safari Web Inspector...');

    this.getDebugTarget()
      .then(target => {
        this.addLog('INFO', `Found target: ${target.title}`);

        if (this.ws) {
          this.ws.close();
        }

        this.ws = new WebSocket(target.webSocketDebuggerUrl);

        this.ws.on('open', () => {
          this.addLog('INFO', 'Connected to Safari Web Inspector');
          this.isConnected = true;

          // Enable runtime and console domains
          this.ws.send(JSON.stringify({id: 1, method: 'Runtime.enable'}));
          this.ws.send(JSON.stringify({id: 2, method: 'Console.enable'}));

          // Clear reconnect interval if connection is successful
          if (this.reconnectInterval) {
            clearInterval(this.reconnectInterval);
            this.reconnectInterval = null;
          }
        });

        this.ws.on('message', (data) => {
          try {
            const message = JSON.parse(data);

            // Handle Runtime.consoleAPICalled (console.log, console.error, etc.)
            if (message.method === 'Runtime.consoleAPICalled') {
              const {type, args} = message.params;
              const values = args.map(arg => {
                if (arg.value !== undefined) return arg.value;
                if (arg.description !== undefined) return arg.description;
                if (arg.unserializableValue !== undefined) return arg.unserializableValue;
                return JSON.stringify(arg);
              }).join(' ');

              this.addLog(type.toUpperCase(), values);
            }

            // Handle Console.messageAdded
            if (message.method === 'Console.messageAdded') {
              const {level, text} = message.params.message;
              this.addLog(level.toUpperCase(), text);
            }

            // Handle Runtime errors
            if (message.method === 'Runtime.exceptionThrown') {
              const exception = message.params.exceptionDetails;
              this.addLog('ERROR', `${exception.text}: ${exception.exception?.description || ''}`);
            }
          } catch (e) {
            this.addLog('ERROR', `Failed to parse WebSocket message: ${e.message}`);
          }
        });

        this.ws.on('error', (error) => {
          this.addLog('ERROR', `WebSocket error: ${error.message}`);
          this.isConnected = false;
          this.scheduleReconnect();
        });

        this.ws.on('close', () => {
          this.addLog('WARN', 'WebSocket connection closed');
          this.isConnected = false;
          this.scheduleReconnect();
        });
      })
      .catch(error => {
        this.addLog('ERROR', `Failed to connect: ${error.message}`);
        this.scheduleReconnect();
      });
  }

  scheduleReconnect() {
    if (this.reconnectInterval) return;

    this.addLog('INFO', 'Scheduling reconnect in 5 seconds...');
    this.reconnectInterval = setInterval(() => {
      this.connectToSafari();
    }, 5000);
  }

  startServer() {
    const server = http.createServer((req, res) => {
      // Set CORS headers
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

      if (req.method === 'GET' && req.url === '/api/logs') {
        res.writeHead(200, { 'Content-Type': 'text/plain' });

        if (this.logs.length === 0) {
          res.end('No logs available yet.\n\nMake sure:\n1. ios_webkit_debug_proxy is running on port 9221\n2. Your iOS app is running in simulator\n3. Safari Web Inspector is enabled\n');
        } else {
          res.end(this.logs.join('\n') + '\n');
        }
      } else if (req.method === 'GET' && req.url === '/api/status') {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end(`Status: ${this.isConnected ? 'Connected' : 'Disconnected'}\nLogs collected: ${this.logs.length}\n`);
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Available endpoints:\n/api/logs - Get collected console logs\n/api/status - Get connection status\n');
      }
    });

    const PORT = 9220;
    server.listen(PORT, () => {
      console.log(`iOS Log Server started on http://localhost:${PORT}`);
      console.log('Available endpoints:');
      console.log(`  http://localhost:${PORT}/api/logs - Get logs`);
      console.log(`  http://localhost:${PORT}/api/status - Get status`);
      console.log('');

      // Start connecting to Safari
      this.connectToSafari();
    });

    // Graceful shutdown
    process.on('SIGINT', () => {
      console.log('\nShutting down server...');
      if (this.ws) {
        this.ws.close();
      }
      if (this.reconnectInterval) {
        clearInterval(this.reconnectInterval);
      }
      server.close(() => {
        console.log('Server closed.');
        process.exit(0);
      });
    });
  }
}

// Start the server
const logServer = new IOSLogServer();
logServer.startServer();
