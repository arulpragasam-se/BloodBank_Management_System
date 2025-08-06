const morgan = require('morgan');
const fs = require('fs');
const path = require('path');

class LoggingMiddleware {
  constructor() {
    this.logDirectory = path.join(process.cwd(), 'logs');
    this.ensureLogDirectory();
  }

  ensureLogDirectory() {
    if (!fs.existsSync(this.logDirectory)) {
      fs.mkdirSync(this.logDirectory, { recursive: true });
    }
  }

  // Create write streams for different log files
  createLogStream(filename) {
    return fs.createWriteStream(
      path.join(this.logDirectory, filename),
      { flags: 'a' }
    );
  }

  // Custom token for user information
  setupCustomTokens() {
    morgan.token('user', (req) => {
      return req.user ? req.user.userId : 'anonymous';
    });

    morgan.token('user-role', (req) => {
      return req.user ? req.user.role : 'unauthenticated';
    });

    morgan.token('real-ip', (req) => {
      return req.headers['x-forwarded-for'] || 
             req.headers['x-real-ip'] || 
             req.connection.remoteAddress || 
             req.ip;
    });

    morgan.token('request-id', (req) => {
      return req.id || 'no-id';
    });

    morgan.token('response-time-ms', (req, res) => {
      const responseTime = res.getHeader('X-Response-Time');
      return responseTime ? `${responseTime}ms` : '-';
    });

    morgan.token('memory-usage', () => {
      const used = process.memoryUsage();
      return `${Math.round(used.rss / 1024 / 1024 * 100) / 100}MB`;
    });
  }

  // Development logging format
  development() {
    this.setupCustomTokens();
    
    return morgan(
      ':method :url :status :res[content-length] - :response-time ms :user (:user-role)',
      {
        stream: process.stdout
      }
    );
  }

  // Production logging format
  production() {
    this.setupCustomTokens();
    
    const logStream = this.createLogStream('access.log');
    
    return morgan(
      ':remote-addr - :user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time :user-role',
      {
        stream: logStream
      }
    );
  }

  // Error logging
  error() {
    const errorStream = this.createLogStream('error.log');
    
    return morgan(
      ':remote-addr - :user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"',
      {
        stream: errorStream,
        skip: (req, res) => res.statusCode < 400
      }
    );
  }

  // Authentication logging
  auth() {
    const authStream = this.createLogStream('auth.log');
    
    this.setupCustomTokens();
    
    return morgan(
      ':real-ip - :user [:date[clf]] ":method :url" :status :user-role',
      {
        stream: authStream,
        skip: (req) => !req.path.includes('/auth')
      }
    );
  }

  // Admin action logging
  admin() {
    const adminStream = this.createLogStream('admin.log');
    
    this.setupCustomTokens();
    
    return morgan(
      ':real-ip - :user [:date[clf]] ":method :url" :status :res[content-length] :response-time',
      {
        stream: adminStream,
        skip: (req) => req.user?.role !== 'admin'
      }
    );
  }

  // API usage logging
  api() {
    const apiStream = this.createLogStream('api.log');
    
    this.setupCustomTokens();
    
    return morgan(
      ':date[iso] :real-ip :method :url :status :response-time :user :user-role :memory-usage',
      {
        stream: apiStream,
        skip: (req) => !req.path.includes('/api')
      }
    );
  }

  // Security logging for sensitive operations
  security() {
    const securityStream = this.createLogStream('security.log');
    
    this.setupCustomTokens();
    
    return morgan(
      ':date[iso] SECURITY :real-ip :user (:user-role) :method :url :status ":user-agent"',
      {
        stream: securityStream,
        skip: (req) => {
          const sensitiveEndpoints = [
            '/auth/login',
            '/auth/register',
            '/auth/forgot-password',
            '/auth/reset-password',
            '/auth/change-password'
          ];
          return !sensitiveEndpoints.some(endpoint => req.path.includes(endpoint));
        }
      }
    );
  }

