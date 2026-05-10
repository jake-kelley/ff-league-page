// Pulls editable-page overrides out of Upstash Redis and writes them
// back into the repo as the new defaults. Run by .github/workflows/sync-content.yml
// once a day; can also be run manually with valid env vars.
//
// Mapping:
//   content:constitution            -> src/routes/constitution/default.md
//   content:dynasty-101             -> src/routes/dynasty-101/default.md
//   content:resources               -> src/lib/HelpfulResources/defaultLinks.js
//   content:kb:<slug>               -> fantasy-football-training-data/<slug>.md
//
// After a successful write of a key, the corresponding KV entry is deleted so
// the committed source file becomes the source of truth again.

import { Redis } from '@upstash/redis';
import { writeFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname } from 'node:path';

const redis = Redis.fromEnv();

const STATIC_TARGETS = {
    'content:constitution': {
        path: 'src/routes/constitution/default.md',
        kind: 'markdown',
    },
    'content:dynasty-101': {
        path: 'src/routes/dynasty-101/default.md',
        kind: 'markdown',
    },
    'content:resources': {
        path: 'src/lib/HelpfulResources/defaultLinks.js',
        kind: 'resources',
    },
};

const KB_PREFIX = 'content:kb:';
const KB_DIR = 'fantasy-football-training-data';

const ensureDir = (filePath) => {
    const d = dirname(filePath);
    if (!existsSync(d)) mkdirSync(d, { recursive: true });
};

const writeIfChanged = (path, body) => {
    let prev = '';
    try {
        prev = readFileSync(path, 'utf-8');
    } catch {}
    if (prev === body) return false;
    ensureDir(path);
    writeFileSync(path, body);
    return true;
};

const formatResources = (value) => {
    if (!Array.isArray(value)) {
        throw new Error(`content:resources is not an array (got ${typeof value})`);
    }
    const lines = ['export const DEFAULT_LINKS = ['];
    for (const item of value) {
        const obj = {
            name: String(item.name ?? ''),
            url: String(item.url ?? ''),
            icon: String(item.icon ?? 'link'),
            premium: !!item.premium,
        };
        lines.push(`    ${JSON.stringify(obj)},`);
    }
    lines.push('];');
    lines.push('');
    return lines.join('\n');
};

const main = async () => {
    const allKeys = await redis.keys('content:*');
    if (!allKeys || allKeys.length === 0) {
        console.log('No overrides in KV. Nothing to sync.');
        return;
    }

    const written = [];
    const deleted = [];

    for (const key of allKeys) {
        const value = await redis.get(key);
        if (value === null || value === undefined) continue;

        let target;
        let body;

        if (STATIC_TARGETS[key]) {
            const t = STATIC_TARGETS[key];
            target = t.path;
            body = t.kind === 'resources' ? formatResources(value) : String(value);
        } else if (key.startsWith(KB_PREFIX)) {
            const slug = key.slice(KB_PREFIX.length);
            if (!/^[a-z0-9_-]+$/.test(slug)) {
                console.warn(`Skipping malformed KB key: ${key}`);
                continue;
            }
            target = `${KB_DIR}/${slug}.md`;
            body = String(value);
        } else {
            // Skip session keys, anything we don't own.
            continue;
        }

        if (!body.endsWith('\n')) body += '\n';
        const changed = writeIfChanged(target, body);
        if (changed) {
            written.push(target);
            console.log(`wrote ${target} (${body.length} bytes)`);
        } else {
            console.log(`unchanged ${target}`);
        }

        // Delete the override after writing — committed file becomes source of truth.
        await redis.del(key);
        deleted.push(key);
    }

    console.log(`\nSummary: ${written.length} file(s) updated, ${deleted.length} KV key(s) cleared.`);
    // Emit a list to stdout so the workflow can inspect the run easily.
    if (written.length) console.log('Updated files:', written.join(', '));
};

main().catch((err) => {
    console.error('sync failed:', err);
    process.exit(1);
});
