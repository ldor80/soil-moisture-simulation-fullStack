"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.swaggerSpec = void 0;
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Soil Irrigation Simulator API',
            version: '1.0.0',
            description: 'API for the Soil Irrigation Simulator application',
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Development server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [{
                bearerAuth: [],
            }],
    },
    apis: ['./routes/*.ts'],
};
// Log the files being scanned
const routesDir = path_1.default.join(__dirname, 'routes');
console.log('Scanning routes directory:', routesDir);
fs_1.default.readdirSync(routesDir).forEach(file => {
    console.log('Found route file:', file);
});
exports.swaggerSpec = (0, swagger_jsdoc_1.default)(options);
// Log the generated swagger spec
console.log('Generated Swagger Spec:', JSON.stringify(exports.swaggerSpec, null, 2));
