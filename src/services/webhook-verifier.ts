import crypto from "crypto";
import { config } from "../config";

export function verifyWebhookSignature(
  payload: any,
  receivedSignature: string
): boolean {
  const computedHmac = crypto
    .createHmac("sha256", config.churnkey.webhookSecret)
    .update(JSON.stringify(payload))
    .digest("hex");

  return computedHmac === receivedSignature;
}
