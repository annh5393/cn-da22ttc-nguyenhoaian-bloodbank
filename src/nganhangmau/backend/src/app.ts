import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import errorHandler from './middlewares/errorHandler';

// Import routes
import authRoutes from './routes/auth';
import adminRoutes from './routes/admin.routes';
import nguoihienmauRoutes from './routes/nguoihienmau.routes';
import nhanvienyteRoutes from './routes/nhanvienyte.routes';
import phieuhienmauRoutes from './routes/phieuhienmau.routes';
import phieukhamRoutes from './routes/phieukham.routes';
import tuimauRoutes from './routes/tuimau.routes';
import khomauRoutes from './routes/khomau.routes';
import reportRoutes from './routes/report.routes';

dotenv.config();

const app: Application = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/nguoihienmau', nguoihienmauRoutes);
app.use('/api/nhanvienyte', nhanvienyteRoutes);
app.use('/api/phieuhienmau', phieuhienmauRoutes);
app.use('/api/phieukham', phieukhamRoutes);
app.use('/api/tuimau', tuimauRoutes);
app.use('/api/khomau', khomauRoutes);
app.use('/api/reports', reportRoutes);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'OK', message: 'Running' });
});

// Error handler (must be last)
app.use(errorHandler);

export default app;