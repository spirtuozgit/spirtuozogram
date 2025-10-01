import "./globals.css";
import "leaflet/dist/leaflet.css"; 
import { Rubik } from "next/font/google";
import GlobalPreload from "../components/GlobalPreload"; // 👈 добавили импорт

// подключаем Rubik через next/font
const rubik = Rubik({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "700"],
  variable: "--font-rubik",
});

export const metadata = {
  title: "SPIRTUOZGRAM",
  description: "Самая бесполезная информация на все случаи жизни",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body className={rubik.variable}>
        <GlobalPreload />   {/* 👈 вот тут добавили */}
        {children}
      </body>
    </html>
  );
}
