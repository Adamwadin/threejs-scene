import { Geist, Geist_Mono } from "next/font/google";
import Header from "./components/header";
import Footer from "./components/footer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "3D moooon",
  description: "mon",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>
        <Header />
        <main
          style={{
            minHeight: "calc(100vh - 160px)",
            padding: "2rem",
            textAlign: "center",
          }}
        >
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
