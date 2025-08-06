const mongoose = require('mongoose');

class DatabaseConfig {
  constructor() {
    this.connectionString = process.env.MONGODB_URI;
    this.options = this.getConnectionOptions();
  }

  getConnectionOptions() {
    return {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferCommands: false
    };
  }

  async connect() {
    try {
      if (!this.connectionString) {
        throw new Error('MONGODB_URI is not defined in environment variables');
      }

      await mongoose.connect(this.connectionString, this.options);
      console.log('✅ MongoDB connected successfully');
      
      mongoose.connection.on('error', (error) => {
        console.error('❌ MongoDB connection error:', error);
      });

      mongoose.connection.on('disconnected', () => {
        console.log('⚠️  MongoDB disconnected');
      });

      process.on('SIGINT', async () => {
        try {
          await mongoose.connection.close();
          console.log('📶 MongoDB connection closed through app termination');
          process.exit(0);
        } catch (error) {
          console.error('Error closing MongoDB connection:', error);
          process.exit(1);
        }
      });

    } catch (error) {
      console.error('❌ MongoDB connection failed:', error.message);
      process.exit(1);
    }
  }

  async disconnect() {
    try {
      await mongoose.connection.close();
      console.log('MongoDB disconnected successfully');
    } catch (error) {
      console.error('Error disconnecting from MongoDB:', error);
      throw error;
    }
  }

  getConnectionStatus() {
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    
    return {
      status: states[mongoose.connection.readyState],
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      name: mongoose.connection.name
    };
  }

  async healthCheck() {
    try {
      await mongoose.connection.db.admin().ping();
      return {
        status: 'healthy',
        timestamp: new Date(),
        ...this.getConnectionStatus()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date()
      };
    }
  }
}

module.exports = new DatabaseConfig();