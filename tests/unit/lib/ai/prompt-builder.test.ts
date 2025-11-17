import { describe, it, expect } from 'vitest';
import { PromptBuilder } from '@/lib/ai/prompt-builder';
import { mockProject } from '../../../fixtures/projects';
import { mockAIConfig } from '../../../fixtures/ai-configs';

describe('PromptBuilder', () => {
    const testProject = {
        authorName: mockProject.authorName!,
        authorRole: mockProject.authorRole!,
        company: mockProject.company!,
        industry: mockProject.industry!,
        bookTitle: mockProject.bookTitle!,
        targetReaders: mockProject.targetReaders!,
        currentSituation: mockProject.currentSituation!,
        challengeFaced: mockProject.challengeFaced!,
        transformation: mockProject.transformation!,
        achievement: mockProject.achievement!,
        lessonLearned: mockProject.lessonLearned!,
        businessGoals: mockProject.businessGoals!,
        uniqueValue: mockProject.uniqueValue!,
    };

    const testConfig = {
        ...mockAIConfig,
        targetWordsPerChapter: 5000,
        useCustomPrompts: false,
    };

    describe('buildAudienceInstructions', () => {
        it('should build audience instructions with target readers', () => {
            const result = PromptBuilder.buildAudienceInstructions(testProject);

            expect(result).toContain('PUBBLICO TARGET');
            expect(result).toContain(testProject.targetReaders);
            expect(result).toContain('Adatta il linguaggio');
        });

        it('should format instructions properly', () => {
            const result = PromptBuilder.buildAudienceInstructions(testProject);

            expect(result.startsWith('# PUBBLICO TARGET')).toBe(true);
            expect(result).toMatch(/\n\n/);
        });
    });

    describe('buildGoalInstructions', () => {
        it('should build goal instructions with business goals', () => {
            const result = PromptBuilder.buildGoalInstructions(testProject);

            expect(result).toContain('OBIETTIVO DEL LIBRO');
            expect(result).toContain(testProject.businessGoals);
            expect(result).toContain('supportare questi obiettivi');
        });

        it('should format instructions properly', () => {
            const result = PromptBuilder.buildGoalInstructions(testProject);

            expect(result.startsWith('# OBIETTIVO DEL LIBRO')).toBe(true);
        });
    });

    describe('buildSystemPrompt', () => {
        it('should build complete system prompt with all project details', () => {
            const result = PromptBuilder.buildSystemPrompt(testProject, testConfig as any);

            expect(result).toContain('ghostwriter professionista');
            expect(result).toContain(testProject.authorName);
            expect(result).toContain(testProject.authorRole);
            expect(result).toContain(testProject.company);
            expect(result).toContain(testProject.industry);
            expect(result).toContain(testProject.currentSituation);
            expect(result).toContain(testProject.achievement);
        });

        it('should include target words per chapter', () => {
            const result = PromptBuilder.buildSystemPrompt(testProject, testConfig as any);

            expect(result).toContain('5000 parole');
        });

        it('should include Hero\'s Journey elements', () => {
            const result = PromptBuilder.buildSystemPrompt(testProject, testConfig as any);

            expect(result).toContain('CONTESTO NARRATIVO');
            expect(result).toContain('Situazione:');
            expect(result).toContain('Sfida:');
            expect(result).toContain('Trasformazione:');
            expect(result).toContain('Risultato:');
            expect(result).toContain('Lezione:');
        });

        it('should use custom system prompt when provided', () => {
            const customConfig = {
                ...testConfig,
                useCustomPrompts: true,
                customSystemPrompt: 'Custom system prompt for testing',
            };

            const result = PromptBuilder.buildSystemPrompt(testProject, customConfig as any);

            expect(result).toBe('Custom system prompt for testing');
            expect(result).not.toContain('ghostwriter professionista');
        });

        it('should instruct to write in first person', () => {
            const result = PromptBuilder.buildSystemPrompt(testProject, testConfig as any);

            expect(result).toContain('prima persona');
            expect(result).toContain(testProject.authorName);
        });
    });

    describe('buildOutlineInstructions', () => {
        it('should build outline instructions', () => {
            const result = PromptBuilder.buildOutlineInstructions(testProject, testConfig as any);

            expect(result).toContain('outline');
            expect(result).toContain('10-15 capitoli');
            expect(result).toContain(testProject.targetReaders);
            expect(result).toContain(testProject.businessGoals);
        });

        it('should include Hero\'s Journey arc', () => {
            const result = PromptBuilder.buildOutlineInstructions(testProject, testConfig as any);

            expect(result).toContain('Hero\'s Journey');
            expect(result).toContain(testProject.currentSituation);
            expect(result).toContain(testProject.achievement);
        });

        it('should use custom outline instructions when provided', () => {
            const customConfig = {
                ...testConfig,
                useCustomPrompts: true,
                customOutlineInstructions: 'Custom outline instructions',
            };

            const result = PromptBuilder.buildOutlineInstructions(testProject, customConfig as any);

            expect(result).toBe('Custom outline instructions');
        });
    });

    describe('buildChapterInstructions', () => {
        it('should build chapter structure instructions', () => {
            const result = PromptBuilder.buildChapterInstructions(testConfig as any);

            expect(result).toContain('Struttura:');
            expect(result).toContain('hook');
            expect(result).toContain('sviluppo punti chiave');
            expect(result).toContain('framework');
            expect(result).toContain('applicazione pratica');
            expect(result).toContain('conclusione');
        });

        it('should mention Markdown formatting', () => {
            const result = PromptBuilder.buildChapterInstructions(testConfig as any);

            expect(result).toContain('Markdown');
        });

        it('should use custom chapter instructions when provided', () => {
            const customConfig = {
                ...testConfig,
                useCustomPrompts: true,
                customChapterInstructions: 'Custom chapter instructions',
            };

            const result = PromptBuilder.buildChapterInstructions(customConfig as any);

            expect(result).toBe('Custom chapter instructions');
        });
    });

    describe('buildCompleteChapterPrompt', () => {
        it('should build complete prompt with system and user parts', () => {
            const context = { masterContext: {}, styleGuide: '' };
            const result = PromptBuilder.buildCompleteChapterPrompt(
                testProject,
                testConfig as any,
                context
            );

            expect(result).toHaveProperty('systemPrompt');
            expect(result).toHaveProperty('userPrompt');
        });

        it('should have non-empty system prompt', () => {
            const context = { masterContext: {}, styleGuide: '' };
            const result = PromptBuilder.buildCompleteChapterPrompt(
                testProject,
                testConfig as any,
                context
            );

            expect(result.systemPrompt.length).toBeGreaterThan(0);
            expect(result.systemPrompt).toContain('ghostwriter');
        });

        it('should have non-empty user prompt', () => {
            const context = { masterContext: {}, styleGuide: '' };
            const result = PromptBuilder.buildCompleteChapterPrompt(
                testProject,
                testConfig as any,
                context
            );

            expect(result.userPrompt.length).toBeGreaterThan(0);
            expect(result.userPrompt).toContain('Struttura:');
        });
    });
});
