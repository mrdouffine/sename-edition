import { slugify } from './slugify';

describe('slugify', () => {
    it('should format simple text correctly', () => {
        expect(slugify('Hello World')).toBe('hello-world');
    });

    it('should ignore and remove accents', () => {
        expect(slugify('Édition Spéciale')).toBe('edition-speciale');
    });

    it('should replace spaces and underscores with hyphens', () => {
        expect(slugify('Test_book title')).toBe('test-book-title');
    });

    it('should remove special characters', () => {
        expect(slugify('L\'Ouvrage ! @ 123')).toBe('louvrage-123');
    });

    it('should truncate to 120 characters max', () => {
        const longString = 'a'.repeat(150);
        expect(slugify(longString).length).toBe(120);
    });
});
