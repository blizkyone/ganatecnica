import "./globals.css";
import Providers from "./providers";
import { Navbar } from "@/components/Navbar";
import connectDB from "@/database";

export const metadata = {
  title: "Ganatecnica",
  description: "Capacitacion y colocacion de personal obrero",
};

export default async function RootLayout({ children }) {
  await connectDB();
  return (
    <html>
      <body>
        <Navbar />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
