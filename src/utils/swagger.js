import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUI from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.1.0',
    info: {
      title: 'Library system API',
    },
    tags: [
      {
        name: 'Authentication',
        description:
          'Endpoints that allows to authenticate to API. There are session based authentication with cookies',
      },
    ],
  },
  apis: ['./src/routers/*.js', './src/schemas/*.schemas.js'],
};

const swaggerSpec = swaggerJsdoc(options);

export function swaggerDocs(app) {
  app.use('/docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec));
}
