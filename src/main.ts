import { registerRoutes } from './routes';
import express from 'express';

const app = express()
const port = 8080

registerRoutes(app);


app.listen(port, () => {
    console.log(`AccessGate Loaded 0.0.0.0:${port}`);
})