  // Blood bank specific operations logging
  bloodBank() {
    const bloodBankStream = this.createLogStream('blood-bank.log');
    
    this.setupCustomTokens();
    
    return morgan(
      ':date[iso] BLOOD_BANK :user (:user-role) :method :url :status',
      {
        stream: bloodBankStream,
        skip: (req) => {
          const bloodBankEndpoints = [
            '/inventory',
            '/donors',
            '/campaigns',
            '/blood-request',
            '/recipients'
          ];
          return !bloodBankEndpoints.some(endpoint => req.path.includes(endpoint));
        }
      }
    );
  }

  // Performance monitoring
  performance() {
    const perfStream = this.createLogStream('performance.log');
    
    this.setupCustomTokens();
    
    return morgan(
      ':date[iso] PERF :method :url :status :response-time :memory-usage :res[content-length]',
      {
        stream: perfStream,
        skip: (req, res) => {
          // Log only slow requests (>1000ms) or large responses (>1MB)
          const responseTime = parseFloat(res.getHeader('X-Response-Time')) || 0;
          const contentLength = parseInt(res.getHeader('content-length')) || 0;
          return responseTime < 1000 && contentLength < 1024 * 1024;
        }
      }
    );
  }

  // Custom request logger with additional context
  custom(options = {}) {
    const {
      filename = 'custom.log',
      format = ':method :url :status :response-time',
      skip = () => false
    } = options;
    
    const customStream = this.createLogStream(filename);
    this.setupCustomTokens();
    
    return morgan(format, {
      stream: customStream,
      skip
    });
  }

  // Combined logging for production
  combined() {
    return [
      this.production(),
      this.error(),
      this.auth(),
      this.security(),
      this.bloodBank()
    ];
  }

  // Log rotation helper
  rotateLog(filename, maxSize = 10 * 1024 * 1024) { // 10MB default
    const logPath = path.join(this.logDirectory, filename);
    
    try {
      const stats = fs.statSync(logPath);
      
      if (stats.size > maxSize) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupPath = path.join(
          this.logDirectory,
          `${filename}.${timestamp}.backup`
        );
        
        fs.renameSync(logPath, backupPath);
        console.log(`Log rotated: ${filename} -> ${path.basename(backupPath)}`);
      }
    } catch (error) {
      // File doesn't exist or other error, continue normally
    }
  }

  // Clean old log files
  cleanOldLogs(daysToKeep = 30) {
    try {
      const files = fs.readdirSync(this.logDirectory);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
      
      files.forEach(file => {
        const filePath = path.join(this.logDirectory, file);
        const stats = fs.statSync(filePath);
        
        if (stats.mtime < cutoffDate && file.includes('.backup')) {
          fs.unlinkSync(filePath);
          console.log(`Cleaned old log file: ${file}`);
        }
      });
    } catch (error) {
      console.error('Error cleaning old logs:', error.message);
    }
  }

  // Request ID middleware
  requestId(req, res, next) {
    const requestId = req.headers['x-request-id'] || 
                     `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    req.id = requestId;
    res.setHeader('X-Request-ID', requestId);
    next();
  }

  // Response time middleware
  responseTime(req, res, next) {
    const start = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - start;
      res.setHeader('X-Response-Time', duration);
    });
    
    next();
  }

  // Initialize log rotation scheduler
  initLogRotation() {
    // Rotate logs daily at midnight
    const scheduleRotation = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      const msUntilMidnight = tomorrow.getTime() - now.getTime();
      
      setTimeout(() => {
        this.rotateLog('access.log');
        this.rotateLog('error.log');
        this.rotateLog('auth.log');
        this.rotateLog('admin.log');
        this.rotateLog('api.log');
        this.rotateLog('security.log');
        this.rotateLog('blood-bank.log');
        this.rotateLog('performance.log');
        
        this.cleanOldLogs();
        
        // Schedule next rotation
        scheduleRotation();
      }, msUntilMidnight);
    };
    
    scheduleRotation();
  }
}

module.exports = new LoggingMiddleware();