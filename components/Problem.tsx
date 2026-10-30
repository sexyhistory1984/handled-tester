import Reveal from "./Reveal";
import s from "./Problem.module.css";

const pains = [
  { n: "01", tag: "Mornings", title: "Calls you can't take", body: "You're under a sink. The phone rings twice, goes to voicemail, and that customer calls the next guy." },
  { n: "02", tag: "Afternoons", title: "Quotes that wait", body: "You walked the job on Tuesday. The estimate goes out Friday, if you remember. Most of them went cold." },
  { n: "03", tag: "Evenings", title: "Invoices that wait longer", body: "Work's done, money isn't in. Writing it up, sending it, chasing it. That's your night, three nights a week." },
];

export default function Problem() {
  return (
    <section className="section grain" aria-labelledby="problem-title">
      <div className="wrap">
        <div className={s.head}>
          <Reveal>
            <span className="eyebrow">Sound familiar?</span>
            <h2 id="problem-title" className="h-l">You're on a job.<br />Your office isn't.</h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className={s.story}>
              Picture a plumber with three guys. He spends the day on jobs, driving, picking up parts, answering what he can.
              Then he gets home and the <b>real second shift</b> starts: estimates, invoices, the schedule, the messages he missed.
              He doesn't want another app. He doesn't want another hire. <b>He wants the office handled.</b>
            </p>
          </Reveal>
        </div>

        <div className={s.cards}>
          {pains.map((p, i) => (
            <Reveal key={p.n} delay={i * 0.08}>
              <article className={s.card}>
                <span className={s.tag}>{p.tag}</span>
                <div className={s.num} aria-hidden>{p.n}</div>
                <div>
                  <h3>{p.title}</h3>
                  <p>{p.body}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.1}>
          <div className={s.after}>
            <p>With Handled, the call gets answered, the quote goes out today, and the invoice sends itself. <em>You get your evenings back.</em></p>
            <a href="#how" className="btn btn-ghost">See what that looks like</a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
