const express = require('express');
const connectDB = require('./config/db');

const app = express();

// Connect Database
connectDB();

// Init Middleware
app.use(express.json({ extended: false }));

// Define Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));
app.use('/api/comments', require('./routes/commentRoutes'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on http://localhost:${PORT}`));
