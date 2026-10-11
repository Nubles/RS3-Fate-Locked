/**
 * Runtime self-update for the Collection Log.
 *
 * The bundled data/collectionLogData.ts is a snapshot of the RS3 wiki's
 * collection logs at build time. This service fetches the wiki's log pages live
 * and merges any NEWLY-listed items into the in-memory log — so when Jagex adds
 * a drop and the wiki records it, it appears in the app with NO redeploy. It is
 * deliberately:
 *
 *   • additive only — never renames or deletes existing slots (those stay under
 *     the reviewed build-time data + `npm run clog:sync`); it only APPENDS items
 *     the bundle doesn't have yet, onto pages that already exist.
 *   • fail-safe — any network/parse error leaves the bundled data untouched.
 *   • lazy + cached — fetched once when the log is first opened, cached in
 *     localStorage (works offline afterwards), re-checked after the TTL.
 *
 * Source: unlike OSRS, the RS3 wiki has no machine-readable collection-log
 * module, so the rendered log pages (`Boss collection log`, `Slayer collection
 * log`) are parsed: each section heading is a log entry (= an app page) and the
 * first item link of each table row is a tracked item. The Treasure Trail log is
 * NOT synced at runtime — the bundled Clues tab is a curated subset of its
 * hundreds of casket rewards, and auto-appending them all would balloon the slot
 * count; `npm run clog:sync` covers it at build time instead.
 *
 * Brand-new *pages* (e.g. a new boss) are detected and exposed via `newSources`
 * for a heads-up, but NOT auto-added: a boss also needs a model, drop-rate, key
 * cost and gacha tier, which are human-curated (see CONTENT_SYNC.md).
 *
 * Mirrors the fetch/cache pattern of services/GearService.ts.
 */
import { COLLECTION_LOG_DATA } from '../data/collectionLogData';

const API = 'https://runescape.wiki/api.php';
/** Wiki log pages synced at runtime (see header for why Treasure Trails is excluded). */
const RUNTIME_SOURCES = ['Boss collection log', 'Slayer collection log'];
// v3: RS3 data (v1/v2 caches held OSRS additions keyed to OSRS page names).
const CACHE_KEY = 'fate_clog_sync_v3';
const CACHE_TTL = 1000 * 60 * 60 * 24 * 7; // 7 days

// App page-name (normalised) -> wiki section name, only where they differ.
// Bosses/Slayer pages already use the wiki's section names; the clue pages
// carry friendlier titles than the Treasure Trail log's sections.
const PAGE_ALIAS: Record<string, string> = {
  'shared treasure trail rewards': 'General clue rewards',
  'easy treasure trails': 'Easy clue rewards',
  'medium treasure trails': 'Medium clue rewards',
  'hard treasure trails': 'Hard clue rewards',
  'elite treasure trails': 'Elite clue rewards',
  'master treasure trails': 'Master clue rewards',
};

// Section headings on the log pages that are not log entries.
const NON_LOG_SECTIONS = new Set([
  'contents', 'tracked drops', 'rewards', 'achievements', 'disassembly', 'update history',
  'trivia', 'references', 'gallery', 'see also', 'book info', 'combat stats', 'changes',
  'navigation menu',
]);

