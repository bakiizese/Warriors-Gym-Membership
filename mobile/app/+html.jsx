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
        <title>Warriors Gym - Member</title>
        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: wideScreenColumn }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

const wideScreenColumn = `
@media (min-width: 500px) {
  body { background: #0b0b0d; }
  #root { max-width: 430px; margin: 0 auto; box-shadow: 0 0 40px rgba(0, 0, 0, 0.6); }
}`;
