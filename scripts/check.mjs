#!/usr/bin/env node
// Repo checks, no dependencies. `npm test` runs the offline checks;
// `npm run check:live` also probes the hosted server's OAuth surface.
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const SERVER_URL = 'https://mcp.shotlingo.com/mcp';
const failures = [];
const ok = (msg) => console.log(`ok   ${msg}`);
const fail = (msg) => { failures.push(msg); console.log(`FAIL ${msg}`); };
const readJson = (p) => JSON.parse(readFileSync(join(root, p), 'utf8'));

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    if (name === '.git' || name === 'node_modules') return [];
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

// 1. Manifests parse and agree with each other.
const market = readJson('.claude-plugin/marketplace.json');
const plugin = readJson('plugin/.claude-plugin/plugin.json');
const server = readJson('server.json');
const entry = market.plugins.find((p) => p.name === plugin.name);
entry ? ok(`marketplace lists plugin "${plugin.name}"`) : fail('marketplace has no entry for plugin.json name');
if (entry) {
  existsSync(join(root, entry.source, '.claude-plugin/plugin.json'))
    ? ok(`plugin source ${entry.source} exists`) : fail(`plugin source ${entry.source} missing`);
  entry.version === plugin.version ? ok(`versions agree (${plugin.version})`)
    : fail(`marketplace version ${entry.version} != plugin version ${plugin.version}`);
}
plugin.mcpServers?.shotlingo?.url === SERVER_URL ? ok('plugin points at the hosted server') : fail('plugin MCP url is wrong');
server.remotes?.[0]?.url === SERVER_URL ? ok('server.json points at the hosted server') : fail('server.json remote url is wrong');

// 2. Every skill and command has frontmatter with a description.
for (const file of walk(join(root, 'plugin')).filter((f) => f.endsWith('.md'))) {
  const text = readFileSync(file, 'utf8');
  const fm = text.match(/^---\n([\s\S]*?)\n---\n/);
  const rel = relative(root, file);
  if (!fm || !/^description: .+/m.test(fm[1])) fail(`${rel} has no frontmatter description`);
  else if (rel.endsWith('SKILL.md') && !/^name: [a-z0-9-]+$/m.test(fm[1])) fail(`${rel} has no valid name`);
  else ok(`${rel} frontmatter`);
  // Public docs: no local paths, no client-specific tool prefixes, no em dashes.
  const leaks = [/\/Users\//, /~\//, /\bmcp__/, new RegExp(String.fromCharCode(0x2014))].filter((re) => re.test(text));
  leaks.length ? fail(`${rel} contains ${leaks.join(', ')}`) : ok(`${rel} has no local paths or tool prefixes`);
}

// 3. README install lines use the same URL.
const readme = readFileSync(join(root, 'README.md'), 'utf8');
// The free audit (GET /audit) is the one other public path; every connector line must use SERVER_URL.
const urls = new Set(readme.match(/https:\/\/mcp\.shotlingo\.com\/[a-z]*/g));
urls.delete('https://mcp.shotlingo.com/audit');
urls.size === 1 && urls.has(SERVER_URL) ? ok('README uses one server URL') : fail(`README server URLs: ${[...urls].join(', ')}`);

// 4. Secret scan: nothing that looks like a credential may be committed.
const SECRET_PATTERNS = [
  ['private key', /-----BEGIN [A-Z ]*PRIVATE KEY-----/],
  ['Anthropic key', /sk-ant-[A-Za-z0-9_-]{10,}/],
  ['OpenAI-style key', /\bsk-[A-Za-z0-9]{20,}/],
  ['GitHub token', /\b(ghp|gho|ghs|ghu|github_pat)_[A-Za-z0-9_]{20,}/],
  ['AWS key', /\bAKIA[0-9A-Z]{16}\b/],
  ['Slack token', /\bxox[abpr]-[A-Za-z0-9-]{10,}/],
  ['Paddle key', /pdl_(live|sdbx)_[A-Za-z0-9_]{10,}/],
  ['Stripe key', /\b(sk|rk)_live_[A-Za-z0-9]{10,}/],
  ['JWT', /\beyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/],
  ['npm token', /\bnpm_[A-Za-z0-9]{30,}/],
  ['Cloudflare account path', /accounts\/[0-9a-f]{32}/],
  ['env assignment', /^(export )?[A-Z][A-Z0-9_]*(KEY|TOKEN|SECRET|PASSWORD)=\S+/m],
];
const textFiles = walk(root).filter((f) => !/\.(gif|png|jpe?g|mp4|webm)$/i.test(f));
let secretHits = 0;
for (const file of textFiles) {
  const text = readFileSync(file, 'utf8');
  for (const [label, re] of SECRET_PATTERNS) {
    if (re.test(text)) { secretHits++; fail(`possible ${label} in ${relative(root, file)}`); }
  }
}
if (!secretHits) ok(`secret scan clean (${textFiles.length} text files)`);

// 4b. `npx skills add AlperenGuntekin/shotlingo-mcp` finds the skills through skills.sh.json
// (vercel-labs/skills docs/creating-skills.md, "Custom Discovery Paths"): every listed path must
// exist and hold <name>/SKILL.md folders whose frontmatter name matches the folder.
const skillsCfg = readJson('skills.sh.json');
for (const p of skillsCfg.paths ?? []) {
  if (!p.startsWith('./') || !existsSync(join(root, p))) { fail(`skills.sh.json path ${p} missing or not ./-relative`); continue; }
  const names = readdirSync(join(root, p)).filter((d) => existsSync(join(root, p, d, 'SKILL.md')));
  names.length ? ok(`skills.sh.json ${p}: ${names.join(', ')}`) : fail(`skills.sh.json ${p} holds no SKILL.md`);
  for (const d of names) {
    const fmName = readFileSync(join(root, p, d, 'SKILL.md'), 'utf8').match(/^---\n[\s\S]*?^name:\s*(\S+)/m)?.[1];
    fmName === d ? ok(`skill ${d} name matches its folder`) : fail(`skill folder ${d} has name ${fmName}`);
  }
}

// 5. Optional live probe of the hosted server.
if (process.argv.includes('--live')) {
  const res = await fetch(SERVER_URL, { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}' });
  const www = res.headers.get('www-authenticate') || '';
  res.status === 401 && www.includes('resource_metadata=') ? ok('server asks for OAuth with resource metadata')
    : fail(`unexpected server answer: ${res.status} ${www}`);
  const meta = await (await fetch('https://mcp.shotlingo.com/.well-known/oauth-authorization-server')).json();
  meta.registration_endpoint && meta.code_challenge_methods_supported?.includes('S256')
    ? ok('OAuth discovery offers dynamic registration and PKCE S256') : fail('OAuth discovery incomplete');
}

if (failures.length) { console.log(`\n${failures.length} check(s) failed`); process.exit(1); }
console.log('\nall checks passed');
