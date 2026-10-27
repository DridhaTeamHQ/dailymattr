"use client";

import Image from "next/image";
import { startTransition, useActionState, useEffect, useRef, useState, type FormEvent } from "react";
import { pill } from "@/components/site/pill";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SUPPORT_EMAIL } from "@/lib/site";
import { sendSupportRequest } from "@/lib/support/actions";
import { findProblem, readSupportFields, type Problem } from "@/lib/support/validation";
import { cn } from "@/lib/utils";
import { field, fieldLabel, fieldLabelText } from "./classes";
import { TopicSelect } from "./topic-select";

const IDLE_NOTE = "We usually reply within one business day";
const SENDING_NOTE = "Sending your request...";
const FAILED_NOTE = "We couldn't send that. Please try again or email support@dailymattr.com.";

/* each answer gets a new id, so the form can tell a fresh one from one the
 * visitor has already moved past (by typing, or "Write another message") */
type Result = { id: number; ok: boolean | null };

/* Calls the server action. Any failure, the action's own or a dropped
 * connection, becomes { ok: false } and the generic note — the original
 * never showed the server's wording either. */
async function send(previous: Result, data: FormData): Promise<Result> {
  const id = previous.id + 1;
  try {
    const response = await sendSupportRequest(data);
    if (!response.ok) console.error("Support request failed", new Error(response.error));
    return { id, ok: response.ok };
  } catch (error) {
    console.error("Support request failed", error);
    return { id, ok: false };
  }
}

/* The help form on /support: native constraint checks, then the form's own
 * rules (findProblem), then the server action. Submissions land in the
 * support_requests table. */
