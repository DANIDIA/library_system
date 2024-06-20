import express from 'express';
import cors from 'cors';
import { routes } from './src/index.js';
import cookieParser from 'cookie-parser';

const PORT = 5000;

console.log('Server starts...');

const app = express();
app.use(cors({ credentials: true, origin: process.env.FRONTEND_ORIGIN }));
app.use(express.json());
app.use(cookieParser());

routes(app);

// ToDo: #3: This middleware doesn't work.
// app.use(handleEndpointsErrors);

app.listen(PORT, () => console.log('Server is listening on port ' + PORT));
