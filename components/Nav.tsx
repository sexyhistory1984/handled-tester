"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import s from "./Nav.module.css";

const links = [
  ["How it works", "#how"],
  ["What we handle", "#handle"],
  ["Control", "#control"],
  ["Pricing", "#pricing"],
  ["FAQ", "#faq"],
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      <header className={`${s.nav} ${scrolled ? s.scrolled : ""}`}>
        <div className={`wrap ${s.inner}`}>
          <a href="#top" className={s.logo} aria-label="Handled home">Handled<i aria-hidden /></a>
          <nav className={s.links} aria-label="Primary">
            {links.map(([label, href]) => <a key={href} href={href}>{label}</a>)}
          </nav>
          <a href="#start" className={`btn btn-accent ${s.cta}`}>Book a 15-min call</a>
          <button className={s.burger} aria-label="Open menu" onClick={() => setOpen(true)}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 6h14M3 10h14M3 14h14"/></svg>
          </button>
        </div>
      </header>
      <AnimatePresence>
        {open && (
          <motion.div className={s.sheet} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            <button className={s.close} aria-label="Close menu" onClick={() => setOpen(false)}>
              <svg width="18" height="18" viewBox="0 0 18 18" stroke="currentColor" strokeWidth="1.8"><path d="M3 3l12 12M15 3L3 15"/></svg>
            </button>
            {links.map(([label, href], i) => (
              <motion.a key={href} href={href} onClick={() => setOpen(false)}
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }}>
                {label}
              </motion.a>
            ))}
            <a href="#start" onClick={() => setOpen(false)} className="btn btn-accent" style={{ alignSelf: "flex-start", marginTop: 12, fontSize: 18 }}>Book a 15-min call</a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
