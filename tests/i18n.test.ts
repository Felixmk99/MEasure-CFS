import { en } from '../lib/i18n/dictionaries/en';
import { de } from '../lib/i18n/dictionaries/de';

describe('I18n Dictionary Parity', () => {
    const getKeys = (obj: any, prefix = ''): string[] => {
        return Object.keys(obj).reduce((res: string[], el) => {
            if (Array.isArray(obj[el])) {
                return [...res, prefix + el];
            } else if (typeof obj[el] === 'object' && obj[el] !== null) {
                return [...res, ...getKeys(obj[el], prefix + el + '.')];
            }
            return [...res, prefix + el];
        }, []);
    };

    it('should have the same keys in English and German dictionaries', () => {
        const enKeys = getKeys(en);
        const deKeys = getKeys(de);

        // Check for missing keys in German
        const missingInDe = enKeys.filter(key => !deKeys.includes(key));
        const missingInEn = deKeys.filter(key => !enKeys.includes(key));

        expect(missingInDe).toEqual([]);
        expect(missingInEn).toEqual([]);
    });

    it('should have matching array lengths for same keys', () => {
        const enKeys = getKeys(en);

        enKeys.forEach(key => {
            const enVal = key.split('.').reduce((o, i) => o[i], en as any);
            const deVal = key.split('.').reduce((o, i) => o[i], de as any);

            if (Array.isArray(enVal) && Array.isArray(deVal)) {
                expect({ key, length: deVal.length }).toEqual({ key, length: enVal.length });
            }
        });
    });
});
