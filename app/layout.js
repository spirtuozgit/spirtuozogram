import "./globals.css";
import { Rubik } from "next/font/google";
import ProgressBar from "./progress-bar"; // клиентский компонент

/* Подключаем шрифт Rubik */
const rubik = Rubik({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "700"],
  variable: "--font-rubik",
});

export const metadata = {
  title: "SPIRTUOZOGRAM",
  description: "Минимальный стартовый проект",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body className={rubik.variable}>
        <ProgressBar />
        {children}
      </body>
    </html>
  );
}
