/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { normalizeBearableData } from '../lib/data/bearable-normalizer';
import { normalizeLongFormatData } from '../lib/data/long-format-normalizer';

describe('Data Ingestion Normalizers', () => {
    describe('Bearable Normalizer', () => {
        it('should correctly convert H:MM sleep duration to decimal hours', () => {
            const rows = [
                { 'date formatted': '2026-01-01', 'category': 'Sleep', 'rating/amount': '7:30' },
                { 'date formatted': '2026-01-01', 'category': 'Sleep', 'rating/amount': '1:15' } // Should overwrite or update
            ];
            const result = normalizeBearableData(rows);
            expect(result[0].custom_metrics['Sleep Duration']).toBe(1.25); // Last one wins for sleep duration currently
        });

        it('should parse multi-value Lifestyle/Social segments with emojis and levels', () => {
            const rows = [
                {
                    'date formatted': '2026-01-01',
                    'category': 'Work',
                    'detail': '🖥️ Video Calls - Moderate | 📧 Email - A lot'
                }
            ];
            const result = normalizeBearableData(rows);
            expect(result[0].custom_metrics['Video Calls']).toBe(2);
            expect(result[0].custom_metrics['Email']).toBe(3);
        });

        it('should take the MAX value for symptoms logged multiple times per day', () => {
            const rows = [
                { 'date formatted': '2026-01-01', 'category': 'Symptom', 'detail': 'Fatigue', 'rating/amount': '1' },
                { 'date formatted': '2026-01-01', 'category': 'Symptom', 'detail': 'Fatigue', 'rating/amount': '3' },
                { 'date formatted': '2026-01-01', 'category': 'Symptom', 'detail': 'Fatigue', 'rating/amount': '2' }
            ];
            const result = normalizeBearableData(rows);
            expect(result[0].custom_metrics['Fatigue']).toBe(3);
        });

        it('should clean emoji and leading characters from names', () => {
            const rows = [
                { 'date formatted': '2026-01-01', 'category': 'Lifestyle', 'detail': '☕ Caffeine' }
            ];
            const result = normalizeBearableData(rows);
            expect(result[0].custom_metrics['Caffeine']).toBeDefined();
            expect(result[0].custom_metrics['☕ Caffeine']).toBeUndefined();
        });
    });

    describe('Visible (Long Format) Normalizer', () => {
        it('should map various header variants case-insensitively', () => {
            const rows = [
                { 'Observation_Date': '2026-01-01', 'Tracker_Name': 'HRV', 'Observation_Value': '55' },
                { 'date': '2026-01-01', 'name': 'Resting HR', 'value': '62' }
            ];
            const result = normalizeLongFormatData(rows);
            expect(result[0].hrv).toBe(55);
            expect(result[0].resting_heart_rate).toBe(62);
        });

        it('should preserve unknown metrics in custom_metrics JSON', () => {
            const rows = [
                { 'date': '2026-01-01', 'name': 'Brain Fog', 'value': '4', 'category': 'Symptoms' }
            ];
            const result = normalizeLongFormatData(rows);
            expect(result[0].custom_metrics['Brain Fog']).toBe(4);
        });

        it('should exclude Infection and funcap_ categories', () => {
            const rows = [
                { 'date': '2026-01-01', 'name': 'Infection', 'value': '1' },
                { 'date': '2026-01-01', 'name': 'Any Name', 'value': '5', 'category': 'funcap_walking' }
            ];
            const result = normalizeLongFormatData(rows);
            expect(result[0].custom_metrics['Infection']).toBeUndefined();
            expect(result[0].custom_metrics['Any Name']).toBeUndefined();
        });
    });
});
