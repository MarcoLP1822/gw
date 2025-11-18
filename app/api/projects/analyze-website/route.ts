/**
 * API Route to Analyze Website and Extract Project Data
 * 
 * POST /api/projects/analyze-website - Fetch website content, generate style guide, extract project data
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { extractFromWebsite, extractFromMultipleUrls, crawlWebsite } from '@/lib/content-extraction/web-extractor';
import { callGPT5JSON } from '@/lib/ai/responses-api';
import { ProjectFormData } from '@/types';
import { rateLimit, RateLimitPresets } from '@/lib/rate-limit';
import { handleApiError } from '@/lib/errors/api-errors';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Allow up to 60 seconds for analysis

interface AnalysisResult {
    success: boolean;
    projectData?: Partial<ProjectFormData>;
    styleGuide?: string;
    error?: string;
}

/**
 * POST - Analyze website URL and extract project information
 */
export async function POST(request: NextRequest) {
    try {
        // Rate limiting: max 2 analisi AI al minuto
        await rateLimit(request, RateLimitPresets.AI_GENERATION);

        const body = await request.json();
        const { url, urls, crawl = false, maxDepth = 2, maxPages = 20 } = body;

        // Validate input
        if (!url && (!urls || urls.length === 0)) {
            return NextResponse.json(
                { success: false, error: 'URL o lista di URLs richiesti' },
                { status: 400 }
            );
        }

        logger.info('Analyzing website', { url: url || urls, crawl, maxDepth, maxPages });

        // Extract content from website(s)
        logger.info('Extracting content from website');

        let extraction;
        if (crawl && url) {
            // Crawl mode: follow internal links
            extraction = await crawlWebsite(url, { maxDepth, maxPages });
        } else if (urls && urls.length > 1) {
            extraction = await extractFromMultipleUrls(urls);
        } else {
            extraction = await extractFromWebsite(url || urls[0]);
        }

        const extractedText = extraction.text;

        if (!extractedText || extractedText.trim().length < 100) {
            return NextResponse.json(
                { success: false, error: 'Contenuto del sito troppo breve o impossibile da estrarre' },
                { status: 400 }
            );
        }

        logger.debug('Content extracted', { wordCount: extraction.wordCount, url: extraction.metadata.url });

        // 3. Analyze with GPT-5

        // Parallel processing: Generate style guide + Extract project data
        logger.info('🤖 Starting AI analysis...');

        const [styleGuide, projectData] = await Promise.all([
            generateStyleGuideFromText(extractedText),
            extractProjectDataFromText(extractedText)
        ]);

        logger.info('✅ Analysis complete');

        return NextResponse.json({
            success: true,
            projectData,
            styleGuide,
            extractionInfo: {
                url: extraction.metadata.url,
                title: extraction.metadata.title,
                description: extraction.metadata.description,
                wordCount: extraction.wordCount,
                scrapeDate: extraction.metadata.scrapeDate,
            }
        });

    } catch (error) {
        logger.error('❌ Error analyzing website', error);

        // Provide user-friendly error messages
        let errorMessage = 'Errore durante l\'analisi del sito web';

        if (error instanceof Error) {
            if (error.message.includes('URL non valido')) {
                errorMessage = 'URL non valido. Verifica che sia corretto.';
            } else if (error.message.includes('Timeout')) {
                errorMessage = 'Il sito non risponde. Riprova più tardi.';
            } else if (error.message.includes('HTTP')) {
                errorMessage = 'Impossibile accedere al sito. Verifica l\'URL.';
            } else if (error.message.includes('Contenuto troppo breve')) {
                errorMessage = 'Il sito non contiene abbastanza contenuto testuale.';
            } else {
                errorMessage = error.message;
            }
        }

        return NextResponse.json(
            {
                success: false,
                error: errorMessage
            },
            { status: 500 }
        );
    }
}

/**
 * Generate style guide from text using AI
 * REUSED from analyze-document route
 */
