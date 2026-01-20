import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import config from './config/index.js';
import { sequelize } from './models/index.js';
import getRedisClient from './lib/redisClient.js';
import authRoutes from './routes/auth.js';
import notesRoutes from './routes/notes.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use('/auth', authRoutes);
app.use('/notes', notesRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
});

async function start() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();

    const redisClient = getRedisClient();
    await redisClient.connect();

    app.listen(config.port, () => {
      console.log(`Server running on port ${config.port}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
