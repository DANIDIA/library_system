import express from 'express';
import cors from 'cors';
import { swaggerDocs } from './src/utils/index.js';
import { routes } from './src/index.js';

const PORT = 5000;

console.log('Server starts...');

const app = express();
app.use(cors({ credentials: true, origin: process.env.FRONTEND_ORIGIN }));
app.use(express.json());

routes(app);

swaggerDocs(app);

// ToDo: #3: This middleware doesn't work.
// app.use(handleEndpointsErrors);

app.listen(PORT, () => console.log('Server is listening on port ' + PORT));
