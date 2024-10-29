import express, { Express, Response, Request } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import userRoutes from './routes/userRoutes';
import simulationRoutes from './routes/simulationRoutes';
import { authenticateToken, AuthRequest } from './middleware/auth';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './swaggerConfig';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

// CORS configuration
const corsOptions = {
  origin: 'http://localhost:3001', // Allow requests from the frontend
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Increase the payload size limit to 50MB
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Logging middleware (only log errors and important events)
app.use((req: Request, res: Response, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (res.statusCode >= 400 || duration > 1000) {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.url} - Status: ${res.statusCode} - Duration: ${duration}ms`);
    }
  });
  next();
});

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Public routes
app.use('/api/users', userRoutes);

// Protected routes
app.use('/api/simulations', simulationRoutes);

// Protected route example
app.get('/api/protected', authenticateToken, (req: AuthRequest, res: Response) => {
  res.json({ message: 'This is a protected route', user: req.user });
});

app.get('/', (req: AuthRequest, res: Response) => {
  res.send('Soil Irrigation Simulator API');
});

// Add this new route for logging
app.post('/api/log', (req: Request, res: Response) => {
  const { message } = req.body;
  console.log(message); // This will log to the backend terminal
  res.status(200).json({ message: 'Logged successfully' });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(`API Documentation available at http://localhost:${port}/api-docs`);
});
