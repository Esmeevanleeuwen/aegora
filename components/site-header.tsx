"use client";

import { CircleUserRound, Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { BrandMark } from "./brand-mark";

type SiteHeaderProps = {
  active?: "home" | "library" | "basics" | "rights" | "question" | "account" | "about" | "network";
};

export function SiteHeader({ active = "home" }: SiteHeaderProps) {
  const [open, setOpen] = useState(false);

  return (
    <header className="site-header">
      <Link className="brand" href="/" aria-label="AEGORA homepage">
        <BrandMark />
      </Link>
      <nav id="site-navigation" className={open ? "nav-open" : ""} aria-label="Hoofdnavigatie">
        <Link aria-current={active === "library" ? "page" : undefined} href="/rechten" onClick={() => setOpen(false)}>Alle rechten</Link>
        <Link aria-current={active === "network" ? "page" : undefined} href="/rechten/verkennen" onClick={() => setOpen(false)}>Rechten verkennen</Link>
        <Link aria-current={active === "basics" ? "page" : undefined} href="/basisrechten" onClick={() => setOpen(false)}>Basisrechten</Link>
        <Link aria-current={active === "question" ? "page" : undefined} href="/vraag" onClick={() => setOpen(false)}>Vraag het de AI</Link>
        <Link aria-current={active === "about" ? "page" : undefined} href="/waarom-aegora" onClick={() => setOpen(false)}>Waarom Aegora</Link>
        <Link className="mobile-account-link" href="/account" onClick={() => setOpen(false)}>Mijn account</Link>
      </nav>
      <Link className="overview-button" aria-current={active === "account" ? "page" : undefined} href="/account">
        <CircleUserRound size={17} /> Mijn account
      </Link>
      <button
        className="menu-button"
        type="button"
        aria-label={open ? "Menu sluiten" : "Menu openen"}
        aria-expanded={open}
        aria-controls="site-navigation"
        onClick={() => setOpen((value) => !value)}
      >
        {open ? <X /> : <Menu />}
      </button>
    </header>
  );
}

