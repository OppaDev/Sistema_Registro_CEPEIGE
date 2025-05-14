import app from './app';
import { PORT } from './config';

app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});