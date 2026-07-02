"use client";

import { useEffect, useMemo, useState } from "react";

const logoDomains: Array<[string, string]> = [
  ["netflix", "netflix.com"],
  ["spotify", "spotify.com"],
  ["chatgpt", "chatgpt.com"],
  ["openai", "openai.com"],
  ["crunchyroll", "crunchyroll.com"],
  ["globoplay", "globoplay.globo.com"],
  ["disney", "disneyplus.com"],
  ["star", "starplus.com"],
  ["prime", "primevideo.com"],
  ["amazon", "amazon.com"],
  ["youtube", "youtube.com"],
  ["hulu", "hulu.com"],
  ["max", "max.com"],
  ["hbo", "max.com"],
  ["paramount", "paramountplus.com"],
  ["deezer", "deezer.com"],
  ["apple", "apple.com"],
  ["icloud", "icloud.com"],
  ["google", "google.com"],
  ["microsoft", "microsoft.com"],
  ["office", "microsoft.com"],
  ["github", "github.com"],
  ["notion", "notion.so"],
  ["figma", "figma.com"],
  ["canva", "canva.com"],
  ["adobe", "adobe.com"],
  ["dropbox", "dropbox.com"],
  ["xbox", "xbox.com"],
  ["playstation", "playstation.com"],
  ["mercado livre", "mercadolivre.com.br"],
  ["mercadolivre", "mercadolivre.com.br"],
  ["nubank", "nubank.com.br"],
  ["ifood", "ifood.com.br"],
  ["uber", "uber.com"],
  ["claro", "claro.com.br"],
  ["vivo", "vivo.com.br"],
  ["tim", "tim.com.br"]
];

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function getInitials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "?"
  );
}

function guessDomain(name: string) {
  const normalizedName = normalize(name);
  const knownDomain = logoDomains.find(([keyword]) => normalizedName.includes(keyword))?.[1];

  if (knownDomain) return knownDomain;

  const slug = normalizedName
    .replace(/&/g, " e ")
    .replace(/\+/g, " plus ")
    .replace(/[^a-z0-9]+/g, "")
    .trim();

  if (!slug) return null;

  return `${slug}.com`;
}

export function SubscriptionLogo({ name }: { name: string }) {
  const [sourceIndex, setSourceIndex] = useState(0);
  const domain = useMemo(() => {
    return guessDomain(name);
  }, [name]);
  const sources = useMemo(() => {
    if (!domain) return [];

    return [
      `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
      `https://www.google.com/s2/favicons?domain=www.${domain}&sz=64`
    ];
  }, [domain]);

  useEffect(() => {
    setSourceIndex(0);
  }, [name]);

  if (!domain || sourceIndex >= sources.length) {
    return <span className="subscription-logo fallback">{getInitials(name)}</span>;
  }

  return (
    <span className="subscription-logo">
      <img
        alt=""
        height="28"
        src={sources[sourceIndex]}
        width="28"
        onError={() => setSourceIndex((current) => current + 1)}
      />
    </span>
  );
}
