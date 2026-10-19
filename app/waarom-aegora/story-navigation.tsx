"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import styles from "./waarom.module.css";

type StoryChapter = {
  id: string;
  title: string;
  shortTitle: string;
};

type StoryNavigationProps = {
  chapters: StoryChapter[];
};

export function StoryNavigation({ chapters }: StoryNavigationProps) {
  const [activeId, setActiveId] = useState(chapters[0]?.id ?? "");
  const mobileContents = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    let frame: number | null = null;

    const updateActiveChapter = () => {
      frame = null;
      let nextId = chapters[0]?.id ?? "";

      for (const chapter of chapters) {
        const section = document.getElementById(chapter.id);

        const readingOffset = section
          ? Math.max(150, Number.parseFloat(window.getComputedStyle(section).scrollMarginTop) + 2)
          : 150;

        if (section && section.getBoundingClientRect().top <= readingOffset) {
          nextId = chapter.id;
        }
      }

      setActiveId((currentId) => currentId === nextId ? currentId : nextId);
    };

    const scheduleUpdate = () => {
      if (frame === null) {
        frame = window.requestAnimationFrame(updateActiveChapter);
      }
    };

    scheduleUpdate();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    window.addEventListener("hashchange", scheduleUpdate);
    window.addEventListener("popstate", scheduleUpdate);

    return () => {
      if (frame !== null) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      window.removeEventListener("hashchange", scheduleUpdate);
      window.removeEventListener("popstate", scheduleUpdate);
    };
  }, [chapters]);

  const currentChapter = chapters.find((chapter) => chapter.id === activeId) ?? chapters[0];

  const chapterLinks = (closeOnSelect = false) => (
    <ol>
      {chapters.map((chapter, index) => (
        <li key={chapter.id}>
          <a
            href={`#${chapter.id}`}
            className={activeId === chapter.id ? styles.contentsActive : undefined}
            aria-current={activeId === chapter.id ? "location" : undefined}
            onClick={closeOnSelect ? () => {
              if (mobileContents.current) mobileContents.current.open = false;
            } : undefined}
          >
            <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
            {chapter.title}
          </a>
        </li>
      ))}
    </ol>
  );

  return (
    <>
      <div className={styles.contentsDesktop}>
        <nav className={styles.contentsNav} aria-label="Op deze pagina">
          <p className={styles.contentsLabel}>In dit verhaal</p>
          {chapterLinks()}
        </nav>
      </div>

      <details ref={mobileContents} className={styles.contentsMobile}>
        <summary>
          Op deze pagina
          <span>{currentChapter?.shortTitle}</span>
          <ChevronDown size={17} aria-hidden="true" />
        </summary>
        <nav className={styles.contentsNav} aria-label="Op deze pagina mobiel">
          {chapterLinks(true)}
        </nav>
      </details>
    </>
  );
}
