// Keep source text intact and render detected URLs as links without inserting HTML.
export function linkText(text) {
  const parts = [];
  const pattern = /(?:https?:\/\/|www\.)[^\s<>"“”]+/gu;
  let offset = 0;
  for (const match of text.matchAll(pattern)) {
    let label = match[0].replace(/[.,;:!?。；，]+$/u, "");
    for (const [open, close] of [["(", ")"], ["[", "]"]]) {
      while (label.endsWith(close) && label.split(close).length > label.split(open).length) {
        label = label.slice(0, -1);
      }
    }
    if (!label) continue;
    if (match.index > offset) parts.push({ text: text.slice(offset, match.index) });
    parts.push({ text: label, href: label.startsWith("www.") ? `https://${label}` : label });
    offset = match.index + label.length;
  }
  if (offset < text.length) parts.push({ text: text.slice(offset) });
  return parts;
}
