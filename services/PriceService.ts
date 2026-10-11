/**
 * RuneScape 3 Grand Exchange prices.
 *
 * Source: the Weird Gloop exchange API (the backend behind the RuneScape
 * Wiki's GE data), which answers browser requests directly:
 *   https://api.weirdgloop.org/exchange/history/rs/latest?name=A|B|C
 * → { "A": { id, timestamp, price, volume }, … }  (unknown names are omitted)
 *
 * RS3 has a single GE guide price per item (no OSRS-style instant buy/sell
 * high/low), so `getPrice` returns that guide price.
 *
 * Prices are fetched lazily by name, in batches, and cached in localStorage
 * for PRICE_TTL. `getPrice` is synchronous and reads the cache, so callers
 * should `await priceService.init(names)` (or `prefetch(names)`) first with
 * the item names they're about to price.
 */

const LATEST_API = 'https://api.weirdgloop.org/exchange/history/rs/latest?name=';
const CACHE_KEY_PRICES = 'fate_rs3_ge_prices_v1';
const PRICE_TTL = 1000 * 60 * 60; // 1 Hour
/** Names per request — keeps the query string comfortably short. */
const BATCH_SIZE = 50;

interface LatestEntry {
  id: string;
  timestamp: string;
  price: number;
  volume: number | null;
}

interface CachedPrice {
  /** GE guide price in coins; 0 = known to be untradeable / not on the GE. */
  price: number;
  fetchedAt: number;
}

class PriceService {
  /** Lower-cased item name → cached price. */
  private prices: Record<string, CachedPrice> = {};
  private loadedCache = false;
  private inflight: Promise<void> | null = null;

  private loadCache() {
    if (this.loadedCache) return;
    this.loadedCache = true;
    try {
      const raw = localStorage.getItem(CACHE_KEY_PRICES);
      if (raw) this.prices = JSON.parse(raw) ?? {};
    } catch {
      this.prices = {};
    }
  }

  private saveCache() {
    try {
      localStorage.setItem(CACHE_KEY_PRICES, JSON.stringify(this.prices));
    } catch {
      /* storage full / unavailable — prices still work for this session */
    }
  }

  /**
   * Load the cache and (optionally) fetch fresh prices for `names`.
   * Safe to call repeatedly; never throws.
   */
  async init(names: string[] = []) {
    this.loadCache();
    if (names.length) await this.prefetch(names);
  }

  /** Fetch any of `names` that are missing or stale. Never throws. */
  async prefetch(names: string[]) {
    this.loadCache();
    // Serialise fetches so concurrent callers don't double-request.
    if (this.inflight) await this.inflight.catch(() => undefined);
    const now = Date.now();
    const wanted = Array.from(new Set(names.map(n => n.trim()).filter(Boolean)))
      .filter(n => {
        const c = this.prices[n.toLowerCase()];
        return !c || now - c.fetchedAt >= PRICE_TTL;
      });
    if (wanted.length === 0) return;

    this.inflight = (async () => {
      for (let i = 0; i < wanted.length; i += BATCH_SIZE) {
        const batch = wanted.slice(i, i + BATCH_SIZE);
        try {
          const res = await fetch(LATEST_API + batch.map(encodeURIComponent).join('|'));
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const json: Record<string, LatestEntry> = await res.json();
          const byLower = new Map(Object.entries(json).map(([k, v]) => [k.toLowerCase(), v]));
          for (const name of batch) {
            const entry = byLower.get(name.toLowerCase());
            this.prices[name.toLowerCase()] = {
              price: entry && typeof entry.price === 'number' ? entry.price : 0,
              fetchedAt: now,
            };
          }
        } catch (e) {
          console.warn('Failed to fetch RS3 GE prices', e);
        }
      }
      this.saveCache();
    })();
    try {
      await this.inflight;
    } finally {
      this.inflight = null;
    }
  }

  /** Cached GE guide price for an item (0 if unknown, untradeable or not fetched yet). */
  public getPrice(itemName: string): number {
    this.loadCache();
    return this.prices[itemName.toLowerCase()]?.price ?? 0;
  }
}

export const priceService = new PriceService();
