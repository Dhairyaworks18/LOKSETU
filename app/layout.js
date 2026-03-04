import { Inter, Sora } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata = {
  title: "LokSetu — Bridge to the People | India Civic Issue Reporting",
  description:
    "LokSetu (लोक से तु) is a civic issue reporting platform for citizens across India. Report potholes, broken streetlights, garbage, waterlogging, and more.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${sora.variable}`}>
      <body className="font-sora antialiased bg-page-bg text-charcoal">{children}</body>
    </html>
  );
}
