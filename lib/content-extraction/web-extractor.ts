/**
 * Web Content Extractor
 * 
 * Extracts meaningful text content from websites for AI analysis
 * Focuses on main content, removes navigation, ads, and boilerplate
 */

import * as cheerio from 'cheerio';
import { logger } from '@/lib/logger';

export interface WebExtractionResult {
    text: string;
    wordCount: number;
    metadata: {
        url: string;
        title?: string;
        description?: string;
        scrapeDate: string;
        statusCode?: number;
    };
}

interface FetchOptions {
    timeout?: number;
    maxContentLength?: number;
    userAgent?: string;
}

const DEFAULT_OPTIONS: Required<FetchOptions> = {
    timeout: 15000, // 15 seconds
    maxContentLength: 5 * 1024 * 1024, // 5MB max
    userAgent: 'Mozilla/5.0 (compatible; GhostWriter/1.0; +https://ghostwriter.ai)',
};

/**
 * Extract meaningful content from a website URL
 */
export async function extractFromWebsite(
    url: string,
    options: FetchOptions = {}
): Promise<WebExtractionResult> {
    const opts = { ...DEFAULT_OPTIONS, ...options };

    // Validate URL
    let parsedUrl: URL;
    try {
        parsedUrl = new URL(url);
        if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
            throw new Error('Solo URL HTTP/HTTPS sono supportati');
        }
    } catch (error) {
        throw new Error('URL non valido');
    }

    logger.info(`🌐 Fetching website: ${url}`);

    // Fetch HTML with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), opts.timeout);

    let html: string;
    let statusCode: number;

    try {
        const response = await fetch(url, {
            signal: controller.signal,
            headers: {
                'User-Agent': opts.userAgent,
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'it-IT,it;q=0.9,en-US;q=0.8,en;q=0.7',
                'Accept-Encoding': 'gzip, deflate, br',
                'Cache-Control': 'no-cache',
            },
            redirect: 'follow',
        });

        statusCode = response.status;

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const contentType = response.headers.get('content-type') || '';
        if (!contentType.includes('text/html')) {
            throw new Error('Il contenuto non è HTML');
        }

        html = await response.text();

        if (html.length > opts.maxContentLength) {
            html = html.substring(0, opts.maxContentLength);
        }

    } catch (error) {
        if (error instanceof Error) {
            if (error.name === 'AbortError') {
                throw new Error('Timeout: il sito non risponde');
            }
            throw error;
        }
        throw new Error('Errore durante il download della pagina');
    } finally {
        clearTimeout(timeoutId);
    }

    logger.info(`✅ HTML fetched: ${(html.length / 1024).toFixed(2)}KB`);

    // Parse HTML with Cheerio
    const $ = cheerio.load(html);

    // Extract metadata
    const title = $('title').text().trim() ||
        $('meta[property="og:title"]').attr('content') ||
        $('h1').first().text().trim();

    const description = $('meta[name="description"]').attr('content') ||
        $('meta[property="og:description"]').attr('content') ||
        '';

    // Remove unwanted elements
    $(
        'script, style, noscript, iframe, nav, header, footer, aside, ' +
        '.nav, .navigation, .menu, .sidebar, .footer, .header, ' +
        '.advertisement, .ad, .ads, .cookie-banner, .social-share, ' +
        '#comments, .comments, .comment-section'
    ).remove();

    // Try to find main content with semantic selectors
    let mainContent = '';

    const contentSelectors = [
        'main',
        '[role="main"]',
        'article',
        '.main-content',
        '.content',
        '.post-content',
        '.entry-content',
        '#content',
        '#main',
    ];

    for (const selector of contentSelectors) {
        const element = $(selector).first();
        if (element.length > 0) {
            mainContent = element.text();
            if (mainContent.trim().length > 200) {
                logger.info(`📄 Content extracted from: ${selector}`);
                break;
            }
        }
    }

    // Fallback: extract from body if no main content found
    if (!mainContent || mainContent.trim().length < 200) {
        mainContent = $('body').text();
        logger.info('📄 Content extracted from: body (fallback)');
    }

    // Clean up text
    const cleanText = mainContent
        .replace(/\s+/g, ' ') // Normalize whitespace
        .replace(/\n{3,}/g, '\n\n') // Max 2 consecutive newlines
        .trim();

    if (cleanText.length < 100) {
        throw new Error('Contenuto troppo breve o impossibile da estrarre');
    }

    const wordCount = countWords(cleanText);

    logger.info(`✅ Extracted ${wordCount} words from ${url}`);

    return {
        text: cleanText,
        wordCount,
        metadata: {
            url: parsedUrl.toString(),
            title,
            description,
            scrapeDate: new Date().toISOString(),
            statusCode,
        },
    };
}

