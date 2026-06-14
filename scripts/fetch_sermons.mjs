import { writeFileSync } from "node:fs";

// Unique video IDs in the order Don supplied them (dPl2oz0O65Y already deduped).
const IDS = [
  "jVlACvRpVOI","GBYV6O3sh9s","HEs47Wn4rhY","iL6isfFyVVY","y7wjUNGQIdQ",
  "MLm7il6Uk4g","dPl2oz0O65Y","R-drmtDebps",
  "EOUN-5Y0j9A","-jXqUOdr-OM","du_vFW738nI","l958yoemoy8","KgvFvw9XAmk","ZFiUmn35-zc",
  "iuNGg-YXajM","w4h6O-YtBbA","22SW87w4IoE","zmzmNn19_yo","A57VnLJO-LU",
  "ZpNPgDE4wjU","U5BlO9X5vBw","R1UwUhxj4-s","3_yv4fpy_Kw",
  "66LYKyFTErk","Lc3rFWyxbD4","lzhuPs9Vj5c","_dmTOc-gcCc","PoYtXjGFj7g","vprdkqTC1Yo","wcJAUYcRgSM",
];

const UA = "Mozilla/5.0";

// Every video on the channel is titled "THE PITT STOP", so we build a distinct
// display title from the real upload date instead: "The Pitt Stop — Jun 11, 2026".
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
function titleFromDate(date) {
  if (!date) return "The Pitt Stop";
  const [y, m, d] = date.split("-");
  return `The Pitt Stop | ${MONTHS[+m - 1]} ${+d}, ${y}`;
}

async function dateOf(vid) {
  const r = await fetch("https://www.youtube.com/watch?v=" + vid, { headers: { "User-Agent": UA } });
  const html = await r.text();
  const m = html.match(/"uploadDate":"(\d{4}-\d{2}-\d{2})/);
  return m ? m[1] : "";
}

const out = [];
for (const id of IDS) {
  try {
    const date = await dateOf(id);
    const title = titleFromDate(date);
    out.push({ id, title, date, description: "" });
    console.error(`ok  ${id}  ${date}  ${title}`);
  } catch (e) {
    console.error(`ERR ${id}  ${e.message}`);
    out.push({ id, title: "", date: "", description: "" });
  }
}

// newest first; entries missing a date sink to the bottom
out.sort((a, b) => (b.date).localeCompare(a.date));
writeFileSync("data/sermons.json", JSON.stringify(out, null, 4) + "\n");
console.error(`\nWROTE ${out.length} sermons to data/sermons.json`);
