import 'dotenv/config';
import { testConnection } from '../server/db/astra';

(async () => {
  console.log('Testing Astra DB connection...');
  await testConnection();
})(); 