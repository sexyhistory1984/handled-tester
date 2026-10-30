"use client";
import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Reveal from "./Reveal";
import s from "./Control.module.css";

const entries = [
  { t: "7:02 AM", title: "Morning rundown sent", sub: "3 leads, 2 estimates awaiting you, 1 late invoice", kind: "ok", pill: "Done" },
  { t: "8:15 AM", title: "Missed call → text reply", sub: "Maria R. · water heater · address captured", kind: "ok", pill: "Done" },
  { t: "9:40 AM", title: "Estimate #1042 drafted · $1,850", sub: "From your voice note. Not sent until you approve.", kind: "you", pill: "approve" },
  { t: "11:05 AM", title: "Reminder sent · Invoice #2204", sub: "Day 3 · friendly tone · pay link included", kind: "ok", pill: "Done" },
  { t: "12:30 PM", title: "Invoice #2190 is 21 days late", sub: "Paused automatic reminders. Your call on next step.", kind: "you", pill: "Flagged" },
];

export default function Control() {
  const [approved, setApproved] = useState(false);
  const reduce = useReducedMotion();
  return (
    <section id="control" className="section dark grain" aria-labelledby="control-title">
      <div className={`wrap ${s.layout}`}>
        <Reveal>
          <span className="eyebrow">You stay in control</span>
          <h2 id="control-title" className="h-l">Nothing goes out that you wouldn't send.</h2>
          <p className="muted" style={{ fontSize: 18, maxWidth: "50ch" }}>
            This is your business and your money. You decide what runs on its own, what waits for a thumbs-up, and what never happens without you.
          </p>
          <ul className={s.points}>
            <li>
              <i aria-hidden><svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M4 10.5l4 4 8-9"/></svg></i>
              <div><h3>Approvals where you want them</h3><p>Start with everything needing your OK. Loosen the reins as you trust it. Change your mind any time.</p></div>
            </li>
            <li>
              <i aria-hidden><svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 5h14M3 10h14M3 15h9"/></svg></i>
              <div><h3>A record of everything</h3><p>Every text, email, invoice and change is logged. Who, what, when, and why. Nothing is a mystery.</p></div>
            </li>
            <li>
              <i aria-hidden><svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="4" y="9" width="12" height="8" rx="2"/><path d="M7 9V6a3 3 0 016 0v3"/></svg></i>
              <div><h3>Your accounts stay yours</h3><p>We connect to your software with limited permissions. Your money, your customers, your data. We never move funds.</p></div>
            </li>
            <li>
              <i aria-hidden><svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="10" cy="10" r="7"/><path d="M10 6v4l3 2"/></svg></i>
              <div><h3>A human watching</h3><p>Our team monitors the systems and steps in when something looks off. You're not alone with a robot.</p></div>
            </li>
          </ul>
        </Reveal>

        <Reveal delay={0.1}>
          <div className={s.log} role="img" aria-label="Example activity log showing automated actions and one item awaiting approval">
            <div className={s.logHead}><b>Rick's Plumbing · Activity</b><span className={s.live}>Live</span></div>
            {entries.map((e, i) => (
              <motion.div className={s.entry} key={e.title}
                initial={reduce ? false : { opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: .15 + i * .12, duration: .5 }}>
                <span className={s.time}>{e.t}</span>
                <div><b>{e.title}</b><small>{e.sub}</small></div>
                {e.pill === "approve" ? (
                  approved ? <span className={`${s.pill} ${s.ok}`}>Sent · approved by you</span> : (
                    <div className={s.approve}>
                      <button onClick={() => setApproved(true)}>Approve &amp; send</button>
                      <button type="button">Edit</button>
                    </div>
                  )
                ) : <span className={`${s.pill} ${s[e.kind]}`}>{e.pill}</span>}
              </motion.div>
            ))}
            <div className={s.foot}><span>Example data</span><span>Full log, exportable any time</span></div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
