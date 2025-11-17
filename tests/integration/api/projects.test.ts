import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mockProject, mockProjects } from '../../fixtures/projects';
import { createMockRequest, parseResponse, expectErrorResponse, expectSuccessResponse } from '../../helpers/api-helpers';

// Mock Prisma first
const prismaMock = {
    user: {
        findUnique: vi.fn(),
        create: vi.fn(),
    },
    project: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
    },
    chapter: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
    },
};

vi.mock('@/lib/db', () => ({
    prisma: prismaMock,
}));

// Import after mock
const { POST, GET } = await import('@/app/api/projects/route');

describe('API: /api/projects', () => {
    beforeEach(() => {
        // Reset all mocks before each test
        vi.clearAllMocks();
    }); describe('POST /api/projects', () => {
        const validProjectData = {
            authorName: 'Mario Rossi',
            authorRole: 'CEO',
            company: 'Tech Innovation SRL',
            industry: 'Technology',
            bookTitle: 'Il Futuro della Digital Transformation',
            bookSubtitle: 'Come innovare nella tua azienda',
            targetReaders: 'Manager e imprenditori',
            currentSituation: 'Le aziende faticano ad adottare nuove tecnologie',
            challengeFaced: 'Resistenza al cambiamento',
            transformation: 'Adozione graduale di tecnologie',
            achievement: 'Trasformazione digitale completa',
            lessonLearned: 'Il cambiamento richiede tempo',
            businessGoals: 'Aumentare efficienza del 30%',
            uniqueValue: 'Approccio pratico basato su casi reali',
            estimatedPages: 250,
        };

        it('should create a new project successfully', async () => {
            // Mock user lookup and creation
            prismaMock.user.findUnique.mockResolvedValue({
                id: 'test-user-id',
                email: 'demo@ghostwriting.com',
                name: 'Demo User',
                role: 'ghost_writer',
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            // Mock project creation
            prismaMock.project.create.mockResolvedValue(mockProject as any);

            const request = createMockRequest({
                method: 'POST',
                url: 'http://localhost:3000/api/projects',
                body: validProjectData,
            });

            const response = await POST(request);
            const data = await expectSuccessResponse(response, 201);

            expect(data.success).toBe(true);
            expect(data.project).toBeDefined();
            expect(data.project).toHaveProperty('id');
            expect(data.project).toHaveProperty('bookTitle');
            expect(prismaMock.project.create).toHaveBeenCalledTimes(1);
        });

        it('should return 400 if required fields are missing', async () => {
            const invalidData = {
                authorName: 'Mario Rossi',
                // Missing bookTitle and company
            };

            const request = createMockRequest({
                method: 'POST',
                url: 'http://localhost:3000/api/projects',
                body: invalidData,
            });

            const response = await POST(request);
            await expectErrorResponse(response, 400, 'Campi obbligatori mancanti');
        });

        it('should return 400 if authorName is missing', async () => {
            const invalidData = {
                ...validProjectData,
                authorName: '',
            };

            const request = createMockRequest({
                method: 'POST',
                url: 'http://localhost:3000/api/projects',
                body: invalidData,
            });

            const response = await POST(request);
            expect(response.status).toBe(400);
        });

        it('should return 400 if bookTitle is missing', async () => {
            const invalidData = {
                ...validProjectData,
                bookTitle: '',
            };

            const request = createMockRequest({
                method: 'POST',
                url: 'http://localhost:3000/api/projects',
                body: invalidData,
            });

            const response = await POST(request);
            expect(response.status).toBe(400);
        });

        it('should return 400 if company is missing', async () => {
            const invalidData = {
                ...validProjectData,
                company: '',
            };

            const request = createMockRequest({
                method: 'POST',
                url: 'http://localhost:3000/api/projects',
                body: invalidData,
            });

            const response = await POST(request);
            expect(response.status).toBe(400);
        });

        it('should handle database errors gracefully', async () => {
            prismaMock.user.findUnique.mockRejectedValue(new Error('Database connection failed'));

            const request = createMockRequest({
                method: 'POST',
                url: 'http://localhost:3000/api/projects',
                body: validProjectData,
            });

            const response = await POST(request);
            expect(response.status).toBeGreaterThanOrEqual(500);
        });

        it('should create user if not exists', async () => {
            prismaMock.user.findUnique.mockResolvedValue(null);
            prismaMock.user.create.mockResolvedValue({
                id: 'new-user-id',
                email: 'demo@ghostwriting.com',
                name: 'Demo User',
                role: 'ghost_writer',
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            prismaMock.project.create.mockResolvedValue(mockProject as any);

            const request = createMockRequest({
                method: 'POST',
                url: 'http://localhost:3000/api/projects',
                body: validProjectData,
            });

            const response = await POST(request);
            const data = await expectSuccessResponse(response, 201);

            expect(prismaMock.user.create).toHaveBeenCalledTimes(1);
            expect(data.success).toBe(true);
        });

        it('should handle optional fields correctly', async () => {
            const dataWithoutOptionals = {
                authorName: 'Mario Rossi',
                authorRole: 'CEO',
                company: 'Tech Innovation',
                industry: 'Technology',
                bookTitle: 'Test Book',
                targetReaders: 'Managers',
                currentSituation: 'Current',
                challengeFaced: 'Challenge',
                transformation: 'Transform',
                achievement: 'Achieve',
                lessonLearned: 'Lesson',
                businessGoals: 'Goals',
                uniqueValue: 'Value',
            };

            prismaMock.user.findUnique.mockResolvedValue({
                id: 'test-user-id',
                email: 'demo@ghostwriting.com',
                name: 'Demo User',
                role: 'ghost_writer',
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            prismaMock.project.create.mockResolvedValue(mockProject as any);

            const request = createMockRequest({
                method: 'POST',
                url: 'http://localhost:3000/api/projects',
                body: dataWithoutOptionals,
            });

            const response = await POST(request);
            await expectSuccessResponse(response, 201);
        });
    });

    describe('GET /api/projects', () => {
        it('should return all projects', async () => {
            prismaMock.project.findMany.mockResolvedValue(mockProjects as any);

            const request = createMockRequest({
                method: 'GET',
                url: 'http://localhost:3000/api/projects',
            });

            const response = await GET(request);
            const data = await expectSuccessResponse(response, 200);

            expect(data).toHaveProperty('success', true);
            expect(data).toHaveProperty('projects');
            expect(data).toHaveProperty('total');
            expect(Array.isArray(data.projects)).toBe(true);
            expect(data.projects.length).toBeGreaterThan(0);
            expect(data.total).toBe(data.projects.length);
        });

        it('should return empty array if no projects', async () => {
            prismaMock.project.findMany.mockResolvedValue([]);

            const request = createMockRequest({
                method: 'GET',
                url: 'http://localhost:3000/api/projects',
            });

            const response = await GET(request);
            const data = await expectSuccessResponse(response, 200);

            expect(data).toHaveProperty('success', true);
            expect(data).toHaveProperty('projects');
            expect(Array.isArray(data.projects)).toBe(true);
            expect(data.projects.length).toBe(0);
            expect(data.total).toBe(0);
        });

        it('should handle database errors', async () => {
            prismaMock.project.findMany.mockRejectedValue(new Error('Database error'));

            const request = createMockRequest({
                method: 'GET',
                url: 'http://localhost:3000/api/projects',
            });

            const response = await GET(request);
            expect(response.status).toBeGreaterThanOrEqual(500);
        });

        it('should order projects by creation date descending', async () => {
            prismaMock.project.findMany.mockResolvedValue(mockProjects as any);

            const request = createMockRequest({
                method: 'GET',
                url: 'http://localhost:3000/api/projects',
            });

            await GET(request);

            expect(prismaMock.project.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    orderBy: {
                        createdAt: 'desc',
                    },
                })
            );
        });
    });
});
