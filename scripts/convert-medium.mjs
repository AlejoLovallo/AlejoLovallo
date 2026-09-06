#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const RAW_DIR = "/tmp/medium-raw/posts";
const OUT_DIR = path.join(process.cwd(), "content/posts");

const LISTS = {
  "fonder-ai-treasury": {
    title: "Fonder / AI Treasury",
    description:
      "Building the AI Treasurer — multi-tenancy, agentic payments, and treasury for LATAM SMBs.",
  },
  "blockchain-crypto": {
    title: "Blockchain / Crypto",
    description:
      "ERCs, account abstraction, and Proof of Build — notes from the chain.",
  },
  reflections: {
    title: "Reflections",
    description:
      "Personal takes on AI platforms, operating systems, and where value accrues.",
  },
};

const MANIFEST = [
  {
    file: "01-the-trust-tax-628459cdc970.md",
    slug: "the-trust-tax",
    list: "fonder-ai-treasury",
  },
  {
    file: "02-designing-for-scale-security-and-trust-our-path-to-multi-ten.md",
    slug: "path-to-multi-tenancy-at-fonder",
    list: "fonder-ai-treasury",
  },
  {
    file: "03-de-una-pyme-para-otra-s-pyme-4aab8ef3df6d.md",
    slug: "de-una-pyme-para-otras-pyme",
    list: "fonder-ai-treasury",
  },
  {
    file: "04-repensando-la-tesorer%C3%ADa-con-ia-en-latam-c0dc75c093ab.md",
    slug: "repensando-la-tesoreria-con-ia-en-latam",
    list: "fonder-ai-treasury",
  },
  {
    file: "05-the-smb-ai-paradox-the-more-trust-you-earn-the-more-ai-custo.md",
    slug: "the-smb-ai-paradox",
    list: "fonder-ai-treasury",
  },
  {
    file: "06-agentic-payments-need-judgment-not-just-automation-dc9843efb.md",
    slug: "agentic-payments-need-judgment",
    list: "fonder-ai-treasury",
  },
  {
    file: "07-nvidia-starts-it-ais-operating-system-moment-8331771df350.md",
    slug: "nvidia-ais-operating-system-moment",
    list: "reflections",
  },
  {
    file: "08-agents-are-smart-state-machines-88ad01c308c1.md",
    slug: "agents-are-smart-state-machines",
    list: "fonder-ai-treasury",
  },
  {
    file: "09-open-finance-argentina-011a6090f61d.md",
    slug: "open-finance-en-argentina",
    list: "fonder-ai-treasury",
  },
  {
    file: "10-resi-proof-of-build-distribution-075340b35c5d.md",
    slug: "resi-proof-of-build-distribution",
    list: "blockchain-crypto",
  },
  {
    file: "11-eoa.md",
    slug: "eoa-as-smart-wallet-eip-7702",
    list: "blockchain-crypto",
  },
  {
    file: "12-erc-2771.md",
    slug: "forgotten-ercs-erc-2771",
    list: "blockchain-crypto",
  },
  {
    file: "13-the-forgotten-ercs-eips-erc-2612-48cf0661da6d.md",
    slug: "forgotten-ercs-erc-2612",
    list: "blockchain-crypto",
  },
  {
    file: "14-the-forgotten-ercs-eips-eip-712-bb7a98fef408.md",
    slug: "forgotten-ercs-eip-712",
    list: "blockchain-crypto",
  },
  {
    file: "15-resi-vaults.md",
    slug: "resi-proof-of-build-vaults",
    list: "blockchain-crypto",
  },
];

function extractMeta(raw) {
  const title = (raw.match(/^Title:\s*(.+)$/m) || [])[1]?.trim();
  const url = (raw.match(/^URL Source:\s*(.+)$/m) || [])[1]?.trim();
  const published = (raw.match(/^Published Time:\s*(.+)$/m) || [])[1]?.trim();
  const bodyStart = raw.indexOf("Markdown Content:");
  const body = bodyStart >= 0 ? raw.slice(bodyStart + "Markdown Content:".length) : raw;
  return { title, url, published, body };
}

