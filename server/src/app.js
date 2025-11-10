const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
dotenv.config();

require('./config/db.js')(); // connect to MongoDB

const roundRoutes = require('./routes/roundRoutes.js');

const app = express();

// Middlewares
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));
const allowedOrigins = [
    'http://localhost:5173',       // Vite local dev
    'http://localhost:3000',       // React dev server (optional)
    'https://your-vercel-app.vercel.app'  // production URL
];

app.use(cors({
    origin: function (origin, callback) {
        // allow requests with no origin (like curl, Postman)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        } else {
            console.log('Blocked by CORS:', origin);
            return callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));

// app.use(cors({
//     origin: process.env.CLIENT_URL || '*'
// }));
// app.use(cors());

app.get('/health', (req, res) => res.json({ ok: true }));
app.use('/api/rounds', roundRoutes);

// verification endpoint standalone
const verifyController = require('./controllers/verifyController.js');
app.get('/api/verify', verifyController.verifyQuery);

module.exports = app;