const decode = (s: string) => s
  .replace(/&#0?39;|&apos;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&')
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;|&#160;/g, ' ');

/**
 * Parse a rendered wiki log page (action=parse HTML) into its log entries.
 * Each h2/h3 heading starts an entry; within it, the FIRST article link of each
 * table row (`<tr>`) is the tracked item — later cells (e.g. "dropped by")
 * are ignored. File/Category/etc. links are skipped. Exported for testing.
 */
export function parseLogPageHtml(html: string): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  const parts = html.split(/<h[23]\b[^>]*>/i);
  for (let i = 1; i < parts.length; i++) {
    const end = parts[i].search(/<\/h[23]>/i);
    if (end < 0) continue;
    // Old skins wrap the title in .mw-headline next to an [edit] span; newer
    // MediaWiki puts the bare title in the <hN> and the edit links outside it.
    const raw = parts[i].slice(0, end);
    const headline = raw.match(/class="mw-headline"[^>]*>([\s\S]*?)<\/span>/i);
    const heading = decode((headline ? headline[1] : raw.replace(/<span[^>]*mw-editsection[\s\S]*$/i, ''))
      .replace(/<[^>]+>/g, '')).trim();
    if (!heading || NON_LOG_SECTIONS.has(heading.toLowerCase())) continue;
    const body = parts[i].slice(end);
    const items: string[] = [];
    for (const row of body.split(/<tr\b/i).slice(1)) {
      const re = /<a\b[^>]*href="\/w\/([^"#?]+)[^"]*"[^>]*title="([^"]+)"/gi;
      let m;
      while ((m = re.exec(row)) !== null) {
        const title = decode(m[2]);
        if (/^(File|Category|Template|Special|Help|RuneScape|Module|User|Update):/i.test(title)) continue;
        if (!items.includes(title)) items.push(title);
        break;
      }
    }
    if (items.length) out[heading] = items;
  }
  return out;
}

interface WikiItem { id: number; name: string; tabs: string[]; }
interface Addition { tab: string; page: string; id: number; name: string; }
export interface NewSource { name: string; itemCount: number; }
interface SyncResult { additions: Addition[]; newSources: NewSource[]; }
type LogData = typeof COLLECTION_LOG_DATA;

const norm = (s: string) => s.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, ' ').trim();

/**
 * Pure diff: given the wiki's flat item list and the app's log data, return the
 * items to APPEND to existing pages (with freshly-minted, collision-free IDs)
 * and any brand-new wiki pages the app doesn't have. Exported for testing.
 *
 * `overrides` optionally maps a wiki item id -> the display name the app stores
 * when it differs from the scraped name. The RS3 log pages already render final
 * names so the runtime passes none, but the hook stays: comparing a raw name
 * ("Crawling hand") against an app name ("Crawling hand (item)") would
 * otherwise treat it as new and add a duplicate.
 */
export function computeSync(wiki: WikiItem[], data: LogData, overrides: Record<number, string> = {}): SyncResult {
  // wiki page name -> ordered item names (with overrides applied, as the app stores them)
  const wikiPages = new Map<string, string[]>();
  for (const it of wiki) {
    const name = overrides[it.id] !== undefined ? overrides[it.id] : it.name;
    for (const pg of it.tabs) {
      if (!wikiPages.has(pg)) wikiPages.set(pg, []);
      wikiPages.get(pg)!.push(name);
    }
  }

  // index app pages by normalised display name -> { tab, pageObj }
  const appByNorm = new Map<string, { tab: string; page: { name: string; items: { id: number; name: string }[] } }>();
  for (const [tab, tabData] of Object.entries(data))
    for (const page of Object.values(tabData.pages))
      appByNorm.set(norm(page.name), { tab, page });

  const additions: Addition[] = [];
  const newSources: NewSource[] = [];

  for (const [wikiName, items] of wikiPages) {
    const aliasTarget = Object.entries(PAGE_ALIAS).find(([, w]) => w === wikiName)?.[0];
    const match = appByNorm.get(norm(wikiName)) ?? (aliasTarget ? appByNorm.get(aliasTarget) : undefined);
    if (!match || match.page.items.length === 0) {
      if (!match) newSources.push({ name: wikiName, itemCount: items.length });
      continue;
    }
    const have = new Set(match.page.items.map(i => norm(i.name)));
    const P = Math.floor(match.page.items[0].id / 1000) * 1000;
    const used = new Set(match.page.items.map(i => i.id - P));
    let next = Math.max(...match.page.items.map(i => i.id - P)) + 1;
    for (const name of items) {
      if (have.has(norm(name))) continue;
      have.add(norm(name));
      while (used.has(next)) next++;
      used.add(next);
      additions.push({ tab: match.tab, page: match.page.name, id: P + next, name });
    }
  }
  return { additions, newSources };
}

