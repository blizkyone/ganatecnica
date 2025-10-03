import "./globals.css";
import Providers from "./providers";
import { Navbar } from "@/components/Navbar";

export const metadata = {
  title: "Ganatecnica",
  description: "Capacitacion y colocacion de personal obrero",
};

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Navbar />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
