import { Architecture } from "./components/Architecture";
import { Bento } from "./components/Bento";
import { Footer } from "./components/Footer";
import { Hero } from "./components/Hero";
import { Nav } from "./components/Nav";
import { Notes } from "./components/Notes";
import { Stats } from "./components/Stats";
import { TryIt } from "./components/TryIt";

export default function App() {
  return (
    <div id="top" className="grain">
      <a
        href="#try"
        className="fixed left-4 top-4 z-[70] -translate-y-24 rounded-full bg-red px-4 py-2 font-display font-bold text-white focus:translate-y-0"
      >
        Skip to the demo
      </a>
      <Nav />
      <main>
        <Hero />
        <Stats />
        <TryIt />
        <Bento />
        <Architecture />
        <Notes />
      </main>
      <Footer />
    </div>
  );
}
