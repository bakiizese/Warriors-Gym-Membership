import { config } from "../config";
import { contact } from "../content";

const column = "flex flex-col gap-3 text-sm";
const link = "text-muted transition hover:text-text";

export function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto grid max-w-[1200px] gap-12 px-5 py-16 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center overflow-hidden rounded-full bg-black ring-1 ring-white/15">
              <img src="/logo.webp" alt="" width={44} height={44} className="h-full w-full scale-[1.12] object-cover" />
            </span>
            <span className="font-display text-xl font-bold tracking-[0.14em]">WARRIORS GYM</span>
          </div>
          <p className="mt-5 max-w-sm leading-relaxed text-muted">
            A portfolio project by {contact.name}. The demo data is made up, so break whatever you like.
          </p>
        </div>

        <div>
          <p className="label mb-4">Project</p>
          <ul className={column}>
            <li>
              <a className={link} href={config.githubUrl} target="_blank" rel="noopener noreferrer">
                Source code
              </a>
            </li>
            <li>
              <a className={link} href={`${config.apiUrl}/docs`} target="_blank" rel="noopener noreferrer">
                API docs
              </a>
            </li>
            <li>
              <a className={link} href={`${config.githubUrl}/releases`} target="_blank" rel="noopener noreferrer">
                Android releases
              </a>
            </li>
          </ul>
        </div>

        <div>
          <p className="label mb-4">Get in touch</p>
          <ul className={column}>
            <li>
              <a className={link} href={contact.linkedin} target="_blank" rel="noopener noreferrer">
                LinkedIn
              </a>
            </li>
            <li>
              <a className={link} href={contact.github} target="_blank" rel="noopener noreferrer">
                GitHub
              </a>
            </li>
            <li>
              <a className={link} href={contact.telegram} target="_blank" rel="noopener noreferrer">
                Telegram
              </a>
            </li>
            <li>
              <a className={link} href={`mailto:${contact.email}`}>
                {contact.email}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-3 px-5 py-6 text-xs text-muted sm:px-8">
          <p>Built with Vite, React and Tailwind. Set in Jura and Inter.</p>
          <a href="#top" className="hover:text-text">
            Back to top ↑
          </a>
        </div>
      </div>
    </footer>
  );
}
