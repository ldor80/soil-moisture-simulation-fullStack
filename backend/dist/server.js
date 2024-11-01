"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const simulationRoutes_1 = __importDefault(require("./routes/simulationRoutes"));
const auth_1 = require("./middleware/auth");
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swaggerConfig_1 = require("./swaggerConfig");
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
// CORS configuration
const corsOptions = {
    origin: 'http://localhost:3001', // Allow requests from the frontend
    optionsSuccessStatus: 200
};
app.use((0, cors_1.default)(corsOptions));
// Increase the payload size limit to 50MB
app.use(express_1.default.json({ limit: '50mb' }));
app.use(express_1.default.urlencoded({ limit: '50mb', extended: true }));
// Logging middleware (only log errors and important events)
app.use((req, res, next) => {
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
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerConfig_1.swaggerSpec));
// Public routes
app.use('/api/users', userRoutes_1.default);
// Protected routes
app.use('/api/simulations', simulationRoutes_1.default);
// Protected route example
app.get('/api/protected', auth_1.authenticateToken, (req, res) => {
    res.json({ message: 'This is a protected route', user: req.user });
});
app.get('/', (req, res) => {
    res.send('Soil Irrigation Simulator API');
});
// Add this new route for logging
app.post('/api/log', (req, res) => {
    const { message } = req.body;
    console.log(message); // This will log to the backend terminal
    res.status(200).json({ message: 'Logged successfully' });
});
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    console.log(`API Documentation available at http://localhost:${port}/api-docs`);
});
