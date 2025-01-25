import "./globals.css";

export const metadata = {
  title: "Background remover - skiprez",
  description: "Remove background from images in seconds. No need to wait for hours or pay for expensive software. Just upload your image and download the result.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
