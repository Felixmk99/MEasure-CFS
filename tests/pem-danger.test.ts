/* eslint-disable @typescript-eslint/no-explicit-any */
import { calculateCurrentPEMDanger } from '../lib/stats/pem-danger-logic'
import { format, subDays } from 'date-fns'

describe('PEM Danger Logic', () => {
    const createMockData = (crashIndex: number, triggerDayOffset: number, isRecent: boolean = true) => {
        const data = Array(40).fill(null).map((_, i) => {
            const date = subDays(new Date(), 40 - i)
            return {
                date: format(date, 'yyyy-MM-dd'),
                hrv: 50,
                step_count: 2000,
                exertion_score: 2,
                symptom_score: 5,
                crash: 0,
                custom_metrics: {}
            }
        })

        // Add history: A crash and a trigger
        if (crashIndex >= 0) {
            data[crashIndex].crash = 1
            // Trigger: High exertion 2 days before the historical crash
            data[crashIndex - 2].exertion_score = 10
        }

        // Add current activity
        if (isRecent) {
            // Match the trigger polarity: high exertion today (or recently)
            const todayIdx = 39
            data[todayIdx + triggerDayOffset].exertion_score = 10
        }

        return data
    }

    it('should return "needs_data" if less than 10 entries', () => {
        const result = calculateCurrentPEMDanger([{ date: '2026-01-01', hrv: 50 } as any])
        expect(result.status).toBe('needs_data')
        expect(result.insufficientDataReason).toBe('no_history')
    })

    it('should return "needs_data" if no data in the last 7 days', () => {
        // Data ends 10 days ago
        const oldData = Array(20).fill(null).map((_, i) => ({
            date: format(subDays(new Date(), 30 - i), 'yyyy-MM-dd'),
            hrv: 50,
            crash: i === 5 ? 1 : 0,
            exertion_score: i === 3 ? 10 : 2
        }))
        const result = calculateCurrentPEMDanger(oldData as any)
        expect(result.status).toBe('needs_data')
        expect(result.insufficientDataReason).toBe('no_recent_data')
    })

    it('should return "needs_data" if no historical crashes found', () => {
        const data = createMockData(-1, 0)
        const result = calculateCurrentPEMDanger(data as any)
        expect(result.status).toBe('needs_data')
        expect(result.insufficientDataReason).toBe('no_crashes')
    })

    it('should return "stable" if no triggers matched in last 7 days', () => {
        const data = createMockData(10, -10) // Trigger was 10 days ago (expired)
        const result = calculateCurrentPEMDanger(data as any)
        expect(result.status).toBe('stable')
    })

    it('should return "danger" if a trigger is matched recently', () => {
        // Historical crash at 10, trigger at 8 (lead=2)
        // Today is 39. If we have a spike at 38, impact is 40 (tomorrow).
        const data = createMockData(10, -1) // Spike yesterday (38), impact at 40 (future)
        const result = calculateCurrentPEMDanger(data as any)
        expect(result.status).toBe('danger')
        expect(result.matchedTriggers.length).toBeGreaterThan(0)
        expect(result.matchedTriggers[0].metric).toContain('exertion')
    })

    it('should detect cumulative load as a danger', () => {
        const data = createMockData(10, -10, true) // Historical triggers but not active
        // Manually set high average exertion in the last 7 days
        for (let i = 33; i < 40; i++) {
            data[i].exertion_score = 5 // High-ish (std is usually 0 here, but logic handles it)
        }
        // Baseline calc will see mean ~2, std ~1 if we add some variance
        data[0].exertion_score = 1
        data[1].exertion_score = 3

        const result = calculateCurrentPEMDanger(data as any)
        // High cumulative load (> 0.8 Z-score avg)
        expect(result.level).toBeGreaterThanOrEqual(40)
    })
})