function cleanBody(body) {
  let text = body.trim();
  const dropLine = (l) => {
    const t = l.trim();
    if (!t) return false;
    if (/^\[!\[Image/.test(t)) return true;
    if (/^!\[Image/.test(t)) return true;
    if (/^Press enter or click/i.test(t)) return true;
    if (/^\d+ min read$/i.test(t)) return true;
    if (/^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d/i.test(t))
      return true;
    if (/^Share$/i.test(t)) return true;
    if (/^Sign up$/i.test(t)) return true;
    if (/^Get app$/i.test(t)) return true;
    if (/^--+$/.test(t)) return true;
    if (/^Listen$/i.test(t)) return true;
    if (/^Get Alejo Lovallo/i.test(t)) return true;
    if (/^Join Medium for free/i.test(t)) return true;
    if (/^Remember me for faster/i.test(t)) return true;
    if (/^Follow$/i.test(t)) return true;
    if (t === "Alejo Lovallo") return true;
    return false;
  };

  const lines = text.split("\n");
  const kept = [];
  let skippingInbox = false;
  for (const line of lines) {
    if (/Get Alejo Lovallo.?s stories in your inbox/i.test(line)) {
      skippingInbox = true;
      continue;
    }
    if (skippingInbox) {
      if (/^## /.test(line) || /^# /.test(line) || line.startsWith("— ")) {
        skippingInbox = false;
      } else {
        continue;
      }
    }
    if (dropLine(line)) continue;
    kept.push(line);
  }

  text = kept.join("\n");
  // Remove trailing author / publication blocks
  text = text.replace(/\n## Written by[\s\S]*$/i, "");
  text = text.replace(/\n## Published in[\s\S]*$/i, "");
  text = text.replace(/\n{3,}/g, "\n\n").trim();
  return text;
}

function yamlEscape(s) {
  return JSON.stringify(s ?? "");
}

function toDate(published, body) {
  if (published) {
    const d = new Date(published);
    if (!Number.isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  }
  const m = body.match(
    /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2},?\s+\d{4}\b/,
  );
  if (m) {
    const d = new Date(m[0]);
    if (!Number.isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  }
  return "2024-01-01";
}

function excerptFrom(body) {
  const plain = body
    .replace(/^#+\s+.+$/gm, "")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[[^\]]*\]\([^)]*\)/g, "$1")
    .replace(/[*_`>#]/g, "")
    .replace(/\n+/g, " ")
    .trim();
  if (plain.length <= 180) return plain;
  return plain.slice(0, 180).replace(/\s+\S*$/, "") + "…";
}

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(
  path.join(process.cwd(), "content/lists.json"),
  JSON.stringify(LISTS, null, 2) + "\n",
);

let count = 0;
for (const meta of MANIFEST) {
  const src = path.join(RAW_DIR, meta.file);
  if (!fs.existsSync(src)) {
    console.warn("missing", meta.file);
    continue;
  }
  const raw = fs.readFileSync(src, "utf8");
  const { title: scrapedTitle, url, published, body: rawBody } = extractMeta(raw);
  const body = cleanBody(rawBody);
  const title = scrapedTitle || meta.slug;
  const date = toDate(published, rawBody);
  const excerpt = excerptFrom(body);
  const mdx = `---
title: ${yamlEscape(title)}
date: ${date}
list: ${meta.list}
excerpt: ${yamlEscape(excerpt)}
mediumUrl: ${yamlEscape(url || "")}
---

${body}
`;
  fs.writeFileSync(path.join(OUT_DIR, `${meta.slug}.mdx`), mdx);
  console.log("wrote", meta.slug, date, meta.list, body.length);
  count++;
}
console.log(`Converted ${count} posts`);
