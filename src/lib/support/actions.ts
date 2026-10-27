"use server";

import { headers } from "next/headers";
import { supportDb } from "./db";
import { clientIp, supportThrottle } from "./throttle";
import { readSupportFields, serverProblem } from "./validation";

export type SupportResponse = { ok: true } | { ok: false; error: string };

/* the old /api/support capped the JSON body at 32 KB */
const MAX_BYTES = 32768;

const isCoded = (error: unknown): error is { code: string } =>
  typeof error === "object" && error !== null && typeof (error as { code?: unknown }).code === "string";

/* The /support form's submission (was POST /api/support): honeypot, the
 * same validation as the form, a per-IP throttle, then one row in
 * support_requests. Failures come back as { ok: false } with the API's
 * message; the form shows its own generic sentence for every one of them. */
export async function sendSupportRequest(formData: FormData): Promise<SupportResponse> {
  try {
    const fields = readSupportFields(formData);
    if (new TextEncoder().encode(JSON.stringify(fields)).length > MAX_BYTES) {
      return { ok: false, error: "Your message is too long." };
    }
    // hidden "website" field: people never see it, form-filling bots do
    if (fields.website.trim()) return { ok: true };

    const row = {
      name: fields.name.trim(),
      email: fields.email.trim(),
      topic: fields.topic.trim(),
      message: fields.message.trim(),
    };
    const problem = serverProblem(row);
    if (problem) return { ok: false, error: problem };

    const throttle = supportThrottle(clientIp(await headers()));
    if (throttle.limited) {
      return { ok: false, error: "Too many requests. Please try again later or email support@dailymattr.com." };
    }

    const db = supportDb();
    if (!db) return { ok: false, error: "Support service is not configured." };
    const { error } = await db.from("support_requests").insert(row);
    if (error) throw error;
    throttle.record();
    return { ok: true };
  } catch (error) {
    console.error("[support]", error);
    const missingTable = isCoded(error) && error.code === "PGRST205";
    return {
      ok: false,
      error: missingTable
        ? "Support database table is missing. Apply the support_requests migration."
        : "We could not send your request.",
    };
  }
}
