import { en } from '../lib/i18n/dictionaries/en';
import { de } from '../lib/i18n/dictionaries/de';

describe('I18n Dictionary Parity', () => {
    const getKeys = (obj: Record<string, unknown>, prefix = ''): string[] => {
        return Object.keys(obj).reduce((res: string[], el) => {
            const val = obj[el];
            if (Array.isArray(val)) {
                return [...res, prefix + el];
            } else if (typeof val === 'object' && val !== null) {
                return [...res, ...getKeys(val as Record<string, unknown>, prefix + el + '.')];
            }
            return [...res, prefix + el];
        }, []);
    };

    it('should have the same keys in English and German dictionaries', () => {
        const enKeys = getKeys(en as unknown as Record<string, unknown>);
        const deKeys = getKeys(de as unknown as Record<string, unknown>);

        // Check for missing keys in German
        const missingInDe = enKeys.filter(key => !deKeys.includes(key));
        const missingInEn = deKeys.filter(key => !enKeys.includes(key));

        expect(missingInDe).toEqual([]);
        expect(missingInEn).toEqual([]);
    });

    it('should have matching array lengths for same keys', () => {
        const enKeys = getKeys(en as unknown as Record<string, unknown>);

        enKeys.forEach(key => {
            const enVal = key.split('.').reduce((o: unknown, i) => (o as Record<string, unknown>)?.[i], en);
            const deVal = key.split('.').reduce((o: unknown, i) => (o as Record<string, unknown>)?.[i], de);

            if (Array.isArray(enVal) && Array.isArray(deVal)) {
                expect({ key, length: deVal.length }).toEqual({ key, length: enVal.length });
            }
        });
    });
});