/**
 * Utility function to count words in text
 */
function countWords(text: string): number {
    return text
        .trim()
        .split(/\s+/)
        .filter((word) => word.length > 0).length;
}

/**
 * Extract internal links from HTML
 */
function extractInternalLinks(html: string, baseUrl: string): string[] {
    const $ = cheerio.load(html);
    const baseUrlObj = new URL(baseUrl);
    const links = new Set<string>();

    $('a[href]').each((_, element) => {
        const href = $(element).attr('href');
        if (!href) return;

        try {
            // Convert relative URLs to absolute
            const absoluteUrl = new URL(href, baseUrl);

            // Only include same-origin links (same domain)
            if (absoluteUrl.origin === baseUrlObj.origin) {
                // Remove hash and query params for deduplication
                absoluteUrl.hash = '';
                absoluteUrl.search = '';
                const cleanUrl = absoluteUrl.toString();

                // Exclude common non-content URLs
                const excludePatterns = [
                    /\.(pdf|jpg|jpeg|png|gif|svg|zip|exe|dmg)$/i,
                    /\/login|\/logout|\/signin|\/signup|\/register/i,
                    /\/cart|\/checkout|\/account|\/profile/i,
                    /\/admin|\/wp-admin|\/dashboard/i,
                    /#/,
                ];

                const shouldExclude = excludePatterns.some(pattern => pattern.test(cleanUrl));
                if (!shouldExclude && cleanUrl !== baseUrl) {
                    links.add(cleanUrl);
                }
            }
        } catch (error) {
            // Skip invalid URLs
        }
    });

    return Array.from(links);
}

/**
 * Crawl website with depth limit
 */
