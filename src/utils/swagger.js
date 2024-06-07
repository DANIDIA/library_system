import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUI from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.1.0',
    info: {
      title: 'Library system API',
    },
  },
  apis: ['./src/routers/routes.js'],
};

const swaggerSpec = swaggerJsdoc(options);

export function swaggerDocs(app) {
  app.use('/docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec));
}
