import { notes } from "../content";
import { Reveal } from "./Reveal";
import { SectionHead } from "./SectionHead";

export function Notes() {
  return (
    <section id="notes" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
        <Reveal>
          <SectionHead index="04" kicker="Straight talk" title="What is not real yet.">
            A demo should say where it cuts corners. These are mine.
          </SectionHead>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-2">
          {notes.map((note, i) => (
            <Reveal key={note.tag} delay={(i % 2) * 90} className="md:last:col-span-2">
              <div className="card h-full p-7">
                <p className="label !text-gold">{note.tag}</p>
                <h3 className="mt-2 text-2xl leading-tight">{note.title}</h3>
                <p className="mt-3 max-w-2xl leading-relaxed text-muted">{note.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
