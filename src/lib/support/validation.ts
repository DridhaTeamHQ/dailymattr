/* The /support form's rules, mirroring the check constraints on the
 * support_requests table. The form uses findProblem() (a readable sentence
 * under the button); the server action re-checks with serverProblem(), whose
 * short messages only reach the logs. */

export const TOPICS = ["Account or subscription", "App feedback", "Technical issue", "Something else"] as const;
export type Topic = (typeof TOPICS)[number];
export const isTopic = (value: string): value is Topic => (TOPICS as readonly string[]).includes(value);

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export type SupportFields = { name: string; email: string; topic: string; message: string; website: string };
export type SupportField = "name" | "email" | "topic" | "message";
export type Problem = { field: SupportField; message: string };

/* FormData values arrive as string | File | null */
export function readSupportFields(data: FormData): SupportFields {
  const get = (key: string) => {
    const value = data.get(key);
    return typeof value === "string" ? value : "";
  };
  return { name: get("name"), email: get("email"), topic: get("topic"), message: get("message"), website: get("website") };
}

/* The first problem found, or null when everything passes. The topic is
 * checked against the list so a tampered value is caught, not just an
 * empty one. */
export function findProblem(data: SupportFields): Problem | null {
  const name = data.name.trim();
  if (name.length < 2) return { field: "name", message: "Please enter your name (at least 2 characters)." };
  if (name.length > 120) return { field: "name", message: "That name is too long — 120 characters max." };

  const email = data.email.trim();
  if (!EMAIL_PATTERN.test(email)) return { field: "email", message: "That email address doesn't look right." };
  if (email.length > 254) return { field: "email", message: "That email address is too long." };

  if (!isTopic(data.topic)) return { field: "topic", message: "Please choose a support topic." };

  const message = data.message.trim();
  if (message.length < 10) return { field: "message", message: "Please tell us a little more — at least 10 characters." };
  if (message.length > 5000) return { field: "message", message: "That message is too long — 5000 characters max." };

  return null;
}

/* the same rules on already-trimmed values, with the API's own wording */
export function serverProblem(data: Omit<SupportFields, "website">): string | null {
  if (data.name.length < 2 || data.name.length > 120) return "Please enter a valid name.";
  if (!EMAIL_PATTERN.test(data.email) || data.email.length > 254) return "Please enter a complete email address.";
  if (!isTopic(data.topic)) return "Please select a support topic.";
  if (data.message.length < 10 || data.message.length > 5000) return "Message must be between 10 and 5000 characters.";
  return null;
}
