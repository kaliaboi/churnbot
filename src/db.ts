import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export async function saveWebhookEvent(event: any) {
  const { error } = await supabase.from("webhook_events").insert([
    {
      id: event.id,
      event_type: event.event,
      customer_id: event.data?.customer?.id,
      payload: event,
    },
  ]);

  if (error) throw error;
}
