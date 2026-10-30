"use client";
import type { MouseEvent } from "react";
import Reveal from "./Reveal";
import s from "./Services.module.css";

const items = [
  { t: "Missed-call text back", d: "When you can't pick up, the customer gets a text in under a minute, with the questions you'd ask. Nobody calls the next guy.", eg: "\"Hey, this is Handled for Rick's Plumbing. Rick's on a job. What's going on and where are you?\"",
    icon: <path d="M6 4h12v16H6zM10 18h4" /> },
  { t: "Same-day estimates", d: "Send us a voice note or a few numbers. A clean, branded estimate goes out today, with follow-ups until it's answered.", eg: <><b>Sent in 22 min</b> on average, follow-ups at day 2 and day 5.</>,
    icon: <path d="M5 4h10l4 4v12H5zM9 12h6M9 16h6" /> },
  { t: "Scheduling & reminders", d: "Jobs booked around your crew and drive time. Customers confirmed and reminded so you stop driving to empty houses.", eg: <><b>No-shows down</b>: day-before and on-the-way texts.</>,
    icon: <path d="M4 6h16v14H4zM4 10h16M8 3v4M16 3v4" /> },
  { t: "Invoicing & collections", d: "Invoices go out when the job's done, synced to your books, chased politely until paid. You only hear about the truly late ones.", eg: <>Reminders on <b>day 3, 7 and 14</b>, in your words.</>,
    icon: <path d="M4 7h16v10H4zM8 12h.01M12 12h4" /> },
  { t: "Reviews & repeat work", d: "Review requests after good jobs, seasonal maintenance reminders, thank-yous for referrals. The stuff that builds a business.", eg: <>Review request <b>24 hours</b> after a completed job.</>,
    icon: <path d="M12 3l2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3 6.4 20.2l1.1-6.2L3 9.6l6.2-.9z" /> },
  { t: "Your inbox, triaged", d: "Supplier emails, customer replies, permit notices. Sorted, summarized, and the ones that need you flagged in one morning rundown.", eg: <>One <b>7 AM summary</b>. Everything else handled or filed.</>,
    icon: <path d="M3 6h18v12H3zM3 7l9 6 9-6" /> },
];

function onMove(e: MouseEvent<HTMLElement>) {
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
  e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
}

export default function Services() {
  return (
    <section id="handle" className="section grain" aria-labelledby="handle-title" style={{ background: "var(--cream-2)" }}>
      <div className="wrap">
        <Reveal>
          <div className={s.head}>
            <span className="eyebrow">What gets handled</span>
            <h2 id="handle-title" className="h-l">The office work that eats your evenings.</h2>
            <p className="lead">We don't replace your tools or your judgment. We take the routine admin off your plate and keep it moving, in the systems you already use.</p>
          </div>
        </Reveal>
        <div className={s.grid}>
          {items.map((it, i) => (
            <Reveal key={it.t} delay={(i % 3) * 0.07}>
              <article className={s.card} onMouseMove={onMove}>
                <div className={s.icon} aria-hidden>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" strokeLinecap="round">{it.icon}</svg>
                </div>
                <h3>{it.t}</h3>
                <p>{it.d}</p>
                <div className={s.eg}>{it.eg}</div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
