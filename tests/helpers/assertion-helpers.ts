import { expect } from 'vitest';
import { Project, Chapter } from '@prisma/client';

/**
 * Custom assertion per verificare che un oggetto sia un progetto valido
 */
export function expectValidProject(project: any) {
    expect(project).toBeDefined();
    expect(project).toHaveProperty('id');
    expect(project).toHaveProperty('userId');
    expect(project).toHaveProperty('authorName');
    expect(project).toHaveProperty('bookTitle');
    expect(project).toHaveProperty('status');
    expect(typeof project.id).toBe('string');
    expect(typeof project.bookTitle).toBe('string');
}

/**
 * Custom assertion per verificare che un oggetto sia un capitolo valido
 */
export function expectValidChapter(chapter: any) {
    expect(chapter).toBeDefined();
    expect(chapter).toHaveProperty('id');
    expect(chapter).toHaveProperty('projectId');
    expect(chapter).toHaveProperty('chapterNumber');
    expect(chapter).toHaveProperty('title');
    expect(chapter).toHaveProperty('content');
    expect(chapter).toHaveProperty('status');
    expect(typeof chapter.id).toBe('string');
    expect(typeof chapter.chapterNumber).toBe('number');
}

/**
 * Custom assertion per verificare che un array contenga progetti validi
 */
export function expectValidProjects(projects: any[]) {
    expect(Array.isArray(projects)).toBe(true);
    projects.forEach(expectValidProject);
}

/**
 * Custom assertion per verificare che un array contenga capitoli validi
 */
export function expectValidChapters(chapters: any[]) {
    expect(Array.isArray(chapters)).toBe(true);
    chapters.forEach(expectValidChapter);
}

/**
 * Helper per verificare che una risposta API contenga un errore
 */
export function expectApiError(response: any, message?: string) {
    expect(response).toHaveProperty('error');
    if (message) {
        expect(response.error).toContain(message);
    }
}

/**
 * Helper per verificare che una risposta API sia un successo
 */
export function expectApiSuccess(response: any) {
    expect(response).not.toHaveProperty('error');
}

/**
 * Helper per verificare che un oggetto abbia proprietà specifiche
 */
export function expectHasProperties(obj: any, properties: string[]) {
    properties.forEach((prop) => {
        expect(obj).toHaveProperty(prop);
    });
}

/**
 * Helper per verificare che un array non sia vuoto
 */
export function expectNonEmptyArray(arr: any[]) {
    expect(Array.isArray(arr)).toBe(true);
    expect(arr.length).toBeGreaterThan(0);
}

/**
 * Helper per verificare che una stringa sia un JSON valido
 */
export function expectValidJSON(str: string) {
    expect(() => JSON.parse(str)).not.toThrow();
}

/**
 * Helper per verificare che un numero sia in un range
 */
export function expectInRange(num: number, min: number, max: number) {
    expect(num).toBeGreaterThanOrEqual(min);
    expect(num).toBeLessThanOrEqual(max);
}

/**
 * Helper per verificare che una data sia valida
 */
export function expectValidDate(date: any) {
    expect(date).toBeInstanceOf(Date);
    expect(isNaN(date.getTime())).toBe(false);
}
