import "./globals.css";
import "leaflet/dist/leaflet.css";
import { Rubik } from "next/font/google";
import GlobalPreload from "../components/GlobalPreload";
import LayoutClient from "../components/LayoutClient"; // 👈 клиентский обёртчик

// Подключаем шрифт Rubik
const rubik = Rubik({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "700"],
  variable: "--font-rubik",
});

export const metadata = {
  title: "SPIRTUOZGRAM",
  description: "",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body className={rubik.variable}>
        {/* глобальная предзагрузка ресурсов */}
        <GlobalPreload />
        {/* обёртка, которая работает на клиенте и управляет звуками */}
        <LayoutClient>{children}</LayoutClient>
      </body>
    </html>
  );
}
