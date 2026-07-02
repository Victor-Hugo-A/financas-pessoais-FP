import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Finanças Pessoais",
  description: "Controle de assinaturas, dívidas e valores a receber."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
