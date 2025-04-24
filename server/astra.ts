import { DataAPIClient } from "@datastax/astra-db-ts";

// Create Astra DB client
const client = new DataAPIClient();
const db = client.db(process.env.ASTRA_DB_ENDPOINT!, {
  token: process.env.ASTRA_DB_APPLICATION_TOKEN!
});

export const collections = {
  chat_memory: db.collection('chat_memory')
};

export default db; 