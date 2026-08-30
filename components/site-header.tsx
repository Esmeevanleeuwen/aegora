"use client";

import { Menu, UserRound, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { BrandMark } from "./brand-mark";

type SiteHeaderProps = {
  active?: "home" | "basics" | "rights" | "question";
};

export function SiteHeader({ active = "home" }: SiteHeaderProps) {
  const [open, setOpen] = useState(false);

  return (
    <header className="site-header">
      <Link className="brand" href="/" aria-label="RECHT NU homepage">
        <BrandMark />
        <span>RECHT NU</span>
      </Link>
      <nav className={open ? "nav-open" : ""} aria-label="Hoofdnavigatie">
        <Link aria-current={active === "basics" ? "page" : undefined} href="/basisrechten" onClick={() => setOpen(false)}>Basisrechten</Link>
        <Link aria-current={active === "rights" ? "page" : undefined} href="/mijn-rechten" onClick={() => setOpen(false)}>Mijn rechten</Link>
        <Link aria-current={active === "question" ? "page" : undefined} href="/vraag" onClick={() => setOpen(false)}>Vraag het de AI</Link>
        <Link href="/#bronnen" onClick={() => setOpen(false)}>Bronnen</Link>
        <Link href="/#werking" onClick={() => setOpen(false)}>Hoe het werkt</Link>
      </nav>
      <Link className="overview-button" href="/mijn-rechten">
        <UserRound size={17} /> Mijn overzicht
      </Link>
      <button
        className="menu-button"
        type="button"
        aria-label={open ? "Menu sluiten" : "Menu openen"}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? <X /> : <Menu />}
      </button>
    </header>
  );
}
