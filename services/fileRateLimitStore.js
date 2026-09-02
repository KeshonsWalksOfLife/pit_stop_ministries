const fs = require('fs');
const path = require('path');

// express-rate-limit's default MemoryStore lives entirely in process memory,
// so every counter resets to zero whenever the process restarts (a Render
// free-tier dyno spinning down after idle time, a redeploy, a crash, etc).
// That silently un-does any guardrail built on top of it. This Store
// implementation persists hit counts to a JSON file on disk so they survive
// restarts — pair it with a mounted Docker volume for the data directory.
class FileRateLimitStore {
    constructor(filePath) {
        this.filePath = filePath;
        this.windowMs = 0;
        this.data = new Map();
        this._load();
    }

    init(options) {
        this.windowMs = options.windowMs;
    }

    _load() {
        try {
            const raw = fs.readFileSync(this.filePath, 'utf8');
            const parsed = JSON.parse(raw);
            this.data = new Map(
                Object.entries(parsed).map(([key, entry]) => [
                    key,
                    { totalHits: entry.totalHits, resetTime: new Date(entry.resetTime) },
                ])
            );
        } catch {
            this.data = new Map();
        }
    }

    _save() {
        const serialized = {};
        for (const [key, entry] of this.data) {
            serialized[key] = { totalHits: entry.totalHits, resetTime: entry.resetTime.toISOString() };
        }
        fs.mkdirSync(path.dirname(this.filePath), { recursive: true });
        fs.writeFileSync(this.filePath, JSON.stringify(serialized));
    }

    _activeEntry(key) {
        const entry = this.data.get(key);
        if (!entry || entry.resetTime.getTime() <= Date.now()) return undefined;
        return entry;
    }

    get(key) {
        const entry = this._activeEntry(key);
        return entry ? { totalHits: entry.totalHits, resetTime: entry.resetTime } : undefined;
    }

    increment(key) {
        const entry = this._activeEntry(key) ?? { totalHits: 0, resetTime: new Date(Date.now() + this.windowMs) };
        entry.totalHits += 1;
        this.data.set(key, entry);
        this._save();
        return { totalHits: entry.totalHits, resetTime: entry.resetTime };
    }

    decrement(key) {
        const entry = this.data.get(key);
        if (entry && entry.totalHits > 0) {
            entry.totalHits -= 1;
            this._save();
        }
    }

    resetKey(key) {
        this.data.delete(key);
        this._save();
    }

    resetAll() {
        this.data.clear();
        this._save();
    }
}

module.exports = { FileRateLimitStore };
