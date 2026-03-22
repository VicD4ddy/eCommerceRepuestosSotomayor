import "@/index.css";
import { Providers } from "@/components/Providers";

export const metadata = {
  title: "Repuestos Sotomayor",
  description: "Encuentra la pieza exacta para tu vehículo.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
