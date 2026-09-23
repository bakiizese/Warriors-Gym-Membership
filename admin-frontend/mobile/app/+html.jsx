import { ScrollViewStyleReset } from "expo-router/html";

// Web-only HTML shell (phones never load this). On a wide window the app is
// shown as a centred phone-width column instead of stretching across the screen.
export default function Root({ children }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        <title>Warriors Gym - Admin</title>
        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: wideScreenColumn }} />
      </head>
      <body>
        {/* Only shown on a wide window, one on each side of the frame: real
            phone navigation doesn't apply to a web page, so say so. */}
        <div className="frame-note">
          You're using a phone app inside a browser tab. Navigate with the
          app's own back arrow and buttons
        </div>
        {/* The app (#root, inside `children`) renders at its real, native
            size and is visually scaled down as a whole to fit the window —
            the same trick DevTools' device toolbar uses — instead of resizing
            the box the app lives in, which the app's own fixed-px layout
            can't react to. This wrapper carries the bezel; #root does not. */}
        <div id="phone-stage">{children}</div>
        <div className="frame-note">
          your browser's back/forward button doesn't know about the app's
          screens and can leave it stuck.
        </div>
      </body>
    </html>
  );
}

const wideScreenColumn = `
/* #root expects to be a direct child of body and sized by the height:100%
   reset above. Wrapping it in #phone-stage for the desktop frame broke that
   below 700px, where #phone-stage has no other rule and defaults to an
   auto-height block, so #root's height:100% resolved to nothing and every
   flex-1 chain in the app collapsed. This keeps #root's real, native mobile
   rendering working; the media query below overrides it for the frame. */
#phone-stage {
  height: 100%;
}
@media (min-width: 700px) {
  body {
    background: #0b0b0d;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
  }
  #phone-stage {
    /* 1 on a tall enough window, otherwise however much the window's height
       (minus 80px of breathing room) is short of the design's 950px. */
    --fit: min(1, calc((100vh - 80px) / 900px));
    position: relative;
    width: calc(500px * var(--fit));
    height: calc(950px * var(--fit));
    border: 9px solid #1a1a1a;
    border-radius: 64px;
    overflow: hidden;
    box-shadow: 0 0 40px rgba(0, 0, 0, 0.6);
  }
  #root {
    width: 480px;
    height: 900px;
    box-sizing: border-box;
    // padding: 44px 0px 0px;
    transform: scale(var(--fit));
    transform-origin: top left;
  }
  /* The pill-shaped camera/speaker cutout. */
  #phone-stage::before {
    content: "";
    position: absolute;
    top: 14px;
    left: 50%;
    transform: translateX(-50%);
    width: 90px;
    height: 18px;
    background: #1a1a1a;
    border-radius: 999px;
    z-index: 10;
  }
  /* The status bar: time, signal, wifi, battery. Stretches to the frame's
     width, so the same SVG works at any size; the empty middle of the design
     leaves room for the pill above without the two overlapping. */
  #phone-stage::after {
    content: "";
    position: absolute;
    top: 10px;
    left: 16px;
    right: 16px;
    height: 18px;
    z-index: 9;
    pointer-events: none;
    background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 350 18'%3E%3Ctext x='4' y='13' font-family='-apple-system,Helvetica,Arial,sans-serif' font-size='13' font-weight='600' fill='white'%3E9:41%3C/text%3E%3Crect x='270' y='8' width='3.2' height='5' rx='1' fill='white'/%3E%3Crect x='275' y='6' width='3.2' height='7' rx='1' fill='white'/%3E%3Crect x='280' y='4' width='3.2' height='9' rx='1' fill='white'/%3E%3Crect x='285' y='2' width='3.2' height='11' rx='1' fill='white'/%3E%3Cpath d='M291 8c5-5 13-5 18 0' stroke='white' stroke-width='1.6' fill='none' stroke-linecap='round'/%3E%3Cpath d='M295 11c3-2.5 7-2.5 10 0' stroke='white' stroke-width='1.6' fill='none' stroke-linecap='round'/%3E%3Ccircle cx='300' cy='13.5' r='1.1' fill='white'/%3E%3Crect x='314' y='2' width='24' height='11' rx='2.5' stroke='white' stroke-width='1.3' fill='none'/%3E%3Crect x='316' y='4' width='17' height='7' rx='1' fill='white'/%3E%3Crect x='339' y='5' width='2' height='5' rx='1' fill='white'/%3E%3C/svg%3E") no-repeat left center;
    background-size: 100% 100%;
    filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.5));
  }
}
.frame-note {
  display: none;
}
/* Only shown once there's real room on both sides of the frame at once, so
   it never crowds it. */
@media (min-width: 1250px) {
  body {
    gap: 32px;
  }
  .frame-note {
    display: block;
    max-width: 320px;
    color: rgba(255, 255, 255, 0.85);
    font-family: -apple-system, Helvetica, Arial, sans-serif;
    font-size: 24px;
    font-weight: 600;
    line-height: 1.45;
  }
}`;
