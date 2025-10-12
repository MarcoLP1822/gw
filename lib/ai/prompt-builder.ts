import type { ProjectAIConfig } from '@prisma/client';
import type { ProjectFormData } from '@/types';

export class PromptBuilder {
    static buildAudienceInstructions(project: ProjectFormData): string {
        return `# PUBBLICO TARGET\n\n${project.targetReaders}\n\nAdatta il linguaggio, gli esempi e la complessità a questo pubblico.`;
    }

    static buildGoalInstructions(project: ProjectFormData): string {
        return `# OBIETTIVO DEL LIBRO\n\n${project.businessGoals}\n\nScrivi in modo da supportare questi obiettivi business.`;
    }

    static buildSystemPrompt(project: ProjectFormData, config: ProjectAIConfig): string {
        if (config.useCustomPrompts && config.customSystemPrompt) {
            return config.customSystemPrompt;
        }

        return `Sei un ghostwriter professionista.

${this.buildAudienceInstructions(project)}

${this.buildGoalInstructions(project)}

# LUNGHEZZA: ~${config.targetWordsPerChapter} parole per capitolo

# AUTORE
- Nome: ${project.authorName}
- Ruolo: ${project.authorRole}  
- Azienda: ${project.company}
- Settore: ${project.industry}
- Valore unico: ${project.uniqueValue}

# CONTESTO NARRATIVO
- Situazione: ${project.currentSituation}
- Sfida: ${project.challengeFaced}
- Trasformazione: ${project.transformation}
- Risultato: ${project.achievement}
- Lezione: ${project.lessonLearned}

Scrivi in prima persona come ${project.authorName}, mantieni coerenza e usa esempi concreti.`;
    }

    static buildOutlineInstructions(project: ProjectFormData, config: ProjectAIConfig): string {
        if (config.useCustomPrompts && config.customOutlineInstructions) {
            return config.customOutlineInstructions;
        }

        return `Crea outline per libro con 10-15 capitoli (~${config.targetWordsPerChapter} parole/cap).
Pubblico: ${project.targetReaders}
Obiettivo: ${project.businessGoals}
Usa Hero's Journey basato su: ${project.currentSituation} → ${project.achievement}`;
    }

    static buildChapterInstructions(config: ProjectAIConfig): string {
        if (config.useCustomPrompts && config.customChapterInstructions) {
            return config.customChapterInstructions;
        }

        return `Struttura: hook, sviluppo punti chiave, framework/metodologia, applicazione pratica, conclusione.
Varia lo stile di apertura. Usa Markdown.`;
    }

    static buildCompleteChapterPrompt(
        project: ProjectFormData,
        config: ProjectAIConfig,
        context: any
    ): { systemPrompt: string; userPrompt: string } {
        return {
            systemPrompt: this.buildSystemPrompt(project, config),
            userPrompt: this.buildChapterInstructions(config),
        };
    }
}