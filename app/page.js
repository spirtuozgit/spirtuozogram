import Link from "next/link";

export default function Home() {
  const pages = [
    {
      title: "Синхронизация с котом",
      href: "/manvscat",
      desc: "Человек и кот в одном ритме",
    },
    {
      title: "Насколько сегодня пятница",
      href: "/socks",
      desc: "Тепловая карта носков по квартире",
    },
    {
      title: "Ты конь?",
      href: "/weekend",
      desc: "График счастья по дням недели",
    },
  ];

  return (
    <main className="min-h-screen flex flex-col items-center p-12">
      {/* Заголовок */}
      <h1 className="text-5xl font-bold mb-12 tracking-wide">
        SPIRTUOZOGRAM
      </h1>

      {/* Плитки */}
      <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl w-full">
        {pages.map((page) => (
          <Link
            key={page.href}
            href={page.href}
            className="border border-gray-800 rounded-xl p-6 shadow-lg bg-gray-900 hover:bg-gray-800 hover:shadow-xl transition"
          >
            <h2 className="text-2xl font-semibold mb-2">{page.title}</h2>
            <p className="text-gray-400 text-sm">{page.desc}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
