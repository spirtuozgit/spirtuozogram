"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";

export default function StoriesClient({ stories }) {
  const [selected, setSelected] = useState(null);

  return (
    <div className="min-h-screen bg-[#0e0e0e] text-[#f2f2f2] p-6 flex flex-col items-center">
      <h1 className="text-3xl font-light mb-10 tracking-wide">...</h1>

      <AnimatePresence mode="wait">
        {!selected && (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl w-full"
          >
            {stories.map((story) => (
              <motion.div
                key={story.id}
                whileHover={{ y: -4 }}
                className="border border-[#333] rounded-xl p-6 transition-all duration-300"
              >
                <h2 className="text-xl mb-2 font-medium">{story.title}</h2>
                <p className="text-sm text-[#aaa] mb-4">{story.date}</p>
                <p className="text-sm text-[#ddd] mb-6 leading-relaxed line-clamp-3">
                  {story.excerpt}
                </p>
                <button
                  onClick={() => setSelected(story)}
                  className="border border-[#555] px-4 py-2 rounded hover:bg-[#222] transition"
                >
                  Читать
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}

        {selected && (
          <motion.div
            key="reader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-3xl w-full text-left leading-relaxed text-[#eaeaea]"
          >
            <button
              onClick={() => setSelected(null)}
              className="text-sm text-[#aaa] mb-8 hover:text-white transition"
            >
              ← Назад
            </button>

            <h2 className="text-2xl font-medium mb-2">{selected.title}</h2>
            <p className="text-sm text-[#888] mb-6">{selected.date}</p>

            <div className="prose prose-invert prose-p:text-[#f2f2f2] prose-headings:text-[#fff] prose-strong:text-[#fff] prose-a:text-[#6ae3ff] prose-a:no-underline hover:prose-a:underline max-w-none text-[17px] leading-8 font-light">
              <ReactMarkdown>{selected.content}</ReactMarkdown>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
