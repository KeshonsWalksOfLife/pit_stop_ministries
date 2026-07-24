#!/usr/bin/env node
/**
 * update-sermons
 * -----------------------------------------------------------------------
 * Reads the channel's public YouTube RSS feed, finds videos titled like
 * "The Pitt Stop" that aren't already in data/sermons.json, adds them,
 * and re-sorts newest-first. One-shot script, run on a schedule
 * (GitHub Actions cron) — same pattern as health-checker. No API key,
 * no third-party account, no server to maintain.
 *
 * Safety net: only videos whose title contains "pitt stop" (case
 * insensitive) get added. This channel's account name/history isn't
 * Pitt-Stop-specific, so an unfiltered pull could add unrelated content
 * the channel posts. If a real sermon ever gets skipped because its
 * title doesn't match, that will show up in the "skipped" summary below
 * — check it after every run, don't just trust a silent success.
 * -----------------------------------------------------------------------
 */

const fs = require('fs');
const path = require('path');

const CHANNEL_ID = 'UCnKBEMnAGXg6sm6OJHxpKLw';
const RSS_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;
const SERMONS_PATH = path.join(__dirname, '..', 'data', 'sermons.json');
const TITLE_FILTER = /pitt stop/i;

/** Parse YouTube's Atom RSS feed into {id, title, publishedDate}. No deps — simple, stable tag shape. */
function parseFeed(xml) {
    const entries = [];
    const entryBlocks = xml.split('<entry>').slice(1);
    for (const block of entryBlocks) {
        const idMatch = block.match(/<yt:videoId>(.*?)<\/yt:videoId>/);
        const titleMatch = block.match(/<title>(.*?)<\/title>/);
        const publishedMatch = block.match(/<published>(.*?)<\/published>/);
        if (!idMatch || !titleMatch || !publishedMatch) continue;

        const isoDate = publishedMatch[1]; // e.g. 2026-07-22T18:03:11+00:00
        entries.push({
            id: idMatch[1],
            title: decodeEntities(titleMatch[1]),
            publishedDate: isoDate.slice(0, 10) // -> "2026-07-22"
        });
    }
    return entries;
}

function decodeEntities(str) {
    return str
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&#39;/g, "'")
        .replace(/&quot;/g, '"');
}

function formatTitle(dateStr) {
    const [year, month, day] = dateStr.split('-').map(Number);
    const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    return `The Pitt Stop | ${MONTHS[month - 1]} ${day}, ${year}`;
}

async function fetchFeed() {
    const response = await fetch(RSS_URL, {
        headers: { 'User-Agent': 'DVOUtion-SermonUpdater/1.0' }
    });
    if (!response.ok) {
        throw new Error(`RSS fetch failed: HTTP ${response.status}`);
    }
    return response.text();
}

/** Core logic, separated from I/O so it can be tested against a fixture without network access. */
function computeUpdate(feedEntries, existingSermons) {
    const existingIds = new Set(existingSermons.map((s) => s.id));
    const added = [];
    const skippedOffTopic = [];

    for (const entry of feedEntries) {
        if (existingIds.has(entry.id)) continue; // already have it
        if (!TITLE_FILTER.test(entry.title)) {
            skippedOffTopic.push(entry);
            continue;
        }
        added.push({
            id: entry.id,
            title: formatTitle(entry.publishedDate),
            date: entry.publishedDate,
            description: ""
        });
    }

    const updated = [...existingSermons, ...added].sort((a, b) => (a.date < b.date ? 1 : -1));
    return { updated, added, skippedOffTopic };
}

async function main() {
    const existingSermons = JSON.parse(fs.readFileSync(SERMONS_PATH, 'utf-8'));

    const xml = await fetchFeed();
    const feedEntries = parseFeed(xml);

    if (feedEntries.length === 0) {
        console.error('Parsed 0 entries from the feed — likely a feed format change, not "no new videos." Not writing anything.');
        process.exitCode = 2;
        return;
    }

    const { updated, added, skippedOffTopic } = computeUpdate(feedEntries, existingSermons);

    if (added.length === 0) {
        console.log('No new Pitt Stop videos found. Sermons list unchanged.');
    } else {
        fs.writeFileSync(SERMONS_PATH, JSON.stringify(updated, null, 4) + '\n', 'utf-8');
        console.log(`Added ${added.length} new sermon(s):`);
        for (const s of added) console.log(`  ${s.date}  ${s.id}  ${s.title}`);
    }

    if (skippedOffTopic.length > 0) {
        console.log(`\nSkipped ${skippedOffTopic.length} feed item(s) that didn't match "Pitt Stop" in the title — review these manually:`);
        for (const s of skippedOffTopic) console.log(`  ${s.publishedDate}  ${s.id}  ${s.title}`);
    }

    // Machine-readable summary for the workflow to use in a notification step.
    fs.writeFileSync(
        path.join(__dirname, '..', 'data', 'last-sermon-update.json'),
        JSON.stringify({ ranAt: new Date().toISOString(), added, skippedOffTopic }, null, 2)
    );
}

if (require.main === module) {
    main().catch((err) => {
        console.error('update-sermons crashed:', err);
        process.exitCode = 1;
    });
}

module.exports = { parseFeed, computeUpdate, formatTitle }; // exported for the test fixture
