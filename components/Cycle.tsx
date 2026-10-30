"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Reveal from "./Reveal";
import s from "./Cycle.module.css";

type Row = { title: string; sub: string; pill: string; kind: "ok" | "wait" | "you" };
type Step = { name: string; title: string; body: string; bullets: string[]; rows: Row[] };

const steps: Step[] = [
  { name: "Inquiry", title: "Every lead gets a reply in minutes.", body: "Calls, texts, web forms, emails. A real answer goes back right away, the details get captured, and the lead shows up in your system instead of your voicemail.",
    bullets: ["Missed calls get a text back within 60 seconds", "Web and Google leads logged with job details", "After-hours inquiries queued for the morning"],
    rows: [{ title: "Maria R. — water heater leaking", sub: "Missed call · 2:14 PM", pill: "Replied by text", kind: "ok" }, { title: "Tom B. — quote for new AC", sub: "Website form · 2:41 PM", pill: "Added to pipeline", kind: "ok" }, { title: "Unknown — \"how much for a drain?\"", sub: "Text · 3:05 PM", pill: "Asked for address", kind: "wait" }] },
  { name: "Estimate", title: "Quotes go out the same day.", body: "You give us the numbers from the truck. We turn it into a clean, branded estimate, send it, and follow up until the customer says yes or no.",
    bullets: ["Estimates drafted from your notes or voice memo", "Sent for your approval first, if you want", "Automatic follow-up at 2 and 5 days"],
    rows: [{ title: "Estimate #1042 — Maria R.", sub: "$1,850 · drafted from your voice note", pill: "Needs your OK", kind: "you" }, { title: "Estimate #1039 — Hendricks", sub: "Sent Tuesday · no reply", pill: "Follow-up sent", kind: "ok" }, { title: "Estimate #1036 — Patel", sub: "Viewed 3 times", pill: "Accepted", kind: "ok" }] },
  { name: "Schedule", title: "Jobs land on the calendar, not in your head.", body: "Accepted work gets booked around your crew, drive time and parts. Customers get confirmations and reminders so nobody's standing at an empty house.",
    bullets: ["Booked into your existing calendar or field app", "Confirmation and day-before reminder texts", "Reschedules handled without the phone tag"],
    rows: [{ title: "Thu 8:00 — Patel, drain line", sub: "Crew A · 45 min drive", pill: "Confirmed", kind: "ok" }, { title: "Thu 1:00 — Maria R., water heater", sub: "Parts ordered · Crew B", pill: "Reminder sent", kind: "ok" }, { title: "Fri 10:00 — Hendricks", sub: "Asked to move to Monday", pill: "Rebooked", kind: "ok" }] },
  { name: "Job done", title: "Close-out paperwork, done on site.", body: "When the crew marks the job complete, photos, notes and materials get filed, and the invoice is ready before the truck leaves the driveway.",
    bullets: ["Job notes and photos filed to the customer record", "Materials pulled into the invoice automatically", "Warranty and permit paperwork tracked"],
    rows: [{ title: "Patel — drain line cleared", sub: "4 photos · 1.5 hrs · 2 parts", pill: "Filed", kind: "ok" }, { title: "Invoice #2211 drafted", sub: "$485 from job sheet", pill: "Ready to send", kind: "wait" }, { title: "Permit close-out — Hendricks", sub: "Due in 10 days", pill: "Tracked", kind: "ok" }] },
  { name: "Invoice", title: "Invoices send themselves. Correctly.", body: "Invoices go out the moment a job is done, synced to your books, with a pay link the customer can tap from their phone.",
    bullets: ["Synced to QuickBooks or your accounting tool", "Card, ACH and financing links included", "Deposits and progress billing supported"],
    rows: [{ title: "Invoice #2211 — Patel", sub: "Sent 4:12 PM · pay link", pill: "Paid $485", kind: "ok" }, { title: "Invoice #2210 — Nguyen", sub: "Synced to QuickBooks", pill: "Sent", kind: "ok" }, { title: "Deposit — Maria R.", sub: "50% of $1,850", pill: "Requested", kind: "wait" }] },
  { name: "Get paid", title: "Polite, persistent follow-up. Not you.", body: "Unpaid invoices get friendly reminders on a schedule you approve. You only hear about it when someone's seriously late.",
    bullets: ["Reminders at 3, 7 and 14 days, your wording", "Payment plans offered where you allow it", "Escalations flagged to you, never sent alone"],
    rows: [{ title: "Invoice #2198 — Alvarez", sub: "12 days · 2 reminders", pill: "Paid today", kind: "ok" }, { title: "Invoice #2190 — Carter", sub: "21 days · no response", pill: "Flagged for you", kind: "you" }, { title: "Invoice #2204 — Lee", sub: "Day 3", pill: "Reminder sent", kind: "ok" }] },
  { name: "Keep them", title: "Customers come back, and bring friends.", body: "Review requests after good jobs, seasonal maintenance reminders, and a quick check-in so you're the first call next time.",
    bullets: ["Google review requests after completed jobs", "Maintenance reminders by season and equipment", "Referral thank-yous that actually get sent"],
    rows: [{ title: "Patel — review request", sub: "Sent 1 day after job", pill: "5 stars", kind: "ok" }, { title: "Fall furnace tune-up list", sub: "38 customers", pill: "Scheduled Oct 1", kind: "ok" }, { title: "Nguyen — referred a neighbor", sub: "Thank-you text", pill: "Sent", kind: "ok" }] },
];

