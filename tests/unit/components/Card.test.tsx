import { describe, it, expect } from 'vitest';
import { render, screen } from '../../helpers/render-helpers';
import Card from '@/components/Card';

describe('Card Component', () => {
    it('should render children content', () => {
        render(<Card>Test Content</Card>);

        expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('should apply default medium padding', () => {
        const { container } = render(<Card>Content</Card>);
        const card = container.firstChild as HTMLElement;

        expect(card.className).toContain('p-4');
    });

    it('should apply custom padding when specified', () => {
        const { container } = render(<Card padding="lg">Content</Card>);
        const card = container.firstChild as HTMLElement;

        expect(card.className).toContain('p-6');
    });

    it('should apply small padding', () => {
        const { container } = render(<Card padding="sm">Content</Card>);
        const card = container.firstChild as HTMLElement;

        expect(card.className).toContain('p-3');
    });

    it('should apply no padding when specified', () => {
        const { container } = render(<Card padding="none">Content</Card>);
        const card = container.firstChild as HTMLElement;

        expect(card.className).not.toContain('p-');
    });

    it('should have border by default', () => {
        const { container } = render(<Card>Content</Card>);
        const card = container.firstChild as HTMLElement;

        expect(card.className).toContain('border');
    });

    it('should not have border when noBorder is true', () => {
        const { container } = render(<Card noBorder>Content</Card>);
        const card = container.firstChild as HTMLElement;

        expect(card.className).not.toContain('border-gray');
    });

    it('should have shadow by default', () => {
        const { container } = render(<Card>Content</Card>);
        const card = container.firstChild as HTMLElement;

        expect(card.className).toContain('shadow-sm');
    });

    it('should not have shadow when noShadow is true', () => {
        const { container } = render(<Card noShadow>Content</Card>);
        const card = container.firstChild as HTMLElement;

        // Should not contain shadow class
        const classNames = card.className.split(' ');
        const hasShadowClass = classNames.some(cls => cls.includes('shadow') && cls !== 'shadow-none');
        expect(hasShadowClass).toBe(false);
    });

    it('should apply custom className', () => {
        const { container } = render(<Card className="custom-class">Content</Card>);
        const card = container.firstChild as HTMLElement;

        expect(card.className).toContain('custom-class');
    });

    it('should apply background color classes', () => {
        const { container } = render(<Card>Content</Card>);
        const card = container.firstChild as HTMLElement;

        expect(card.className).toContain('bg-white');
    });

    it('should apply rounded corners', () => {
        const { container } = render(<Card>Content</Card>);
        const card = container.firstChild as HTMLElement;

        expect(card.className).toContain('rounded-lg');
    });

    it('should combine noBorder and noShadow', () => {
        const { container } = render(<Card noBorder noShadow>Content</Card>);
        const card = container.firstChild as HTMLElement;

        expect(card.className).not.toContain('border-gray');
        const classNames = card.className.split(' ');
        const hasShadowClass = classNames.some(cls => cls.includes('shadow') && cls !== 'shadow-none');
        expect(hasShadowClass).toBe(false);
    });

    it('should render complex children', () => {
        render(
            <Card>
                <h1>Title</h1>
                <p>Paragraph</p>
                <button>Button</button>
            </Card>
        );

        expect(screen.getByText('Title')).toBeInTheDocument();
        expect(screen.getByText('Paragraph')).toBeInTheDocument();
        expect(screen.getByText('Button')).toBeInTheDocument();
    });
});
