import Image from "next/image";
import { APP_STORE_URL, PLAY_URL } from "@/lib/site";
import { cn } from "@/lib/utils";

const storePill =
  "inline-flex items-center gap-1.5 rounded-full border border-[rgba(255,255,255,0.14)] bg-[rgba(255,255,255,0.08)] px-[13px] py-[7px] text-[12px] font-semibold whitespace-nowrap text-white no-underline transition-[background,color,border-color,transform] duration-[180ms] ease-[ease] hover:border-white hover:bg-white hover:text-[#0a0a0b] hover:[transform:translateY(-1px)] phone:justify-center phone:px-2.5 [&_svg]:shrink-0";

/* the compact "get the app" bar under an article's bullets */
export function AppCta() {
  return (
    <div
      className="mt-[26px] mb-[22px] flex items-center justify-between gap-3.5 rounded-[14px] border border-[rgba(255,255,255,0.08)] bg-[#0f1015] px-4 py-[11px] text-white shadow-[0_4px_18px_rgba(10,10,11,0.08)] phone:mt-5 phone:mb-[18px] phone:flex-col phone:items-stretch phone:gap-[11px] phone:px-3.5 phone:py-3"
      role="group"
      aria-label="Get dailymattr App"
    >
      <div className="flex min-w-0 items-center gap-[11px]">
        <div
          className="grid size-8 shrink-0 place-items-center rounded-[8px] border border-[rgba(255,255,255,0.12)] bg-[#171922]"
          aria-hidden="true"
        >
          <Image className="block size-5 object-contain" src="/assets/apple-touch-icon.png" width={30} height={30} alt="" loading="lazy" />
        </div>
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="truncate text-[13.5px] leading-[1.25] font-bold text-white">Get 100 stories a day on the app</span>
          <span className="text-[11.5px] leading-[1.2] text-[rgba(255,255,255,0.6)]">Read, watch &amp; listen · Free on iOS &amp; Android</span>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2 phone:grid phone:grid-cols-2 phone:gap-2">
        <a
          className={cn(storePill, "hover:shadow-[0_4px_14px_rgba(57,121,255,0.25)]")}
          href={PLAY_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Get on Google Play"
        >
          <svg width="15" height="15" viewBox="0 0 512 512" fill="none" aria-hidden="true">
            <path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1z" fill="#FFC107" />
            <path d="M47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0z" fill="#00D2FF" />
            <path d="M472.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8z" fill="#FF3A44" />
            <path d="M104.6 499l280.8-161.2-60.1-60.1L104.6 499z" fill="#00E676" />
          </svg>
          <span>Google Play</span>
        </a>
        <a
          className={cn(storePill, "hover:shadow-[0_4px_14px_rgba(255,255,255,0.2)]")}
          href={APP_STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Download on App Store"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.84c.66-.8 1.11-1.92.99-3.04-1 .04-2.14.67-2.82 1.47-.6.69-1.12 1.83-1 2.93 1.12.09 2.17-.56 2.83-1.36z" />
          </svg>
          <span>App Store</span>
        </a>
      </div>
    </div>
  );
}
