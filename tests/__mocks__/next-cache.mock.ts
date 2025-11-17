import { vi } from 'vitest';

// Mock Next.js cache functions
export const mockRevalidatePath = vi.fn();
export const mockRevalidateTag = vi.fn();
export const mockUnstable_cache = vi.fn();

// Mock the Next.js cache module
vi.mock('next/cache', () => ({
    revalidatePath: mockRevalidatePath,
    revalidateTag: mockRevalidateTag,
    unstable_cache: mockUnstable_cache,
}));

export default {
    revalidatePath: mockRevalidatePath,
    revalidateTag: mockRevalidateTag,
    unstable_cache: mockUnstable_cache,
};
