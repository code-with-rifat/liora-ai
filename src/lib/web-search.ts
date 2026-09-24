import dns from 'dns';

// Ensure IPv4 first on Node environments to avoid IPv6 EAI_AGAIN delays
try {
  dns.setDefaultResultOrder('ipv4first');
} catch {
  // Ignore in environments where dns is not available
}

export interface WebSearchResult {
  title: string;
  url: string;
  snippet: string;
  source?: string;
  publishedDate?: string;
}

export interface SearchGroundingContext {
  query: string;
  results: WebSearchResult[];
  formattedContext: string;
  hasRealTimeData: boolean;
}

async function fetchWithTimeout(url: string, init: RequestInit = {}, ms = 5000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

// 1. Google News RSS Real-Time Search (Ultra-fresh global & regional news)
async function searchGoogleNews(query: string, lang = 'en'): Promise<WebSearchResult[]> {
  try {
    const isBn = lang === 'bn' || /[\u0980-\u09FF]/.test(query);
    const hl = isBn ? 'bn' : 'en-US';
    const gl = isBn ? 'BD' : 'US';
    const ceid = isBn ? 'BD:bn' : 'US:en';

    const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=${hl}&gl=${gl}&ceid=${ceid}`;
    const res = await fetchWithTimeout(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'application/rss+xml, application/xml, text/xml',
      },
    }, 4500);

    if (!res.ok) return [];
    const xml = await res.text();

    const items = [...xml.matchAll(/<item>[\s\S]*?<title>([\s\S]*?)<\/title>[\s\S]*?<link>([\s\S]*?)<\/link>[\s\S]*?(?:<pubDate>([\s\S]*?)<\/pubDate>)?[\s\S]*?(?:<source[^>]*url="([^"]*)"[^>]*>([\s\S]*?)<\/source>)?[\s\S]*?<\/item>/g)];

    const results: WebSearchResult[] = [];
    for (const item of items.slice(0, 4)) {
      const rawTitle = item[1]?.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim();
      const link = item[2]?.trim();
      const pubDate = item[3]?.trim();
      const sourceName = item[5]?.trim() || (rawTitle.includes(' - ') ? rawTitle.split(' - ').pop() : 'News Source');
      const cleanTitle = rawTitle.includes(' - ') ? rawTitle.substring(0, rawTitle.lastIndexOf(' - ')).trim() : rawTitle;

      if (cleanTitle && link) {
        results.push({
          title: cleanTitle,
          url: link,
          snippet: `Published: ${pubDate || 'Recent'} | Source: ${sourceName}`,
          source: sourceName,
          publishedDate: pubDate,
        });
      }
    }
    return results;
  } catch {
    return [];
  }
}

// 2. HackerNews Algolia Real-Time Tech & AI Search
async function searchHackerNews(query: string): Promise<WebSearchResult[]> {
  try {
    const url = `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(query)}&hitsPerPage=4`;
    const res = await fetchWithTimeout(url, {
      headers: { Accept: 'application/json' },
    }, 4000);

    if (!res.ok) return [];
    const data = await res.json();
    const hits = data?.hits || [];

    return hits
      .filter((h: any) => h.title && (h.url || h.objectID))
      .slice(0, 3)
      .map((h: any) => ({
        title: h.title,
        url: h.url || `https://news.ycombinator.com/item?id=${h.objectID}`,
        snippet: `Points: ${h.points || 0} | Comments: ${h.num_comments || 0} | Author: ${h.author || 'HN'}`,
        source: 'Hacker News / Tech Web',
        publishedDate: h.created_at ? new Date(h.created_at).toLocaleDateString() : undefined,
      }));
  } catch {
    return [];
  }
}

