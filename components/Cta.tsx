"use client";
import { FormEvent, useState } from "react";
import Reveal from "./Reveal";
import s from "./Cta.module.css";

export default function Cta() {
  const [sent, setSent] = useState(false);
  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // Preview site: no backend wired yet. Show the success state only.
    setSent(true);
  }
  return (
    <section id="start" className={`section dark ${s.cta}`} aria-labelledby="cta-title">
      <div className={`wrap ${s.layout}`}>
        <Reveal>
          <span className="eyebrow" style={{ color: "var(--accent)" }}>Let's talk</span>
          <h2 id="cta-title" className="h-xl" style={{ fontSize: "clamp(44px, 6vw, 92px)" }}>Get your <em>evenings</em> back.</h2>
          <p style={{ fontSize: 20, color: "rgba(244,239,230,.74)", maxWidth: "46ch" }}>
            Fifteen minutes. Tell us how your business runs today. We'll tell you exactly what we'd take off your plate, what it costs, and how fast.
          </p>
          <div className={s.meta}>
            <p><b>No pitch deck.</b> A conversation with someone who's worked with contractors.</p>
            <p><b>No commitment.</b> If we're not a fit, we'll say so and point you somewhere useful.</p>
            <p><b>Live in about 10 days</b> if you decide to go ahead.</p>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <form className={s.form} onSubmit={onSubmit} aria-label="Book a call">
            {sent ? (
              <div className={s.done} role="status">
                <i aria-hidden><svg width="26" height="26" viewBox="0 0 26 26" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M5 13.5l5 5L21 7.5"/></svg></i>
                <h3>Got it. We'll be in touch.</h3>
                <p className="muted">This is a preview site, so nothing was actually sent yet. On the live site you'd hear from us within one business day.</p>
              </div>
            ) : (
              <>
                <h3>Book your 15-minute call</h3>
                <div className={s.row}>
                  <label className={s.field}>Your name<input name="name" required autoComplete="name" placeholder="Rick Alvarez" /></label>
                  <label className={s.field}>Business<input name="business" required autoComplete="organization" placeholder="Rick's Plumbing" /></label>
                </div>
                <div className={s.row}>
                  <label className={s.field}>Trade
                    <select name="trade" defaultValue="">
                      <option value="" disabled>Choose one</option>
                      {["Plumbing", "HVAC", "Electrical", "Landscaping", "Cleaning", "General contracting", "Roofing", "Painting", "Handyman", "Pest control", "Pressure washing", "Other"].map((t) => <option key={t}>{t}</option>)}
                    </select>
                  </label>
                  <label className={s.field}>Crew size
                    <select name="size" defaultValue="1-3">
                      {["Just me", "1-3", "4-10", "11-25", "25+"].map((t) => <option key={t}>{t}</option>)}
                    </select>
                  </label>
                </div>
                <label className={s.field}>Best phone or email<input name="contact" required placeholder="(555) 555-0142 or you@business.com" /></label>
                <label className={s.field}>What eats your evenings? <span style={{ fontWeight: 400, color: "var(--gray)" }}>(optional)</span><textarea name="msg" placeholder="Estimates pile up, invoices go out late, I miss calls on jobs..." /></label>
                <button className="btn btn-accent" type="submit" style={{ justifyContent: "center", marginTop: 6 }}>Book my call <span className="arrow">→</span></button>
                <p className={s.fine}>We'll only use this to set up your call. No newsletters, no spam.</p>
              </>
            )}
          </form>
        </Reveal>
      </div>
    </section>
  );
}
