// A small in-memory cache where every entry expires after a set time.
export class TtlCache {
    constructor(ttlSeconds) {
      this.ttlMs = ttlSeconds * 1000;
      this.items = new Map();
    }
  
    // Return the stored value, or undefined when missing or expired.
    get(key) {
      const item = this.items.get(key);
      if (!item) {
        return undefined;
      }
      if (Date.now() >= item.expiresAt) {
        this.items.delete(key);
        return undefined;
      }
      return item.value;
    }
  
    set(key, value) {
      this.items.set(key, { value, expiresAt: Date.now() + this.ttlMs });
    }
  
    // Count only the entries that haven't expired.
    size() {
      const now = Date.now();
      for (const [key, item] of this.items) {
        if (now >= item.expiresAt) {
          this.items.delete(key);
        }
      }
      return this.items.size;
    }
  }