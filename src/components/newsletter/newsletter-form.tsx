"use client";

import Image from "next/image";
import { useRef, useState, type FormEvent, type ReactNode } from "react";
import { flushSync } from "react-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { subscribe, type SubscribeResult } from "@/lib/newsletter";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* shadcn Label / Input defaults overridden to the original .nl-label /
 * .nl-input (the input inherits the label's 600 weight, as before) */
const label = "block text-[13px] leading-[normal] font-semibold text-ink select-auto";
const input =
  "mt-2 h-auto w-full rounded-[14px] border-2 border-solid border-[#dbe6fc] bg-[#f8faff] px-4 py-3 text-[14px] text-ink outline-none md:text-[14px] transition-[border-color,background] duration-200 ease-[ease] placeholder:text-[#9db1d6] focus-visible:border-brand focus-visible:bg-white focus-visible:ring-0";

type Done = { result: SubscribeResult; email: string };

/* the result panel's copy for each case; with no result yet it holds the
 * page's static text, which the original HTML also carried (hidden) */
function doneCopy(done: Done | null): { badge: string; title: string; body: ReactNode } {
  if (!done) {
    return {
      badge: "🎉",
      title: "You’re on the list!",
      body: "Look out for a welcome note in your inbox. Good reads are on their way.",
    };
  }
  const email = <strong className="text-ink">{done.email}</strong>;
  if (done.result.existing && !done.result.resubscribed) {
    return {
      badge: "👋",
      title: "You’re already subscribed!",
      body: <>{email} is already on our list — no need to sign up again. Your next edition arrives tomorrow morning.</>,
    };
  }
  if (done.result.existing) {
    return { badge: "🙌", title: "Welcome back!", body: <>We’ve switched {email} back on. Good reads resume tomorrow morning.</> };
  }
  return { badge: "🎉", title: "You’re on the list!", body: <>Look out for a welcome note in {email}. Good reads are on their way.</> };
}

/* The subscribe form on /newsletter and its result panel (new subscriber,
 * already subscribed, welcome back). */
export function NewsletterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState<Done | null>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const address = email.trim();
    if (!address || !EMAIL_PATTERN.test(address)) {
      setError("Please enter a valid email address.");
      emailRef.current?.focus();
      return;
    }
    setSending(true);
    try {
      const result = await subscribe({ name: name.trim(), email: address });
      setDone({ result, email: address });
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : String(failure));
    } finally {
      setSending(false);
    }
  }

  /* back to the form with the email cleared (the name stays) */
  function addAnother() {
    flushSync(() => {
      setEmail("");
      setDone(null);
    });
    emailRef.current?.focus();
  }

  const copy = doneCopy(done);

  return (
    <>
      <form id="nl-form" className="w-full" noValidate onSubmit={handleSubmit} hidden={done !== null}>
        <Image
          src="/assets/publisher-logo.png"
          width={156}
          height={32}
          alt="dailymattr"
          sizes="250px"
          loading="eager"
          className="mx-auto mb-9 block h-auto w-[min(250px,70%)]"
        />
        <div className="grid gap-4 min-[640px]:grid-cols-[1fr_1fr]">
          <Label className={label}>
            First name <span className="font-normal text-[#9db1d6]">(optional)</span>{" "}
            <Input
              id="nl-name"
              type="text"
              maxLength={80}
              autoComplete="given-name"
              placeholder="What should we call you?"
              className={input}
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </Label>
          <Label className={label}>
            Email address{" "}
            <Input
              ref={emailRef}
              id="nl-email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              className={input}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </Label>
        </div>
        <p id="nl-error" role="alert" hidden={!error} className="mt-[14px] text-[13px] font-medium text-[#d92d20]">
          {error}
        </p>
        <button
          id="nl-submit"
          type="submit"
          disabled={sending}
          className="mt-7 flex w-full cursor-pointer items-center justify-center gap-2 rounded-full border-none bg-brand px-5 py-[15px] text-[15px] font-bold text-white shadow-[0_12px_28px_-10px_rgba(57,121,255,.55)] transition-[transform,translate,box-shadow,opacity] duration-200 ease-[ease] hover:shadow-[0_16px_32px_-10px_rgba(57,121,255,.6)] enabled:hover:-translate-y-px disabled:cursor-wait disabled:opacity-70"
        >
          <span>
            {sending ? (
              "Sending your invite…"
            ) : (
              <>
                Send me the good stuff <span className="text-[18px] leading-none">→</span>
              </>
            )}
          </span>
        </button>
        <p className="mt-[14px] text-center text-[12px] leading-[1.5] text-ink-soft">
          By subscribing you agree to receive the daily newsletter. Unsubscribe anytime.
        </p>
      </form>

      <div id="nl-done" hidden={done === null} className="flex min-h-[440px] w-full flex-col items-center justify-center text-center">
        <span
          id="nl-done-badge"
          className="flex size-20 items-center justify-center rounded-full bg-[#e8f0ff] text-[36px] shadow-[0_12px_30px_-12px_rgba(57,121,255,.5)]"
        >
          {copy.badge}
        </span>
        <h2 id="nl-done-title" className="mt-[26px] text-[30px] font-bold tracking-[-0.04em] text-ink">
          {copy.title}
        </h2>
        <p id="nl-done-copy" className="mt-3 max-w-[360px] leading-[1.6] text-ink-soft">
          {copy.body}
        </p>
        <button
          id="nl-again"
          type="button"
          onClick={addAnother}
          className="mt-[26px] cursor-pointer rounded-full border-2 border-solid border-brand bg-white px-5 py-2.5 text-[14px] font-semibold text-brand transition-[background,color] duration-200 ease-[ease] hover:bg-brand hover:text-white"
        >
          Add another email
        </button>
      </div>
    </>
  );
}