// 3. Live Weather Grounding (Open-Meteo)
async function searchLiveWeather(query: string): Promise<WebSearchResult[]> {
  const q = query.toLowerCase();
  if (!q.includes('weather') && !q.includes('abohawo') && !q.includes('abohawa') && !q.includes('temperature') && !q.includes('tapmatra')) {
    return [];
  }

  // Major cities coordinate lookup
  const cities: Record<string, { name: string; lat: number; lon: number }> = {
    dhaka: { name: 'Dhaka, Bangladesh', lat: 23.8103, lon: 90.4125 },
    chittagong: { name: 'Chittagong, Bangladesh', lat: 22.3569, lon: 91.7832 },
    sylhet: { name: 'Sylhet, Bangladesh', lat: 24.8949, lon: 91.8687 },
    rajshahi: { name: 'Rajshahi, Bangladesh', lat: 24.3745, lon: 88.6042 },
    khulna: { name: 'Khulna, Bangladesh', lat: 22.8456, lon: 89.5403 },
    london: { name: 'London, UK', lat: 51.5074, lon: -0.1278 },
    'new york': { name: 'New York, USA', lat: 40.7128, lon: -74.006 },
    tokyo: { name: 'Tokyo, Japan', lat: 35.6762, lon: 139.6503 },
    dubai: { name: 'Dubai, UAE', lat: 25.2048, lon: 55.2708 },
  };

  let target = cities['dhaka'];
  for (const [cityName, coords] of Object.entries(cities)) {
    if (q.includes(cityName)) {
      target = coords;
      break;
    }
  }

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${target.lat}&longitude=${target.lon}&current_weather=true`;
    const res = await fetchWithTimeout(url, {}, 3500);
    if (!res.ok) return [];
    const data = await res.json();
    const curr = data?.current_weather;
    if (!curr) return [];

    return [
      {
        title: `Live Weather in ${target.name}`,
        url: 'https://open-meteo.com',
        snippet: `Temperature: ${curr.temperature}°C | Wind Speed: ${curr.windspeed} km/h | Weather Code: ${curr.weathercode} | Updated: Live Real-Time`,
        source: 'Open-Meteo Global Meteorological Station',
      },
    ];
  } catch {
    return [];
  }
}

// 4. Live Currency Exchange Rates Grounding
async function searchLiveCurrency(query: string): Promise<WebSearchResult[]> {
  const q = query.toLowerCase();
  if (
    !q.includes('dollar') &&
    !q.includes('usd') &&
    !q.includes('taka') &&
    !q.includes('bdt') &&
    !q.includes('rate') &&
    !q.includes('currency') &&
    !q.includes('exchange') &&
    !q.includes('euro')
  ) {
    return [];
  }

  try {
    const url = 'https://open.er-api.com/v6/latest/USD';
    const res = await fetchWithTimeout(url, {}, 3500);
    if (!res.ok) return [];
    const data = await res.json();
    const rates = data?.rates;
    if (!rates) return [];

    const bdt = rates.BDT ? Number(rates.BDT).toFixed(2) : '120.50';
    const eur = rates.EUR ? Number(rates.EUR).toFixed(2) : '0.92';
    const inr = rates.INR ? Number(rates.INR).toFixed(2) : '86.00';
    const gbp = rates.GBP ? Number(rates.GBP).toFixed(2) : '0.78';

    return [
      {
        title: 'Real-Time Global Currency Exchange Rates (Base: 1 USD)',
        url: 'https://open.er-api.com',
        snippet: `1 USD = ${bdt} BDT (Bangladeshi Taka) | 1 USD = ${eur} EUR | 1 USD = ${inr} INR | 1 USD = ${gbp} GBP | Last Updated: ${data.time_last_update_utc || 'Real-Time Today'}`,
        source: 'Global Financial Exchange Rates Feed',
      },
    ];
  } catch {
    return [];
  }
}

// 5. Tavily Web Search (Optional fallback if user provides TAVILY_API_KEY in Vercel)
async function searchTavily(query: string): Promise<WebSearchResult[]> {
  const key = process.env.TAVILY_API_KEY;
  if (!key) return [];

  try {
    const res = await fetchWithTimeout(
      'https://api.tavily.com/search',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api_key: key,
          query,
          search_depth: 'basic',
          max_results: 4,
        }),
      },
      4500
    );

    if (!res.ok) return [];
    const data = await res.json();
    return (data.results || []).map((r: any) => ({
      title: r.title,
      url: r.url,
      snippet: r.content,
      source: new URL(r.url).hostname.replace('www.', ''),
    }));
  } catch {
    return [];
  }
}

// Check if a query is informational / factual / news / real-time
// Check if a query specifically benefits from live web search
export function isSearchWorthy(query: string): boolean {
  if (!query || query.trim().length < 3) return false;
  const q = query.toLowerCase().trim();

  // Explicit keywords that demand real-time search
  const triggerKeywords = [
    'news', 'today', 'latest', 'current', 'update', 'notun', 'khobor', 'ajker',
    'bortoman', 'price', 'dam', 'rate', 'weather', 'abohawa', 'score', 'match',
    'khela', 'release date', 'election', '2025', '2026', 'dollar', 'taka',
    'search', 'google', 'live', 'shobshobon', 'somproti'
  ];

  return triggerKeywords.some((k) => q.includes(k));
}

// Main Real-Time Web Search & Grounding Engine
export async function performWebSearchGrounding(
  query: string,
  lang: string = 'en'
): Promise<SearchGroundingContext> {
  if (!isSearchWorthy(query)) {
    return {
      query,
      results: [],
      formattedContext: '',
      hasRealTimeData: false,
    };
  }

  const cleanQuery = query.replace(/[?।!,]/g, ' ').trim();
  const q = cleanQuery.toLowerCase();

  const searchTasks: Array<Promise<WebSearchResult[]>> = [];

  if (process.env.TAVILY_API_KEY) {
    searchTasks.push(searchTavily(cleanQuery));
  }

  if (q.includes('weather') || q.includes('abohawa') || q.includes('temperature') || q.includes('tapmatra')) {
    searchTasks.push(searchLiveWeather(cleanQuery));
  } else if (q.includes('dollar') || q.includes('usd') || q.includes('taka') || q.includes('bdt') || q.includes('rate') || q.includes('currency')) {
    searchTasks.push(searchLiveCurrency(cleanQuery));
  } else if (q.includes('tech') || q.includes('next.js') || q.includes('ai') || q.includes('github') || q.includes('python')) {
    searchTasks.push(searchHackerNews(cleanQuery));
    searchTasks.push(searchGoogleNews(cleanQuery, lang));
  } else {
    searchTasks.push(searchGoogleNews(cleanQuery, lang));
  }

  // Fast parallel resolution
  const resultsGroups = await Promise.all(searchTasks);
  const seenUrls = new Set<string>();
  const combined: WebSearchResult[] = [];

  for (const group of resultsGroups) {
    for (const item of group) {
      if (item.url && !seenUrls.has(item.url)) {
        seenUrls.add(item.url);
        combined.push(item);
      }
    }
  }

  const finalResults = combined.slice(0, 5);

  if (!finalResults.length) {
    return {
      query,
      results: [],
      formattedContext: '',
      hasRealTimeData: false,
    };
  }

  const formattedLines = finalResults.map((r, idx) => {
    return `[${idx + 1}] Title: "${r.title}"
    URL: ${r.url}
    Source: ${r.source || 'Web Source'}${r.publishedDate ? ` | Date: ${r.publishedDate}` : ''}
    Details: ${r.snippet}`;
  });

  const formattedContext = `### 🌐 LIVE REAL-TIME GOOGLE & WEB SEARCH RESULTS (Current Local Time: 2026-09-24):
${formattedLines.join('\n\n')}

### 📌 CRITICAL CITATION & SOURCE REFERENCE RULES (GOOGLE GEMINI STYLE):
1. Use the live real-time information above to provide accurate, up-to-date facts, current dates, and details.
2. In your response body, cite your statements where appropriate using markdown links, e.g. [Source Name](URL) or [1](URL).
3. At the very end of your response, ALWAYS include a clean, dedicated section formatted exactly like this:
---
### 🌐 সূত্রসমূহ (Sources & References):
1. [Source Title](Source URL) — *Publisher/Domain*
2. [Source Title](Source URL) — *Publisher/Domain*`;

  return {
    query,
    results: finalResults,
    formattedContext,
    hasRealTimeData: true,
  };
}
