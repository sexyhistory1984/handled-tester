"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Reveal from "./Reveal";
import s from "./Faq.module.css";

const faqs = [
  { q: "Do I have to switch software?", a: "No. We connect to what you already use: QuickBooks, Jobber, HubSpot, your calendar, your phone system. If you're running on a notebook and a Gmail account, we'll help you set up something simple first." },
  { q: "Is this AI? Will my customers be talking to a robot?", a: "Our systems do use AI for things like drafting a text or reading an email. But every message sounds like your business, follows rules you set, and anything sensitive waits for your approval. Customers always know they can reach a person, and our team watches everything." },
  { q: "What if it sends something wrong?", a: "Start with everything requiring your OK. As you get comfortable, let routine items run on their own. Every action is logged, and you can pause or undo any automation instantly. Our team is also monitoring, so mistakes get caught, not repeated." },
  { q: "Can you move money or pay bills for me?", a: "No. We never move funds. We send invoices and payment links through your existing payment processor, and money lands in your account like it always has. You stay in control of every dollar." },
  { q: "How long does setup take?", a: "Most businesses are live in 7 to 10 days. We connect your tools, learn how you quote and schedule, write your message templates with you, and run a week in approve-everything mode before loosening up." },
  { q: "What happens if I want to cancel?", a: "Month to month, cancel any time. Your data, customers and accounts were always yours, so nothing gets taken away. We turn the automations off and you're exactly where you were, minus the help." },
];

export default function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="section grain" aria-labelledby="faq-title" style={{ background: "var(--cream-2)" }}>
      <div className={`wrap ${s.layout}`}>
        <Reveal>
          <span className="eyebrow">Questions</span>
          <h2 id="faq-title" className="h-l">Straight answers.</h2>
          <p className="lead">Anything else, call us. A real person picks up.</p>
        </Reveal>
        <Reveal delay={0.1}>
          <div className={s.list}>
            {faqs.map((f, i) => {
              const isOpen = open === i;
              return (
                <div className={s.item} key={f.q}>
                  <button className={s.q} aria-expanded={isOpen} aria-controls={`faq-${i}`} id={`faq-q-${i}`} onClick={() => setOpen(isOpen ? null : i)}>
                    {f.q}
                    <i aria-hidden><svg width="14" height="14" viewBox="0 0 14 14" stroke="currentColor" strokeWidth="1.6"><path d="M7 1v12M1 7h12"/></svg></i>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div id={`faq-${i}`} role="region" aria-labelledby={`faq-q-${i}`} className={s.a}
                        initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: .45, ease: [0.22, 1, 0.36, 1] }}>
                        <p>{f.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
