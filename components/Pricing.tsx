import Reveal from "./Reveal";
import s from "./Pricing.module.css";

const tiers = [
  { name: "Solo", price: "249", setup: "$499 one-time setup", who: "Owner-operators and 1–3 person crews.", feats: ["Missed-call text back", "Same-day estimates & follow-up", "Invoicing synced to your books", "Payment reminders", "Morning rundown by text"], cta: "Start with Solo" },
  { name: "Crew", price: "549", setup: "$1,200 one-time setup", who: "Growing shops with 3–15 in the field.", feats: ["Everything in Solo", "Scheduling, confirmations & reminders", "Review requests & maintenance reminders", "Inbox triage", "Up to 3 software connections", "Approval rules per task"], cta: "Start with Crew", pop: true },
  { name: "Operation", price: "Custom", setup: "Scoped setup", who: "Multi-crew or multi-location businesses.", feats: ["Everything in Crew", "Custom integrations & business rules", "Dispatcher-style coordination", "Dedicated account lead", "Priority monitoring"], cta: "Talk to us" },
];

export default function Pricing() {
  return (
    <section id="pricing" className="section grain" aria-labelledby="pricing-title">
      <div className="wrap">
        <Reveal>
          <div className={s.head}>
            <span className="eyebrow">Pricing</span>
            <h2 id="pricing-title" className="h-l">Less than a part-time office hire. Works nights and weekends.</h2>
            <p className="lead" style={{ margin: "0 auto" }}>One setup fee to connect your tools and learn how you work. Then a flat monthly rate. No long contracts.</p>
          </div>
        </Reveal>
        <div className={s.grid}>
          {tiers.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.08}>
              <article className={`${s.tier} ${t.pop ? s.pop : ""}`} style={{ height: "100%" }}>
                {t.pop && <span className={s.badge}>Most popular</span>}
                <div>
                  <h3>{t.name}</h3>
                  <p className="muted" style={{ fontSize: 15, marginTop: 6 }}>{t.who}</p>
                </div>
                <div className={s.price}>
                  <b>{t.price === "Custom" ? "Custom" : `$${t.price}`}</b>
                  {t.price !== "Custom" && <span>/ month</span>}
                </div>
                <p className={s.setup}>{t.setup}</p>
                <ul className={s.feat}>{t.feats.map((f) => <li key={f}>{f}</li>)}</ul>
                <a href="#start" className={`btn ${t.pop ? "btn-accent" : "btn-ghost"}`} style={{ justifyContent: "center" }}>{t.cta}</a>
              </article>
            </Reveal>
          ))}
        </div>
        <p className={s.note}>Preview pricing for this test site. Final pricing depends on your tools and volume.</p>
      </div>
    </section>
  );
}
