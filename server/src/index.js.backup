require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const authRoutes = require('./routes/auth');
const categoryRoutes = require('./routes/categories');
const workerRoutes = require('./routes/workers');
const requestRoutes = require('./routes/requests');
const reviewRoutes = require('./routes/reviews');
const chatRoutes = require('./routes/chat');
const adminRoutes = require('./routes/admin');
const { errorHandler } = require('./middleware/errorHandler');
const { attachChatSockets } = require('./sockets/chat');

const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());

app.get('/health', (req, res) => res.json({ ok: true }));

app.use('/auth', authRoutes);
app.use('/categories', categoryRoutes);
app.use('/workers', workerRoutes);
app.use('/requests', requestRoutes);
app.use('/reviews', reviewRoutes);
app.use('/chat', chatRoutes);
app.use('/admin', adminRoutes);

app.use(errorHandler);

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.CORS_ORIGIN || '*' },
  path: '/socket.io',
});
attachChatSockets(io);

const PORT = process.env.PORT || 4010;
server.listen(PORT, () => console.log(`Sergiu Mind Find API pornit pe portul ${PORT}`));
