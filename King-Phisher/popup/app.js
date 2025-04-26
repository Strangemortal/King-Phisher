import express from 'express';
import cors from 'cors';
import userRoutes from 'users.js';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/users', userRoutes);

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
