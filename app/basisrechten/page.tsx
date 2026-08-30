"use client";

import {
  Accessibility,
  ArrowRight,
  Check,
  Church,
  ExternalLink,
  HeartHandshake,
  IdCard,
  MessageCircleQuestion,
  PersonStanding,
  Scale,
  ShieldCheck,
  Users,
  Vote,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { basicRights, type BasicRightId } from "@/lib/basic-rights-data";

const iconByRight = {
  religie: Church,
  geslacht: PersonStanding,
  ras: Users,
  "seksuele-gerichtheid": HeartHandshake,
  handicap: Accessibility,
  "politieke-overtuiging": Vote,
  "overige-gronden": IdCard,
} satisfies Record<BasicRightId, typeof Church>;

export default function BasicRightsPage() {
  const [selected, setSelected] = useState<BasicRightId | "alles">("alles");
  const visibleRights = selected === "alles"
    ? basicRights
    : basicRights.filter((right) => right.id === selected);

  return (
    <main className="basic-rights-page">
      <SiteHeader active="basics" />

      <section className="basic-rights-hero">
        <div>
          <span className="eyebrow"><ShieldCheck size={15} /> Basisrechten in Nederland</span>
          <h1>Dezelfde rechten.<br /><em>Voor iedereen.</em></h1>
          <p>
            Bekijk eenvoudig welke bescherming hoort bij religie, geslacht, gender,
            ras, seksuele gerichtheid, handicap en andere kenmerken.
          </p>
        </div>
        <aside className="equal-rights-note">
          <Scale size={26} />
          <div>
            <strong>Je identiteit verandert de regel niet</strong>
            <p>Deze bescherming geldt ook als je wit, man, hetero, gelovig of juist niet gelovig bent.</p>
          </div>
        </aside>
      </section>

      <section className="basic-rights-content">
        <div className="basic-filter-wrap">
          <span>Kies een onderwerp</span>
          <div className="basic-filter" role="group" aria-label="Filter basisrechten">
            <button type="button" className={selected === "alles" ? "active" : ""} aria-pressed={selected === "alles"} onClick={() => setSelected("alles")}>Alles</button>
            {basicRights.map((right) => (
              <button type="button" key={right.id} className={selected === right.id ? "active" : ""} aria-pressed={selected === right.id} onClick={() => setSelected(right.id)}>{right.shortLabel}</button>
            ))}
          </div>
        </div>

        <div className="basic-rights-grid">
          {visibleRights.map((right) => {
            const Icon = iconByRight[right.id];
            return (
              <article className="basic-right-card" key={right.id}>
                <div className={`basic-right-icon basic-right-icon-${right.id}`}><Icon size={22} /></div>
                <div className="basic-right-main">
                  <span className="basic-status"><Check size={13} /> Wettelijk beschermd</span>
                  <h2>{right.title}</h2>
                  <p>{right.summary}</p>

                  <div className="basic-card-columns">
                    <section>
                      <h3>Dit mag je verwachten</h3>
                      <ul>{right.protectedRights.map((item) => <li key={item}>{item}</li>)}</ul>
                    </section>
                    <section>
                      <h3>Waar speelt dit vaak?</h3>
                      <div className="area-tags">{right.commonAreas.map((area) => <span key={area}>{area}</span>)}</div>
                    </section>
                  </div>

                  <div className="basic-boundary"><strong>Belangrijke grens</strong><p>{right.boundary}</p></div>
                  <a href={right.sourceUrl} target="_blank" rel="noreferrer">{right.sourceTitle}<ExternalLink size={13} /></a>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="speech-explainer">
        <div>
          <span className="eyebrow">Vrijheid én bescherming</span>
          <h2>Niet iedere harde mening<br />is verboden.</h2>
        </div>
        <div className="speech-rules">
          <article><span>01</span><div><strong>Een mening mag schuren</strong><p>Kritiek op religie, genderbeleid, feminisme of politieke ideeën is niet automatisch strafbaar.</p></div></article>
          <article><span>02</span><div><strong>Het label beslist niet</strong><p>Dat iemand iets racistisch, seksistisch of transfoob noemt, bepaalt juridisch nog niet of het verboden is.</p></div></article>
          <article><span>03</span><div><strong>De concrete grens telt</strong><p>Bedreiging, smaad, verboden uitsluiting en aanzetten tot haat, discriminatie of geweld kunnen wel verboden zijn.</p></div></article>
        </div>
      </section>

      <section className="basic-cta">
        <div><MessageCircleQuestion size={24} /><div><strong>Twijfel je wat in jouw situatie geldt?</strong><p>Beschrijf wat er gebeurde. Je hoeft het juiste wetsartikel niet te kennen.</p></div></div>
        <Link href="/vraag">Stel je vraag <ArrowRight size={17} /></Link>
      </section>

      <p className="basic-source-date">Bronnen gecontroleerd op 30 augustus 2026. Algemene informatie, geen definitief juridisch oordeel.</p>
    </main>
  );
}
