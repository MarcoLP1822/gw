import { vi } from 'vitest';

// Mock Vercel Blob functions
export const mockPut = vi.fn();
export const mockDel = vi.fn();
export const mockList = vi.fn();
export const mockHead = vi.fn();

// Mock put response factory
export function createMockPutResponse(url: string, pathname: string) {
    return {
        url,
        pathname,
        contentType: 'application/pdf',
        contentDisposition: 'attachment; filename="document.pdf"',
        downloadUrl: url,
    };
}

// Mock list response factory
export function createMockListResponse(blobs: Array<{ pathname: string; url: string }>) {
    return {
        blobs: blobs.map((blob) => ({
            ...blob,
            size: 1024,
            uploadedAt: new Date(),
            contentType: 'application/pdf',
            contentDisposition: 'attachment',
        })),
        cursor: null,
        hasMore: false,
    };
}

// Mock the Vercel Blob module
vi.mock('@vercel/blob', () => ({
    put: mockPut,
    del: mockDel,
    list: mockList,
    head: mockHead,
}));

const blobMock = {
    put: mockPut,
    del: mockDel,
    list: mockList,
    head: mockHead,
};

export default blobMock;
