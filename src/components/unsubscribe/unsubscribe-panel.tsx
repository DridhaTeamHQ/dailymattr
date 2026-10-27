"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { pill } from "@/components/site/pill";
import { UNSUBSCRIBE_URL } from "@/lib/newsletter";
import { cn } from "@/lib/utils";

const ACTIONS = ["unsubscribe", "delete", "resubscribe"] as const;
type Action = (typeof ACTIONS)[number];
const isAction = (value: string): value is Action => (ACTIONS as readonly string[]).includes(value);

const SUCCESS: Record<Action, { title: string; text: string; resubscribe?: boolean }> = {
  unsubscribe: {
    title: "You have unsubscribed",
    text: "You will no longer receive emails from dailymattr.",
    resubscribe: true,
  },
  resubscribe: {
    title: "You're subscribed again",
    text: "Your next newsletter arrives tomorrow morning.",
  },
  delete: {
    title: "Your data has been deleted",
    text: "Your dailymattr subscriber record and delivery history have been removed.",
  },
};

export type UnsubscribeView =
  | { kind: "loading" }
  | { kind: "success"; done: Action; canResubscribe: boolean }
  | { kind: "error"; message: string };

type UnsubscribeResponse = { ok?: boolean; error?: string; can_resubscribe?: boolean };

const heading = "text-[length:clamp(22px,5vw,28px)] leading-[1.2] font-bold tracking-[-.4px] text-ink";
const text = "mt-3 text-[15px] leading-[1.55] text-ink-soft";

/* The card: all three panels stay in the markup and only one shows, as in
 * the original page. Also the server-rendered fallback (loading). */
export function UnsubscribeCard({
  view,
  email = "",
  onResubscribe,
}: {
  view: UnsubscribeView;
  email?: string;
  onResubscribe?: () => void;
}) {
  const success = view.kind === "success" ? view : null;
  const copy = success ? SUCCESS[success.done] : null;

  return (
    <section
      aria-live="polite"
      className="w-full max-w-[480px] rounded-[20px] border border-solid border-mist bg-paper p-[clamp(28px,6vw,40px)] text-center"
    >
      <div id="unsub-loading" hidden={view.kind !== "loading"}>
        <h1 className={heading}>Updating your subscription...</h1>
      </div>

      <div id="unsub-success" hidden={!success}>
        <h1 id="unsub-success-title" className={heading}>
          {copy?.title}
        </h1>
        <p id="unsub-success-text" className={text}>
          {copy?.text}
        </p>
        {/* can_resubscribe: false means the address was never a subscriber */}
        <button
          id="unsub-resubscribe"
          type="button"
          hidden={!copy?.resubscribe || !success?.canResubscribe}
          disabled={view.kind === "loading"}
          onClick={onResubscribe}
          className={cn(
            pill({ variant: "brand" }),
            "mt-6 px-[26px] py-3 text-[15px] transition-none hover:translate-y-0 disabled:cursor-default disabled:opacity-60",
          )}
        >
          Resubscribe
        </button>
      </div>

      <div id="unsub-error" hidden={view.kind !== "error"}>
        <h1 className={heading}>This link didn&apos;t work</h1>
        <p id="unsub-error-text" className={text}>
          {view.kind === "error" ? view.message : null}
        </p>
        <p className={text}>If you keep getting dailymattr emails, reply to any of them and we&apos;ll remove you.</p>
      </div>

      <p id="unsub-email-row" hidden={!email} className="mt-7 border-t border-solid border-mist pt-5 text-[14px] leading-[1.55] wrap-anywhere text-ink-soft">
        Email address: <strong id="unsub-email" className="font-semibold text-ink">{email}</strong>
      </p>
    </section>
  );
}

/* /unsubscribe — the personal link in every newsletter and welcome email.
 * The email sender signs the token; this page never creates, checks or
 * stores it. It reads email/token/action from its own URL and forwards them
 * to the unsubscribe edge function, which does the real work. The email and
 * token go nowhere else: no analytics on this route, no Referer, no logging. */
export function UnsubscribePanel() {
  const params = useSearchParams();
  const email = (params.get("email") ?? "").trim();
  const token = (params.get("token") ?? "").trim();
  const requested = (params.get("action") ?? "unsubscribe").trim().toLowerCase();
  const action: Action = isAction(requested) ? requested : "unsubscribe";

  const [view, setView] = useState<UnsubscribeView>(() =>
    email && token ? { kind: "loading" } : { kind: "error", message: "Missing email or token." },
  );
  /* one request at a time: covers double clicks and effects run twice in
   * development */
  const inFlight = useRef(false);

  const run = useCallback(
    async (next: Action) => {
      if (inFlight.current) return;
      inFlight.current = true;
      setView({ kind: "loading" });
      try {
        const response = await fetch(UNSUBSCRIBE_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, token, action: next }),
          referrerPolicy: "no-referrer",
        });
        const data = (await response.json().catch(() => null)) as UnsubscribeResponse | null;
        if (response.ok && data?.ok) {
          setView({ kind: "success", done: next, canResubscribe: data.can_resubscribe !== false });
        } else {
          setView({ kind: "error", message: data?.error || "Invalid or expired unsubscribe link." });
        }
      } catch {
        setView({ kind: "error", message: "We couldn't reach our servers. Check your connection and open the link again." });
      } finally {
        inFlight.current = false;
      }
    },
    [email, token],
  );

  useEffect(() => {
    if (email && token) void run(action);
  }, [email, token, action, run]);

  return <UnsubscribeCard view={view} email={email} onResubscribe={() => void run("resubscribe")} />;
}
