import "./globals.css";
import { Rubik } from "next/font/google";

// подключаем Rubik через next/font
const rubik = Rubik({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "700"],
  variable: "--font-rubik", // сохраняем в CSS-переменную
});

export const metadata = {
  title: "SPIRTUOZOGRAM",
  description: "Минимальный стартовый проект",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body className={rubik.variable}>{children}</body>
    </html>
  );
}
