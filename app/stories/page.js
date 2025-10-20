import fs from "fs";
import path from "path";
import matter from "gray-matter";
import StoriesClient from "../../components/StoriesClient";

export const metadata = {
  title: "Stories — Spirtuozogram",
  description: "Коллекция рассказов, текстов и стихов Spirtuozogram",
};

export default async function StoriesPage() {
  // 📂 читаем md-файлы прямо из app/stories
  const storiesDir = path.join(process.cwd(), "app", "stories", "text");
  const files = fs
    .readdirSync(storiesDir)
    .filter((f) => f.endsWith(".md") && f !== "page.js");

  // 🧩 парсим каждый файл и формируем массив рассказов
  const stories = files.map((filename) => {
    const filePath = path.join(storiesDir, filename);
    const fileContent = fs.readFileSync(filePath, "utf8");
    const { data, content } = matter(fileContent);

    return {
      id: filename.replace(/\\.md$/, ""),
      title: data.title || "Без названия",
      date: data.date || "",
      excerpt: data.excerpt || content.slice(0, 120) + "...",
      content,
    };
  });

  // 🕒 сортировка по дате (новые — сверху)
  const sortedStories = stories.sort((a, b) => {
    const da = new Date(a.date);
    const db = new Date(b.date);
    return db - da;
  });

  // 🔄 передаём клиентскому компоненту
  return <StoriesClient stories={sortedStories} />;
}
