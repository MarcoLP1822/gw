/**
 * API Route to Analyze Document and Extract Project Data
 * 
 * POST /api/projects/analyze-document - Upload document, extract text, generate style guide, extract project data
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { getExtractorForFile } from '@/lib/document-processing/text-extractor';
import { callGPT5JSON } from '@/lib/ai/responses-api';
import { StyleGuideService } from '@/lib/services/style-guide-service';
import { ProjectFormData } from '@/types';
import { rateLimit, RateLimitPresets } from '@/lib/rate-limit';
import { handleApiError } from '@/lib/errors/api-errors';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Allow up to 60 seconds for analysis

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

interface AnalysisResult {
    success: boolean;
    projectData?: Partial<ProjectFormData>;
    styleGuide?: string;
    error?: string;
}

/**
 * POST - Analyze uploaded document and extract project information
 */
export async function POST(request: NextRequest) {
    try {
        // Rate limiting: max 2 analisi AI al minuto
        await rateLimit(request, RateLimitPresets.AI_GENERATION);
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json(
                { success: false, error: 'Nessun file caricato' },
                { status: 400 }
            );
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json(
                { success: false, error: 'File troppo grande. Massimo 50MB' },
                { status: 400 }
            );
        }

        // Validate file type
        const validTypes = [
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain'
        ];
        const validExtensions = ['pdf', 'docx', 'txt'];
        const fileExtension = file.name.split('.').pop()?.toLowerCase();

        if (!validTypes.includes(file.type) && !validExtensions.includes(fileExtension || '')) {
            return NextResponse.json(
                { success: false, error: 'Tipo di file non supportato. Usa PDF, DOCX o TXT' },
                { status: 400 }
            );
        }

        logger.info('Analyzing document', { fileName: file.name, sizeMB: (file.size / 1024 / 1024).toFixed(2) });

        // Convert file to buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Extract text from document
        logger.info('🔍 Extracting text...');
        const extractor = await getExtractorForFile(file.type, file.name);

        if (!extractor.supports(file.type, file.name)) {
            return NextResponse.json(
                { success: false, error: 'Tipo di file non supportato' },
                { status: 400 }
            );
        }

        const extraction = await extractor.extract(buffer, file.name);
        const extractedText = extraction.text;

        if (!extractedText || extractedText.trim().length < 100) {
            return NextResponse.json(
                { success: false, error: 'Documento troppo corto o impossibile estrarre testo' },
                { status: 400 }
            );
        }

        logger.debug('Text extracted from document', { wordCount: extraction.wordCount });

        // Parallel processing: Generate style guide + Extract project data
        logger.info('Starting AI analysis');

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
                fileName: file.name,
                wordCount: extraction.wordCount,
                fileSize: file.size
            }
        });

    } catch (error) {
        logger.error('❌ Error analyzing document', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Errore durante l\'analisi del documento'
            },
            { status: 500 }
        );
    }
}

/**
 * Generate style guide from text using AI
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
 */
async function extractProjectDataFromText(text: string): Promise<Partial<ProjectFormData>> {
    const prompt = `Analizza il seguente documento e estrai le informazioni per creare un progetto di ghost writing.

Il documento può contenere:
- Bio/CV dell'autore
- Appunti o bozze
- Informazioni sull'azienda/brand
- Storia imprenditoriale
- Sfide e risultati
- Obiettivi del libro

DOCUMENTO:
${text.substring(0, 20000)}${text.length > 20000 ? '\n\n[...testo troncato...]' : ''}

Estrai le seguenti informazioni (lascia stringa vuota "" se non presenti):

1. authorName: Nome completo dell'autore (es. "Mario Rossi")
2. authorRole: Ruolo/posizione (es. "CEO", "Founder", "Imprenditore")
3. company: Nome azienda/brand
4. industry: Settore/industria (es. "Tech", "Finance", "E-commerce")
5. bookTitle: Possibile titolo del libro (se menzionato o intuibile)
6. bookSubtitle: Possibile sottotitolo
7. targetReaders: A chi è rivolto il libro (pubblico target)
8. currentSituation: Situazione attuale o di partenza descritta
9. challengeFaced: Sfide/problemi affrontati
10. transformation: Trasformazione/cambiamento avvenuto
11. achievement: Risultati/traguardi raggiunti
12. lessonLearned: Lezioni apprese/insegnamenti
13. businessGoals: Obiettivi business del libro
14. uniqueValue: Valore unico/differenziante dell'autore o del contenuto
15. additionalNotes: Altri dettagli rilevanti

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

    const systemPrompt = 'Sei un esperto di analisi documentale e estrazione di informazioni strutturate. Rispondi SOLO con JSON valido, senza markdown o testo aggiuntivo.';
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
