import s from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={s.foot}>
      <div className="wrap">
        <div className={s.top}>
          <div>
            <span className={s.logo}>Handled<i aria-hidden /></span>
            <p className={s.tag}>Managed office help for service businesses. You handle the work. We help handle the office.</p>
          </div>
          <div className={s.col}>
            <h4>Company</h4>
            <a href="#how">How it works</a><a href="#handle">What we handle</a><a href="#pricing">Pricing</a><a href="#faq">FAQ</a>
          </div>
          <div className={s.col}>
            <h4>Trades</h4>
            <a href="#start">Plumbing</a><a href="#start">HVAC</a><a href="#start">Electrical</a><a href="#start">Landscaping</a><a href="#start">Cleaning</a>
          </div>
          <div className={s.col}>
            <h4>Talk to us</h4>
            <a href="#start">Book a call</a><a href="mailto:hello@tester.famemaker.app">hello@tester.famemaker.app</a>
          </div>
        </div>
        <div className={s.bottom}>
          <span>© 2026 Handled. Preview site.</span>
          <span>Product names belong to their owners. Integration availability varies.</span>
        </div>
      </div>
    </footer>
  );
}
