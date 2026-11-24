import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gale Dorada | Detalles que hacen especial cada momento",
  description: "Descubre Gale Dorada: detalles especiales para regalar y celebrar."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es"><body>{children}</body></html>;
}