import { prismaMock } from '../__mocks__/prisma.mock';
import { mockProject, mockProjects } from '../fixtures/projects';
import { mockChapter, mockChapters } from '../fixtures/chapters';

/**
 * Helper per configurare il mock del database con dati di test
 */
export function setupMockDatabase() {
    // Reset all mocks before each test
    prismaMock.project.findMany.mockResolvedValue([]);
    prismaMock.project.findUnique.mockResolvedValue(null);
    prismaMock.chapter.findMany.mockResolvedValue([]);
    prismaMock.chapter.findUnique.mockResolvedValue(null);
}

/**
 * Helper per creare un progetto mock nel database
 */
export function mockDatabaseProject(project = mockProject) {
    prismaMock.project.findUnique.mockResolvedValue(project as any);
    prismaMock.project.findMany.mockResolvedValue([project] as any);
    prismaMock.project.create.mockResolvedValue(project as any);
    prismaMock.project.update.mockResolvedValue(project as any);
    return project;
}

/**
 * Helper per creare multipli progetti mock nel database
 */
export function mockDatabaseProjects(projects = mockProjects) {
    prismaMock.project.findMany.mockResolvedValue(projects as any);
    return projects;
}

/**
 * Helper per creare un capitolo mock nel database
 */
export function mockDatabaseChapter(chapter = mockChapter) {
    prismaMock.chapter.findUnique.mockResolvedValue(chapter as any);
    prismaMock.chapter.findMany.mockResolvedValue([chapter] as any);
    prismaMock.chapter.create.mockResolvedValue(chapter as any);
    prismaMock.chapter.update.mockResolvedValue(chapter as any);
    return chapter;
}

/**
 * Helper per creare multipli capitoli mock nel database
 */
export function mockDatabaseChapters(chapters = mockChapters) {
    prismaMock.chapter.findMany.mockResolvedValue(chapters as any);
    return chapters;
}

/**
 * Helper per simulare errore nel database
 */
export function mockDatabaseError(error = new Error('Database error')) {
    prismaMock.project.findUnique.mockRejectedValue(error);
    prismaMock.project.create.mockRejectedValue(error);
    prismaMock.project.update.mockRejectedValue(error);
    prismaMock.chapter.findUnique.mockRejectedValue(error);
    prismaMock.chapter.create.mockRejectedValue(error);
    prismaMock.chapter.update.mockRejectedValue(error);
    return error;
}

/**
 * Helper per pulire il database dopo i test
 */
export async function cleanupDatabase() {
    // In a real scenario with a test database, you would delete all records
    // With mocks, we just reset them
    setupMockDatabase();
}
