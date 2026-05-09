import { readdirSync, readFileSync, writeFileSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';

const DIR = process.argv[2] ?? 'fantasy-football-training-data';
const DELETE_TXT = process.argv.includes('--delete');

const isAllCapsHeading = (line) => {
    const t = line.trim();
    if (!t) return false;
    if (t.length < 3 || t.length > 90) return false;
    if (/^[-=#*|]/.test(t)) return false;
    if (/[.?!,;:]$/.test(t)) return false;
    const stripped = t.replace(/\([^)]*\)/g, '').trim();
    if (!stripped) return false;
    if (/[a-z]/.test(stripped)) return false;
    if (!/[A-Z]/.test(stripped)) return false;
    return true;
};

const isUnderline = (line, ch) => {
    const t = line.trim();
    return t.length >= 3 && t.split('').every((c) => c === ch);
};

const convert = (text) => {
    const lines = text.replace(/\r\n/g, '\n').split('\n');
    const out = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();

        if (isUnderline(line, '=')) {
            const lastIdx = out.length - 1;
            if (lastIdx >= 0 && out[lastIdx].trim() && !out[lastIdx].startsWith('#')) {
                out[lastIdx] = `# ${out[lastIdx].trim()}`;
            }
            continue;
        }
        if (isUnderline(line, '-')) {
            const lastIdx = out.length - 1;
            if (lastIdx >= 0 && out[lastIdx].trim() && !out[lastIdx].startsWith('#')) {
                out[lastIdx] = `## ${out[lastIdx].trim()}`;
            }
            continue;
        }

        if (isAllCapsHeading(line)) {
            const prev = out[out.length - 1] ?? '';
            const next = lines[i + 1] ?? '';
            const prevBlank = prev.trim() === '';
            const nextLooksLikeContent = next.trim() === '' || /[a-z]/.test(next);
            if (prevBlank && nextLooksLikeContent) {
                out.push(`### ${trimmed}`);
                continue;
            }
        }

        out.push(line);
    }

    let result = out.join('\n');
    result = result.replace(/\n{3,}/g, '\n\n');
    return result.trim() + '\n';
};

const files = readdirSync(DIR).filter((f) => f.endsWith('.txt'));
let written = 0;
for (const file of files) {
    const txtPath = join(DIR, file);
    const mdPath = join(DIR, file.replace(/\.txt$/i, '.md'));
    const raw = readFileSync(txtPath, 'utf-8');
    const md = convert(raw);
    writeFileSync(mdPath, md);
    if (DELETE_TXT) unlinkSync(txtPath);
    written++;
}
console.log(`Converted ${written} files. Delete .txt: ${DELETE_TXT}`);
