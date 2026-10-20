import dns from 'node:dns';
import dotenv from 'dotenv';
dotenv.config();
import app from './app.js';
import { connectDB } from './config/db.js';

// MongoDB's mongodb+srv connection uses DNS SRV queries, which use these servers.
const dnsServers = (process.env.DNS_SERVERS || '8.8.8.8,1.1.1.1')
  .split(',')
  .map((server) => server.trim())
  .filter(Boolean);

if (dnsServers.length === 0) {
  throw new Error('DNS_SERVERS must contain at least one DNS server address');
}

dns.setServers(dnsServers);

const PORT = process.env.PORT || 4000;

async function bootstrap() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`API listening on http://localhost:${PORT}`);
  });
}
bootstrap();
