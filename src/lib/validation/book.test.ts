import { parseCreateBookPayload } from './book';
import { ApiError } from '../api';

describe('Book Validation', () => {
    it('should validate right direct book payload', () => {
        const payload = {
            title: 'Mon Livre Test',
            description: 'Voici une belle description longue de plus de 10 caractères.',
            price: 25.5,
            saleType: 'direct',
            coverImage: 'data:image/jpeg;base64,123...',
            stock: 100,
        };

        const result = parseCreateBookPayload(payload);
        expect(result.title).toBe(payload.title);
        expect(result.saleType).toBe('direct');
        expect(result.stock).toBe(100);
    });

    it('should error if stock is missing in direct sale', () => {
        const payload = {
            title: 'Mon Livre Test',
            description: 'Voici une belle description longue de plus de 10 caractères.',
            price: 25.5,
            saleType: 'direct',
            coverImage: 'data:image/jpeg;base64,123...',
        };

        expect(() => parseCreateBookPayload(payload)).toThrow(ApiError);
    });

    it('should error if funding goal is missing in crowdfunding sale', () => {
        const payload = {
            title: 'Mon Livre Test',
            description: 'Voici une belle description longue de plus de 10 caractères.',
            price: 25.5,
            saleType: 'crowdfunding',
            coverImage: 'data:image/jpeg;base64,123...',
            stock: 10, // Stock au lieu de fundingGoal
        };

        expect(() => parseCreateBookPayload(payload)).toThrow(ApiError);
    });
});
