import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const sourceURL = 'https://www.youtube.com/results?search_query=the+project+darbar';

export function extractVideos(html) {
  const assignment = /(?:var\s+ytInitialData|window\[["']ytInitialData["']\]|\bytInitialData)\s*=\s*\{/.exec(html);
  if (!assignment) throw new Error('No YouTube result data found. The response may be a consent or bot-check page.');
  const start = assignment.index + assignment[0].length - 1;
  let depth = 0;
  let quoted = false;
  let escaped = false;
  let end = -1;
  for (let i = start; i < html.length; i++) {
    const c = html[i];
    if (quoted) {
      if (escaped) escaped = false;
      else if (c === '\\') escaped = true;
      else if (c === '"') quoted = false;
    } else if (c === '"') quoted = true;
    else if (c === '{') depth++;
    else if (c === '}' && --depth === 0) { end = i + 1; break; }
  }
  if (end < 0) throw new Error('The YouTube result data is incomplete.');
  const data = JSON.parse(html.slice(start, end));
  const videos = new Map();
  const text = (value) => value?.simpleText ?? value?.runs?.map((run) => run.text).join('') ?? '';
  function walk(node) {
    if (!node || typeof node !== 'object') return;
    for (const key of ['videoRenderer', 'gridVideoRenderer', 'compactVideoRenderer']) {
      const video = node[key];
      if (!video || !/^[a-zA-Z0-9_-]{11}$/.test(video.videoId)) continue;
      const byline = video.ownerText ?? video.shortBylineText ?? video.longBylineText;
      const endpoint = byline?.runs?.[0]?.navigationEndpoint?.browseEndpoint;
      const channelPath = endpoint?.canonicalBaseUrl ?? (endpoint?.browseId ? `/channel/${endpoint.browseId}` : undefined);
      const channel = text(byline);
      videos.set(video.videoId, {
        title: text(video.title),
        youtubeId: video.videoId,
        url: `https://www.youtube.com/watch?v=${video.videoId}`,
        channel,
        channelURL: channelPath ? new URL(channelPath, 'https://www.youtube.com').href : null,
        matchesBand: /^(?:the)?projectdarbar$/.test(channel.toLowerCase().replace(/[^a-z]/g, '')),
      });
    }
    for (const value of Object.values(node)) walk(value);
  }
  walk(data);
  return [...videos.values()];
}

async function main() {
  const args = process.argv.slice(2);
  const value = (flag) => { const i = args.indexOf(flag); return i < 0 ? undefined : args[i + 1]; };
  const savedHTML = value('--html');
  const output = resolve(value('--output') ?? 'artifacts/youtube-videos.json');
  let html;
  if (savedHTML) html = await readFile(savedHTML, 'utf8');
  else {
    const response = await fetch(sourceURL, {
      signal: AbortSignal.timeout(15000),
      headers: { 'User-Agent': 'Mozilla/5.0', 'Accept-Language': 'en-US,en;q=0.9' },
    });
    if (!response.ok) throw new Error(`YouTube returned HTTP ${response.status}.`);
    html = await response.text();
  }
  const videos = extractVideos(html);
  if (!videos.length) throw new Error('The page did not contain any standard video results.');
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, JSON.stringify({ sourceURL, videos }, null, 2) + '\n');
  for (const video of videos) console.log(`${video.matchesBand ? '[BAND]' : '[CHECK]'} ${video.title}\n${video.url}\n${video.channel}\n`);
  console.log(`Saved ${videos.length} video URLs to ${output}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch((error) => {
    console.error(`YouTube scrape failed: ${error.cause?.message ?? error.message}`);
    process.exitCode = 1;
  });
}
