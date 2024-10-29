import swaggerJsdoc from 'swagger-jsdoc';
import fs from 'fs';
import path from 'path';

const options: swaggerJsdoc.Options = {
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
const routesDir = path.join(__dirname, 'routes');
console.log('Scanning routes directory:', routesDir);
fs.readdirSync(routesDir).forEach(file => {
  console.log('Found route file:', file);
});

export const swaggerSpec = swaggerJsdoc(options);

// Log the generated swagger spec
console.log('Generated Swagger Spec:', JSON.stringify(swaggerSpec, null, 2));