class CollectionLogSyncService {
  private initialized = false;
  private initPromise: Promise<void> | null = null;
  private listeners = new Set<() => void>();

  public ready = false;
  public error: string | null = null;
  public addedCount = 0;
  public newSources: NewSource[] = [];

  /** Subscribe to "data changed" (after a sync applied additions). */
  subscribe(fn: () => void): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }
  private emit() { this.listeners.forEach(fn => fn()); }

  async init(): Promise<void> {
    if (this.initialized) return;
    if (this.initPromise) return this.initPromise;
    this.initPromise = this.perform();
    return this.initPromise;
  }

  private async perform() {
    try {
      this.error = null;
      const cached = this.loadCache();
      let result = cached;
      if (!result) {
        // RS3 log pages render final display names, so no override table is needed.
        result = computeSync(await this.fetchData(), COLLECTION_LOG_DATA);
      }
      this.apply(result);
      if (!cached) this.saveCache(result);
      this.initialized = true;
      this.ready = true;
      if (this.addedCount > 0 || this.newSources.length > 0) this.emit();
    } catch (e) {
      console.warn('CollectionLogSync failed (using bundled data)', e);
      this.error = 'Could not check the wiki for new collection-log items.';
      this.initPromise = null; // allow retry later
      this.ready = false;
      // Non-fatal: the app keeps working on the bundled snapshot.
    }
  }

  /** Fetch a wiki page's rendered HTML via the CORS-enabled API. */
  private async fetchPageHtml(title: string): Promise<string> {
    const url = `${API}?action=parse&page=${encodeURIComponent(title)}&prop=text&format=json&origin=*`;
    let lastErr: unknown;
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), 12000);
        const res = await fetch(url, { signal: ctrl.signal, headers: { 'Api-User-Agent': 'FateLockedRS3/1.0 (clog runtime sync)' } });
        clearTimeout(timer);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        return json.parse.text['*'];
      } catch (e) { lastErr = e; }
    }
    throw lastErr ?? new Error('fetch failed');
  }

  /** Flatten the runtime log pages into computeSync's item list. */
  private async fetchData(): Promise<WikiItem[]> {
    const items: WikiItem[] = [];
    let id = 0;
    for (const title of RUNTIME_SOURCES) {
      const sections = parseLogPageHtml(await this.fetchPageHtml(title));
      if (Object.keys(sections).length === 0) throw new Error(`no log sections parsed from ${title}`);
      for (const [section, names] of Object.entries(sections))
        for (const name of names) items.push({ id: ++id, name, tabs: [section] });
    }
    return items;
  }

  /** Mutate COLLECTION_LOG_DATA in place (idempotent: skips items already present). */
  private apply({ additions, newSources }: SyncResult) {
    let applied = 0;
    for (const a of additions) {
      const tab = COLLECTION_LOG_DATA[a.tab];
      const page = tab && Object.values(tab.pages).find(p => p.name === a.page);
      if (!page) continue;
      if (page.items.some(i => i.id === a.id || norm(i.name) === norm(a.name))) continue;
      page.items.push({ id: a.id, name: a.name });
      applied++;
    }
    this.addedCount = applied;
    this.newSources = newSources;
  }

  private loadCache(): SyncResult | null {
    try {
      const saved = localStorage.getItem(CACHE_KEY);
      if (!saved) return null;
      const { timestamp, data } = JSON.parse(saved);
      if (Date.now() - timestamp > CACHE_TTL || !data || !Array.isArray(data.additions)) return null;
      return data as SyncResult;
    } catch { return null; }
  }

  private saveCache(data: SyncResult) {
    try { localStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: Date.now(), data })); } catch { /* quota: keep in memory */ }
  }
}

export const collectionLogSync = new CollectionLogSyncService();