export function SupportForm() {
  const [result, submit, sending] = useActionState(send, { id: 0, ok: null });
  const [seen, setSeen] = useState(0);
  const [problem, setProblem] = useState<Problem | null>(null);
  const [topic, setTopic] = useState("");
  const [topicOpen, setTopicOpen] = useState(false);
  const [preview, setPreview] = useState(false);

  const formRef = useRef<HTMLFormElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);
  const topicRef = useRef<HTMLButtonElement>(null);
  const anotherRef = useRef<HTMLButtonElement>(null);

  const fresh = !sending && result.id !== seen;
  const success = preview || (fresh && result.ok === true);
  const failed = fresh && result.ok === false;
  const hasError = !sending && (problem !== null || failed);
  const note = sending ? SENDING_NOTE : problem ? problem.message : failed ? FAILED_NOTE : IDLE_NOTE;

  /* the confirmation: clear the form behind it, then hand focus to
   * "Write another message" once the panel has settled */
  useEffect(() => {
    if (!success) return;
    formRef.current?.reset();
    setTopic("");
    const timer = window.setTimeout(() => anotherRef.current?.focus(), 650);
    return () => window.clearTimeout(timer);
  }, [success]);

  /* local-only preview of the confirmation animation: /support/?preview=success */
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    if (new URLSearchParams(window.location.search).get("preview") !== "success") return;
    const timer = window.setTimeout(() => setPreview(true), 450);
    return () => window.clearTimeout(timer);
  }, []);

  /* a complaint goes away as soon as the visitor starts fixing it */
  function clearComplaint() {
    setProblem(null);
    if (failed) setSeen(result.id);
  }

  function showProblem(found: Problem) {
    setProblem(found);
    if (found.field === "topic") {
      topicRef.current?.focus();
      setTopicOpen(true);
      return;
    }
    ({ name: nameRef, email: emailRef, message: messageRef })[found.field].current?.focus();
  }

  /* runs before React's form action: either stops the submit with a named
   * problem, or starts the action itself (so React never resets the form —
   * on a failed send the visitor keeps what they typed) */
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending) return;
    const form = event.currentTarget;
    if (!form.reportValidity()) return;

    const data = new FormData(form);
    setSeen(result.id);
    const found = findProblem(readSupportFields(data));
    if (found) {
      showProblem(found);
      return;
    }
    setProblem(null);
    startTransition(() => submit(data));
  }

  function writeAnother() {
    setPreview(false);
    setSeen(result.id);
    window.setTimeout(() => nameRef.current?.focus(), 180);
  }

  const invalid = (name: Problem["field"]) => (problem?.field === name ? true : undefined);

  return (
    <form
      ref={formRef}
      id="support-form"
      action={submit}
      onSubmit={handleSubmit}
      onInput={clearComplaint}
      aria-busy={sending}
      className={cn(
        "relative z-[1] min-h-[560px] rounded-[30px] border border-solid border-white/13 bg-white/[.055] p-[9px]",
        "shadow-[0_32px_90px_rgba(0,0,0,.36),inset_0_1px_0_rgba(255,255,255,.05)]",
        "animate-[support-rise_.75s_.08s_cubic-bezier(.22,1,.36,1)_both] motion-reduce:animate-none",
        "desktop:[@media(max-height:800px)]:min-h-[470px]",
        "mobile:min-h-0 mobile:rounded-[24px] mobile:p-[7px]",
      )}
    >
      <div
        className={cn(
          "min-h-[540px] rounded-[22px] border border-solid border-white/6 bg-[rgba(11,11,14,.38)] p-7",
          "[transition:opacity_.25s_ease,transform_.45s_cubic-bezier(.22,1,.36,1),visibility_.25s_ease] motion-reduce:[transition-duration:.01ms]",
          "desktop:[@media(max-height:800px)]:min-h-[450px] desktop:[@media(max-height:800px)]:px-7 desktop:[@media(max-height:800px)]:py-[22px]",
          "mobile:min-h-0 mobile:p-[clamp(20px,5vw,28px)]",
          success && "invisible opacity-0 [transform:translateY(12px)_scale(.98)]",
        )}
      >
        {/* honeypot: hidden from people, filled in by form bots */}
        <input
          className="pointer-events-none absolute -left-[10000px] h-px w-px opacity-0"
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
        />
        <div className="mb-[22px] flex items-start justify-between gap-6 border-b border-solid border-white/9 pb-6 desktop:[@media(max-height:800px)]:mb-[15px] desktop:[@media(max-height:800px)]:pb-4">
          <div>
            <p className="mb-[7px] text-[11px] font-bold tracking-[1.15px] text-[#7ea9ff]">dailymattr support</p>
            <h2 className="text-[24px] leading-[1.06] font-bold tracking-[-.6px]">How can we help?</h2>
          </div>
          <span className="inline-flex flex-none items-center gap-2 rounded-full bg-white/6 px-[11px] py-2 text-[11px] font-semibold text-white/68">
            <i aria-hidden="true" className="size-[7px] rounded-full bg-[#64d8a3] shadow-[0_0_0_4px_rgba(100,216,163,.1)]" /> Online
          </span>
        </div>
        <div className="grid grid-cols-[1fr_1fr] gap-4 mobile:grid-cols-[1fr] mobile:gap-0">
          <Label className={fieldLabel}>
            <span className={fieldLabelText}>Your name</span>
            <Input
              ref={nameRef}
              name="name"
              type="text"
              autoComplete="name"
              placeholder="Your full name"
              minLength={2}
              maxLength={120}
              required
              aria-invalid={invalid("name")}
              className={field}
            />
          </Label>
          <Label className={fieldLabel}>
            <span className={fieldLabelText}>Email address</span>
            <Input
              ref={emailRef}
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              maxLength={254}
              required
              aria-invalid={invalid("email")}
              className={field}
            />
          </Label>
        </div>
        <TopicSelect
          value={topic}
          onValueChange={(value) => {
            setTopic(value);
            clearComplaint();
          }}
          open={topicOpen}
          onOpenChange={setTopicOpen}
          invalid={problem?.field === "topic"}
          triggerRef={topicRef}
        />
        <Label className={fieldLabel}>
          <span className={fieldLabelText}>Your message</span>
          <Textarea
            ref={messageRef}
            name="message"
            rows={5}
            placeholder="Tell us what happened and how we can help..."
            minLength={10}
            maxLength={5000}
            required
            aria-invalid={invalid("message")}
            className={cn(field, "inline-block min-h-[120px] resize-y field-sizing-fixed desktop:[@media(max-height:800px)]:min-h-[88px]")}
          />
        </Label>
        <div className="mt-[5px] grid grid-cols-[auto_1fr] items-center gap-[18px] mobile:grid-cols-[1fr] mobile:gap-3">
          <button
            type="submit"
            className={cn(
              pill({ variant: "brand", shine: true }),
              "min-w-[196px] transition-[transform,translate,opacity,box-shadow] duration-200 ease-[ease] hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(60,123,255,.28)] mobile:w-full",
              sending && "pointer-events-none animate-[support-button-pulse_1s_ease-in-out_infinite] motion-reduce:animate-none",
            )}
          >
            <span className={cn(sending && "hidden")}>Send support request</span>
            <span className={sending ? "inline" : "hidden"} aria-hidden="true">
              Sending request
            </span>
          </button>
          <p
            id="support-form-note"
            aria-live="polite"
            className={cn("max-w-[260px] text-[12px] leading-[1.5] text-white/48 transition-[color] duration-200 ease-[ease]", hasError && "text-[#ff9e9e]")}
          >
            {note}
          </p>
        </div>
      </div>

      <div
        id="support-success"
        aria-hidden={!success}
        className={cn(
          "absolute inset-[9px] z-[3] flex flex-col items-center justify-center rounded-[22px] bg-[#131316] p-[42px] text-center",
          "[transition:opacity_.3s_ease,transform_.5s_cubic-bezier(.22,1,.36,1),visibility_.3s_ease] motion-reduce:[transition-duration:.01ms]",
          "desktop:[@media(max-height:800px)]:p-[30px] mobile:min-h-[520px] mobile:px-6 mobile:py-[30px]",
          success ? "visible opacity-100 [transform:scale(1)]" : "invisible opacity-0 [transform:scale(.96)]",
        )}
      >
        <div
          aria-hidden="true"
          className="relative mb-7 grid size-[112px] place-items-center desktop:[@media(max-height:800px)]:mb-5 desktop:[@media(max-height:800px)]:size-[94px]"
        >
          <span
            className={cn(
              "absolute inset-0 rounded-full border border-solid border-[rgba(60,123,255,.5)] shadow-[0_0_45px_rgba(60,123,255,.22)]",
              success && "animate-[support-ring_1s_.18s_cubic-bezier(.22,1,.36,1)_both] motion-reduce:animate-none",
            )}
          />
          <Image
            width={512}
            height={512}
            src="/assets/favicon.png"
            alt=""
            sizes="58px"
            loading="eager"
            className={cn(
              "relative z-[1] size-[58px] object-contain desktop:[@media(max-height:800px)]:size-[50px]",
              success && "animate-[support-logo-pop_.7s_.12s_cubic-bezier(.22,1,.36,1)_both] motion-reduce:animate-none",
            )}
          />
        </div>
        <p className="text-[11px] font-bold tracking-[1.4px] text-[#7ea9ff] uppercase">Message received</p>
        <h2 className="mt-[11px] mb-3 text-[length:clamp(34px,4vw,48px)] leading-[1.06] font-bold tracking-[-1.6px] desktop:[@media(max-height:800px)]:mt-2 mobile:tracking-[-1.4px]">
          We&apos;re on it.
        </h2>
        <p className="max-w-[410px] text-[14px] leading-[1.7] text-white/58">
          Your request is with our support team and we&apos;ll reply to the email address you gave us, usually within one business day. Need to add something? Email <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
        </p>
        <button
          ref={anotherRef}
          id="support-send-another"
          type="button"
          onClick={writeAnother}
          className="mt-[27px] cursor-pointer appearance-none border-b border-solid border-white/36 bg-transparent pb-1 text-[13px] font-semibold text-white transition-[color,border-color] duration-200 ease-[ease] hover:border-[#8db4ff] hover:text-[#8db4ff]"
        >
          Write another message
        </button>
      </div>
    </form>
  );
}