export async function crawlWebsite(
    startUrl: string,
    options: FetchOptions & { maxDepth?: number; maxPages?: number } = {}
): Promise<WebExtractionResult> {
    const maxDepth = options.maxDepth || 2;
    const maxPages = options.maxPages || 20;

    logger.info(`🕷️ Starting crawl: ${startUrl} (depth: ${maxDepth}, max pages: ${maxPages})`);

    const visited = new Set<string>();
    const toVisit: Array<{ url: string; depth: number }> = [{ url: startUrl, depth: 0 }];
    const results: WebExtractionResult[] = [];

    while (toVisit.length > 0 && visited.size < maxPages) {
        const current = toVisit.shift()!;

        // Skip if already visited or depth exceeded
        if (visited.has(current.url) || current.depth > maxDepth) {
            continue;
        }

        logger.info(`📄 Crawling [${current.depth}]: ${current.url}`);
        visited.add(current.url);

        try {
            // Fetch page content
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), options.timeout || DEFAULT_OPTIONS.timeout);

            const response = await fetch(current.url, {
                signal: controller.signal,
                headers: {
                    'User-Agent': options.userAgent || DEFAULT_OPTIONS.userAgent,
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                    'Accept-Language': 'it-IT,it;q=0.9,en-US;q=0.8,en;q=0.7',
                },
                redirect: 'follow',
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                logger.warn(`⚠️ Skipping ${current.url}: HTTP ${response.status}`);
                continue;
            }

            const contentType = response.headers.get('content-type') || '';
            if (!contentType.includes('text/html')) {
                logger.warn(`⚠️ Skipping ${current.url}: Not HTML`);
                continue;
            }

            const html = await response.text();

            // Extract content from this page
            const extraction = await extractFromWebsite(current.url, options);
            results.push(extraction);

            // Extract links for next level (only if not at max depth)
            if (current.depth < maxDepth && visited.size < maxPages) {
                const links = extractInternalLinks(html, current.url);
                logger.info(`🔗 Found ${links.length} internal links at depth ${current.depth}`);

                // Add new links to visit queue
                for (const link of links.slice(0, 10)) { // Limit links per page
                    if (!visited.has(link) && !toVisit.some(item => item.url === link)) {
                        toVisit.push({ url: link, depth: current.depth + 1 });
                    }
                }
            }

            // Small delay to be respectful
            await new Promise(resolve => setTimeout(resolve, 500));

        } catch (error) {
            logger.error(`❌ Error crawling ${current.url}:`, error instanceof Error ? error.message : error);
            continue;
        }
    }

    if (results.length === 0) {
        throw new Error('Impossibile estrarre contenuto da nessuna pagina');
    }

    // Sort results by word count (longer pages first = more important content)
    const sortedResults = [...results].sort((a, b) => b.wordCount - a.wordCount);

    // Combine results with smart truncation to stay within reasonable limits
    const MAX_TOTAL_WORDS = 20000; // Limit for GPT-5 analysis
    let currentWordCount = 0;
    const selectedResults: WebExtractionResult[] = [];

    for (const result of sortedResults) {
        if (currentWordCount + result.wordCount <= MAX_TOTAL_WORDS) {
            selectedResults.push(result);
            currentWordCount += result.wordCount;
        } else if (selectedResults.length < 3) {
            // Always include at least 3 pages even if exceeding limit slightly
            selectedResults.push(result);
            currentWordCount += result.wordCount;
        } else {
            break;
        }
    }

    logger.info(`📊 Selected ${selectedResults.length}/${results.length} pages for analysis (${currentWordCount} words)`);

    // Combine all results with clear sections
    const combinedText = selectedResults
        .map((r, i) => {
            const pageTitle = r.metadata.title || new URL(r.metadata.url).pathname;
            return `=== Pagina ${i + 1}: ${pageTitle} ===\nURL: ${r.metadata.url}\nParole: ${r.wordCount}\n\n${r.text}`;
        })
        .join('\n\n─────────────────────────────────────\n\n');

    logger.info(`✅ Crawl complete: ${results.length} pages crawled, ${selectedResults.length} pages included, ${currentWordCount} total words`);

    return {
        text: combinedText,
        wordCount: currentWordCount,
        metadata: {
            url: startUrl,
            title: results[0]?.metadata.title || '',
            description: results[0]?.metadata.description || '',
            scrapeDate: new Date().toISOString(),
        },
    };
}

/**
 * Extract text from multiple URLs and combine
 */
export async function extractFromMultipleUrls(
    urls: string[],
    options: FetchOptions = {}
): Promise<WebExtractionResult> {
    if (urls.length === 0) {
        throw new Error('Almeno un URL è richiesto');
    }

    if (urls.length > 5) {
        throw new Error('Massimo 5 URL supportati');
    }

    logger.info(`🌐 Fetching ${urls.length} URLs...`);

    // Extract from all URLs in parallel (with individual error handling)
    const results = await Promise.allSettled(
        urls.map(url => extractFromWebsite(url, options))
    );

    const successfulResults: WebExtractionResult[] = [];
    const failedUrls: string[] = [];

    results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
            successfulResults.push(result.value);
        } else {
            failedUrls.push(urls[index]);
            logger.error(`❌ Failed to extract from ${urls[index]}:`, result.reason);
        }
    });

    if (successfulResults.length === 0) {
        throw new Error('Impossibile estrarre contenuto da nessun URL');
    }

    // Combine all extracted text
    const combinedText = successfulResults
        .map(r => r.text)
        .join('\n\n---\n\n');

    const combinedWordCount = successfulResults.reduce(
        (sum, r) => sum + r.wordCount,
        0
    );

    logger.info(`✅ Combined ${successfulResults.length}/${urls.length} URLs: ${combinedWordCount} words`);

    return {
        text: combinedText,
        wordCount: combinedWordCount,
        metadata: {
            url: urls.join(', '),
            title: successfulResults.map(r => r.metadata.title).filter(Boolean).join(' | '),
            description: successfulResults[0]?.metadata.description || '',
            scrapeDate: new Date().toISOString(),
        },
    };
}
