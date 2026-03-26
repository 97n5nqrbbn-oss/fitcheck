import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { json } from 'body-parser';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth';
import wardrobeRoutes from './routes/wardrobe';
import { authenticate } from './middleware/auth';

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(json({ limit: '10mb' }));

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/wardrobe', authenticate, wardrobeRoutes);

app.use(errorHandler);

export default app;
