require('dotenv').config();

const mongoose = require('mongoose');
const app = require('./app');

const port = process.env.PORT || 3000;
const mongoUri = process.env.MONGODB_URI;

async function startServer() {
  const requiredEnvironmentVariables = [
    'MONGODB_URI',
    'JWT_SECRET',
  ];

  const missingEnvironmentVariables =
    requiredEnvironmentVariables.filter(
      (name) => !process.env[name]
    );

  if (missingEnvironmentVariables.length > 0) {
    console.error(
      `缺少环境变量: ${missingEnvironmentVariables.join(', ')}`
    );
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected');

    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
}

startServer();