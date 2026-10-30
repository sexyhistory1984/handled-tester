"use client";
import dynamic from "next/dynamic";
import { motion, useReducedMotion } from "framer-motion";
import s from "./Hero.module.css";

const Scene = dynamic(() => import("./Scene"), { ssr: false, loading: () => null });

const industries = ["Plumbing", "HVAC", "Electrical", "Landscaping", "Cleaning", "Roofing", "Painting", "Handyman", "Pest control", "Pressure washing", "General contracting"];

const lines: Array<{ text: string; accent?: boolean }> = [
  { text: "Less paperwork." },
  { text: "More paid work.", accent: true },
];

export default function Hero() {
  const reduce = useReducedMotion();
  const ease = [0.22, 1, 0.36, 1] as const;
  return (
    <section id="top" className={`dark ${s.hero}`} aria-labelledby="hero-title">
      <div className={`wrap ${s.inner}`}>
        <div className={s.copy}>
          <motion.span className="eyebrow" style={{ color: "var(--accent)" }}
            initial={reduce ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .7, ease }}>
            Managed office help for service businesses
          </motion.span>
          <h1 id="hero-title" className={`h-xl ${s.title}`}>
            {lines.map((l, i) => (
              <span className={s.line} key={l.text}>
                <motion.span style={{ display: "block" }} className={l.accent ? s.accent : undefined}
                  initial={reduce ? false : { y: "110%" }} animate={{ y: 0 }}
                  transition={{ duration: 1, delay: 0.1 + i * 0.12, ease }}>
                  {l.text}
                </motion.span>
              </span>
            ))}
          </h1>
          <motion.p className={s.lead}
            initial={reduce ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .9, delay: .45, ease }}>
            Handled runs the office side of your business. Quotes go out the same day, jobs land on the calendar,
            invoices get sent and chased. You keep doing the work. We help with the rest.
          </motion.p>
          <motion.div className={s.ctas}
            initial={reduce ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .9, delay: .6, ease }}>
            <a href="#start" className="btn btn-accent">Book a 15-minute call <span className="arrow">→</span></a>
            <a href="#how" className="btn btn-ghost">See how it works</a>
          </motion.div>
          <motion.div className={s.trust}
            initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: .9, delay: .85 }}>
            <div className={s.avatars} aria-hidden>
              <span>JR</span><span>MK</span><span>DL</span><span>+</span>
            </div>
            <p>Built for crews of <b>1 to 50</b>. Works with QuickBooks, Jobber, HubSpot and the tools you already use.</p>
          </motion.div>
        </div>

        <div className={s.stage} aria-hidden>
          <div className={s.orb} />
          <Scene />
          <span className={s.stageNote}>Your office, running while you work</span>
        </div>
      </div>

      <div className={s.scroll} aria-hidden><i />Scroll</div>

      <div className={s.marquee} aria-hidden>
        <div className={s.track}>
          {[0, 1].map((k) => (
            <span key={k}>{industries.map((n) => <span key={n + k}>{n}</span>)}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
