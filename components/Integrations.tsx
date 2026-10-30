import s from "./Integrations.module.css";

const tools = ["QuickBooks", "Jobber", "Housecall Pro", "ServiceTitan", "HubSpot", "Google Calendar", "Gmail", "Outlook", "Stripe", "Square", "Twilio", "RingCentral", "Slack", "Zapier", "Google Business Profile"];

export default function Integrations() {
  return (
    <section className={s.band} aria-labelledby="int-title">
      <div className="wrap">
        <div className={s.head}>
          <h2 id="int-title" className="h-m">Works with the tools you already pay for.</h2>
          <p>We connect to your software, we don't replace it. Availability varies by tool and plan.</p>
        </div>
      </div>
      <div className={s.marquee} aria-hidden>
        <div className={s.track}>
          {[0, 1].map((k) => tools.map((t) => <span className={s.logo} key={t + k}>{t}</span>))}
        </div>
      </div>
      <ul className="sr-only">{tools.map((t) => <li key={t}>{t}</li>)}</ul>
    </section>
  );
}
