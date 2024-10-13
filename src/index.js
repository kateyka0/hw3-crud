import { initMongoConnection } from './db/initMongoConnection.js';
import { setupServer } from './server.js';

async function Start() {
  await initMongoConnection();
  setupServer();
}

Start();


