import { DataAPIClient } from '@datastax/astra-db-ts';

const ASTRA_TOKEN = import.meta.env.VITE_ASTRA_TOKEN;
const ASTRA_ENDPOINT = import.meta.env.VITE_ASTRA_ENDPOINT;
const FLOW_ID = import.meta.env.VITE_FLOW_ID;

// Initialize the client
const client = new DataAPIClient(ASTRA_TOKEN);
export const astraDb = client.db(ASTRA_ENDPOINT);
export const flowId = FLOW_ID;