const DUR = 6000;

export default function Cycle() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.25 });
    io.observe(el); return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (paused || !inView || reduce) return;
    const t = setTimeout(() => setActive((a) => (a + 1) % steps.length), DUR);
    return () => clearTimeout(t);
  }, [active, paused, inView, reduce]);

  const step = steps[active];

  return (
    <section id="how" ref={ref} className="section dark grain" aria-labelledby="how-title" style={{ ["--dur" as string]: `${DUR}ms` }}>
      <div className={`wrap ${s.layout}`}>
        <div className={s.sticky}>
          <Reveal>
            <span className="eyebrow">How it works</span>
            <h2 id="how-title" className="h-l">Seven things every service business does. We help with all of them.</h2>
            <p className="muted" style={{ fontSize: 18, maxWidth: "46ch" }}>
              Your business already runs this loop every week. We plug into the tools you have and keep each step moving, with you in charge of every decision that matters.
            </p>
          </Reveal>
          <ol className={s.steps} aria-label="Steps">
            {steps.map((st, i) => (
              <li key={st.name}>
                <button
                  className={`${s.step} ${i === active ? s.active : ""} ${paused && i === active ? s.paused : ""}`}
                  onClick={() => { setActive(i); setPaused(true); }}
                  aria-pressed={i === active}
                >
                  <span className={s.idx}>0{i + 1}</span>
                  <span className={s.name}>{st.name}</span>
                  <span className={s.bar} aria-hidden><i key={i === active ? active : -1} /></span>
                </button>
              </li>
            ))}
          </ol>
        </div>

        <div className={s.panel} onMouseEnter={() => setPaused(true)} aria-live="polite">
          <AnimatePresence mode="wait">
            <motion.div key={active}
              initial={reduce ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={reduce ? undefined : { opacity: 0, y: -12 }}
              transition={{ duration: .5, ease: [0.22, 1, 0.36, 1] }} style={{ display: "grid", gap: 28 }}>
              <div className={s.panelHead}>
                <h3>{step.title}</h3>
                <span>Step 0{active + 1} · {step.name}</span>
              </div>
              <div className={s.body}>
                <div>
                  <p>{step.body}</p>
                  <ul className={s.list}>{step.bullets.map((b) => <li key={b}>{b}</li>)}</ul>
                </div>
                <div className={s.mock} aria-hidden>
                  <div className={s.mockTop}><span>Today · {step.name}</span><span>Handled</span></div>
                  {step.rows.map((r, i) => (
                    <motion.div className={s.row} key={r.title}
                      initial={reduce ? false : { opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: .12 + i * .1, duration: .45 }}>
                      <div><b>{r.title}</b><small>{r.sub}</small></div>
                      <span className={`${s.pill} ${s[r.kind]}`}>{r.pill}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