async function generateStyleGuideFromText(text: string): Promise<string> {
    const prompt = `Analizza il seguente testo e genera uno style guide dettagliato per aiutare un'AI a scrivere nello stesso stile.

Lo style guide deve includere:
1. Tono e voce (formale/informale, prima/terza persona, ecc.)
2. Struttura delle frasi (lunghe/corte, complesse/semplici)
3. Vocabolario preferito (parole chiave, terminologia)
4. Peculiarità stilistiche (figure retoriche, ritmo, ecc.)
5. Esempi concreti di frasi caratteristiche
6. Cosa evitare

Sii specifico e pratico. Lo style guide verrà usato come riferimento per scrivere capitoli coerenti.

TESTO DA ANALIZZARE:
${text.substring(0, 15000)}${text.length > 15000 ? '\n\n[...testo troncato...]' : ''}

Rispondi con un JSON nel formato:
{
  "styleGuide": "Il testo dello style guide completo qui"
}`;

    const systemPrompt = 'Sei un esperto di analisi stilistica e redazione di style guide per scrittura creativa.';
    const fullPrompt = `${systemPrompt}\n\n---\n\n${prompt}`;

    const response = await callGPT5JSON<{ styleGuide: string }>(fullPrompt, {
        model: 'gpt-5-mini',
        reasoningEffort: 'low',
        verbosity: 'high',
        maxOutputTokens: 8000,
    });

    return response.styleGuide;
}

/**
 * Extract project data from text using AI
 * REUSED from analyze-document route
 */
async function extractProjectDataFromText(text: string): Promise<Partial<ProjectFormData>> {
    const prompt = `Analizza il seguente contenuto web e estrai le informazioni per creare un progetto di ghost writing.

Il contenuto può includere:
- Bio/CV dell'autore
- Informazioni sull'azienda/brand
- Storia imprenditoriale
- Prodotti/servizi offerti
- Sfide e risultati
- Mission e valori

CONTENUTO SITO WEB:
${text.substring(0, 20000)}${text.length > 20000 ? '\n\n[...testo troncato...]' : ''}

Estrai le seguenti informazioni (lascia stringa vuota "" se non presenti):

1. authorName: Nome completo dell'autore/founder (es. "Mario Rossi")
2. authorRole: Ruolo/posizione (es. "CEO", "Founder", "Imprenditore")
3. company: Nome azienda/brand
4. industry: Settore/industria (es. "Tech", "Finance", "E-commerce")
5. bookTitle: Possibile titolo del libro basato sul brand/storia
6. bookSubtitle: Possibile sottotitolo
7. targetReaders: A chi potrebbe essere rivolto il libro (pubblico target)
8. currentSituation: Situazione attuale dell'azienda/brand
9. challengeFaced: Sfide/problemi affrontati nel percorso
10. transformation: Trasformazione/crescita avvenuta
11. achievement: Risultati/traguardi raggiunti
12. lessonLearned: Lezioni apprese/insegnamenti chiave
13. businessGoals: Possibili obiettivi business del libro
14. uniqueValue: Valore unico/differenziante dell'autore o dell'azienda
15. additionalNotes: Altri dettagli rilevanti dal sito

Rispondi SOLO con un oggetto JSON valido nel formato:
{
  "authorName": "...",
  "authorRole": "...",
  "company": "...",
  "industry": "...",
  "bookTitle": "...",
  "bookSubtitle": "...",
  "targetReaders": "...",
  "currentSituation": "...",
  "challengeFaced": "...",
  "transformation": "...",
  "achievement": "...",
  "lessonLearned": "...",
  "businessGoals": "...",
  "uniqueValue": "...",
  "additionalNotes": "..."
}

IMPORTANTE: Usa stringa vuota "" per campi non trovati. NON inventare informazioni. Sii conservativo.`;

    const systemPrompt = 'Sei un esperto di analisi web e estrazione di informazioni strutturate. Rispondi SOLO con JSON valido, senza markdown o testo aggiuntivo.';
    const fullPrompt = `${systemPrompt}\n\n---\n\n${prompt}`;

    try {
        const response = await callGPT5JSON<Partial<ProjectFormData>>(fullPrompt, {
            model: 'gpt-5-mini',
            reasoningEffort: 'low', // Low è sufficiente per estrazione
            verbosity: 'low',
            maxOutputTokens: 4000,
        });

        // Clean up empty strings and ensure proper types
        const cleanedData: any = {};

        for (const [key, value] of Object.entries(response)) {
            if (typeof value === 'string' && value.trim().length > 0) {
                cleanedData[key] = value.trim();
            }
        }

        return cleanedData as Partial<ProjectFormData>;
    } catch (error) {
        logger.error('Error extracting project data', error);
        // Return empty object on error - user will fill manually
        return {};
    }
}
