const express = require('express');
const session = require('express-session');
const cors = require('cors');
const { env } = require('./configs/environment');
const { CONNECT_DB } = require('./configs/mongodb');
const { corsOptions } = require('./configs/cors');
const { sessionConfig } = require('./configs/session');
const { APIs_V1 } = require('./routes/v1');
const { errorHandlingMiddleware } = require('./middlewares');

const StartServer = () => {
  const app = express();

  if (env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
  }

  // Config CORS
  app.use(cors(corsOptions));

  // Enable req.body json data
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Enable session
  app.use(session(sessionConfig));

  // Import All Routes
  app.use('/v1', APIs_V1);

  // Welcome route
  app.get('/', (req, res) => {
    res.json({
      message: 'Welcome to Diabetes Prediction API',
      version: '1.0.0',
      author: env.AUTHOR_NAME,
      endpoints: {
        health: '/v1/health',
        users: '/v1/users',
        predictions: '/v1/predictions',
        patients: '/v1/patients'
      }
    });
  });

  // Error Handling Middleware
  app.use(errorHandlingMiddleware);

  const PORT = env.PORT || 5000;
  const HOST = env.HOST || 'localhost';

  if (env.NODE_ENV === 'development') {
    app.listen(PORT, HOST, () => {
      console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   🏥 DIABETES PREDICTION API - Development Mode 🏥        ║
║                                                            ║
║   Server: http://${HOST}:${PORT}                    ║
║   Author: ${env.AUTHOR_NAME}                      ║
║   Status: ✅ Running                                       ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
      `);
    });
  } else {
    app.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   🏥 DIABETES PREDICTION API - Production Mode 🏥         ║
║                                                            ║
║   Port: ${PORT}                                            ║
║   Status: ✅ Running                                       ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
      `);
    });
  }
};

// IIFE to start the server
(async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await CONNECT_DB();
    console.log('✅ Connected to MongoDB successfully!');
    console.log('');

    // Start the server
    StartServer();
  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error);
    process.exit(1);
  }
})();
