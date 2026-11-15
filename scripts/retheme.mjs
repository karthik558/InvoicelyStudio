import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('src');
const files = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (/\.(tsx|ts|css)$/.test(entry.name)) files.push(full);
  }
}
walk(root);

const pairs = [
  ['dark:bg-[#0A2323]/80', 'bg-[var(--surface-muted)]'],
  ['dark:from-[#0B1B1B]', 'from-[var(--surface)]'],
  ['dark:to-[#0A2323]', 'to-[var(--surface-muted)]'],
  ['dark:from-[#1A3F3F]', 'from-[var(--surface-muted)]'],
  ['dark:to-[#0B1B1B]', 'to-[var(--surface)]'],
  ['from-[#F0F7F7]', 'from-[var(--accent-soft)]'],
  ['to-[#F0F7F7]', 'to-[var(--accent-soft)]'],
  ['hover:bg-[#B5894D]', 'hover:bg-[var(--accent-hover)]'],
  ['hover:bg-[#b5894d]', 'hover:bg-[var(--accent-hover)]'],
  ['dark:hover:bg-[#1A3F3F]', 'hover:bg-[var(--surface-muted)]'],
  ['hover:bg-[#1A3F3F]', 'hover:bg-[var(--surface-muted)]'],
  ['dark:hover:border-[#C69A5D]', 'hover:border-[var(--accent)]'],
  ['hover:border-[#0D2C2C]', 'hover:border-[var(--accent)]'],
  ['dark:border-[#1A3F3F]', 'border-[var(--line)]'],
  ['border-[#1A3F3F]', 'border-[var(--line)]'],
  ['border-[#1D4A4A]', 'border-[var(--line)]'],
  ['dark:bg-[#0A2323]', 'bg-[var(--surface-muted)]'],
  ['bg-[#0A2323]', 'bg-[var(--chrome)]'],
  ['dark:bg-[#0B1B1B]', 'bg-[var(--surface)]'],
  ['bg-[#0B1B1B]', 'bg-[var(--surface)]'],
  ['dark:bg-[#1A3F3F]/30', 'bg-[var(--surface-muted)]'],
  ['dark:bg-[#1A3F3F]', 'bg-[var(--surface-muted)]'],
  ['bg-[#1A3F3F]', 'bg-[var(--surface-muted)]'],
  ['bg-[#123636]', 'bg-[var(--surface)]'],
  ['bg-[#0E2C2C]', 'bg-[var(--surface-muted)]'],
  ['bg-[#061313]', 'bg-[var(--canvas)]'],
  ['bg-[#F3F5F5]', 'bg-[var(--canvas)]'],
  ['bg-[#E8EBEB]', 'bg-[var(--preview)]'],
  ['bg-[#FAFAFA]', 'bg-[var(--canvas)]'],
  ['bg-[#F0F7F7]', 'bg-[var(--accent-soft)]'],
  ['bg-[#C69A5D]/10', 'bg-[var(--accent-soft)]'],
  ['dark:bg-[#C69A5D]/10', 'bg-[var(--accent-soft)]'],
  ['bg-[#C69A5D]', 'bg-[var(--accent)]'],
  ['border-[#C69A5D]/30', 'border-[var(--accent)]/30'],
  ['border-[#C69A5D]', 'border-[var(--accent)]'],
  ['shadow-[#C69A5D]/20', 'shadow-[var(--accent)]/20'],
  ['shadow-[#C69A5D]/10', 'shadow-[var(--accent)]/15'],
  ['shadow-[#0D2C2C]/5', 'shadow-black/5'],
  ['shadow-[#0D2C2C]/25', 'shadow-black/20'],
  ['dark:text-[#C69A5D]', 'text-[var(--accent-text)]'],
  ['text-[#C69A5D]', 'text-[var(--accent-text)]'],
  ['text-[#C69A5D]/60', 'text-[var(--accent-text)]'],
  ['dark:group-hover:text-[#C69A5D]', 'group-hover:text-[var(--accent-text)]'],
  ['group-hover:text-[#0D2C2C]', 'group-hover:text-[var(--accent-text)]'],
  ['dark:group-hover:bg-[#C69A5D]', 'group-hover:bg-[var(--accent)]'],
  ['group-hover:bg-[#0D2C2C]', 'group-hover:bg-[var(--accent)]'],
  ['dark:group-hover:text-[#0D2C2C]', 'group-hover:text-[var(--on-accent)]'],
  ['hover:text-[#0D2C2C]', 'hover:text-[var(--on-accent)]'],
  ['dark:focus:border-[#C69A5D]', 'focus:border-[var(--accent)]'],
  ['focus:border-[#0D2C2C]/50', 'focus:border-[var(--accent)]'],
  ['focus:border-[#0D2C2C]', 'focus:border-[var(--accent)]'],
  ['focus:ring-[#0D2C2C]', 'focus:ring-[var(--accent)]'],
  ['border-[#0D2C2C]/10', 'border-[var(--line)]'],
  ['border-[#0D2C2C]', 'border-[var(--accent)]'],
  ['dark:bg-[#C69A5D]', 'bg-[var(--accent)]'],
  ['bg-[#0D2C2C]', 'bg-[var(--accent)]'],
  ['dark:text-[#0D2C2C]', 'text-[var(--on-accent)]'],
  ['text-[#0D2C2C]', 'text-[var(--ink)]'],
  ['hover:bg-[#0D2C2C]', 'hover:bg-[var(--accent-hover)]'],
  ['#C69A5D', 'var(--accent)'],
  ['#0D2C2C', 'var(--accent)'],
  ['#0f766e', '#1e3a8a'],
  ['#b45309', '#c2410c'],
];

function contrastOnAccent(source) {
  return source.replace(/'([^']*)'/g, (full, inner) => {
    if (inner.includes('bg-[var(--accent)]') && inner.includes('text-[var(--ink)]')) {
      return `'${inner.replaceAll('text-[var(--ink)]', 'text-[var(--on-accent)]')}'`;
    }
    return full;
  }).replace(/"([^"]*)"/g, (full, inner) => {
    if (inner.includes('bg-[var(--accent)]') && inner.includes('text-[var(--ink)]')) {
      return `"${inner.replaceAll('text-[var(--ink)]', 'text-[var(--on-accent)]')}"`;
    }
    return full;
  });
}

for (const file of files) {
  if (file.endsWith('index.css')) continue;
  let text = fs.readFileSync(file, 'utf8');
  const before = text;
  for (const [from, to] of pairs) text = text.split(from).join(to);
  text = contrastOnAccent(text);
  if (text !== before) {
    fs.writeFileSync(file, text);
    console.log('updated', path.relative(root, file));
  }
}
