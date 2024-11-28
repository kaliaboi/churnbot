import { Pool } from "pg";
import { config } from "./config";

export const pool = new Pool({
  connectionString: config.database.connectionString,
});

export async function saveWebhookEvent(event: any) {
  console.log("Saving webhook event:", event);
  const client = await pool.connect();
  try {
    const query = `
      INSERT INTO webhook_events 
      (id, event_type, customer_id, payload, created_at) 
      VALUES ($1, $2, $3, $4, NOW())
    `;
    const values = [
      event.id,
      event.event,
      event.data?.customer?.id,
      JSON.stringify(event),
    ];
    await client.query(query, values);
  } finally {
    client.release();
  }
}
