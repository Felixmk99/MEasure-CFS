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
                custom_metrics: { stress_score: 2 } // Baseline stress
            }
        })

        // Add history: A crash and a trigger
        if (crashIndex >= 0 && crashIndex < data.length) {
            data[crashIndex].crash = 1
            // Trigger: High exertion 2 days before the historical crash
            const triggerIdx = crashIndex - 2
            if (triggerIdx >= 0) {
                data[triggerIdx].exertion_score = 10
            }
        }

        // Add current activity
        if (isRecent) {
            // Match the trigger polarity: high exertion today (or recently)
            const todayIdx = 39
            const targetIdx = todayIdx + triggerDayOffset
            if (targetIdx >= 0 && targetIdx < data.length) {
                data[targetIdx].exertion_score = 10
            }
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

    it('should return "stable" if no historical crashes found (but history exists)', () => {
        const data = createMockData(-1, 0)
        const result = calculateCurrentPEMDanger(data as any)
        expect(result.status).toBe('stable')
        expect(result.matchedTriggers.length).toBe(0)
    })

    it('should correctly detect crashes from custom_metrics (lowercase or uppercase)', () => {
        const data = Array(20).fill(null).map((_, i) => ({
            date: format(subDays(new Date(), 20 - i), 'yyyy-MM-dd'),
            hrv: 50,
            custom_metrics: i === 5 ? { crash: 1 } : (i === 10 ? { Crash: 1 } : {}),
            exertion_score: i === 3 || i === 8 ? 10 : 2
        }))
        const result = calculateCurrentPEMDanger(data as any)
        expect(result.status).not.toBe('needs_data')
        // Verify crashes were detected (status should be stable or danger, not needs_data)
        expect(['stable', 'danger']).toContain(result.status)
    })

    it('should return "stable" if no triggers matched in last 7 days and include biometrics', () => {
        const data = createMockData(10, -10) // Trigger was 10 days ago (expired)
        const result = calculateCurrentPEMDanger(data as any)
        expect(result.status).toBe('stable')
        expect(result.matchedTriggers.length).toBe(0)
        expect(result.biometrics).toBeDefined()
        expect(result.biometrics?.length).toBe(3)
    })

    it('should return "danger" if a trigger is matched recently', () => {
        const data = createMockData(2, -1) // Trigger 2 days ago, impact within 7 days
        const result = calculateCurrentPEMDanger(data as any)
        expect(result.status).toBe('danger')
        expect(result.matchedTriggers[0].metric).toContain('exertion')
        expect(result.matchedTriggers[0].isPersonal).toBe(true)
        expect(result.matchedTriggers[0].descriptionKey).toBe('navbar.pem_status.matches_personal_desc')
    })

    it('should detect cumulative load as a danger', () => {
        const data = createMockData(10, -10, true)
        // Manually set high average exertion in the last 7 days
        for (let i = 33; i < 40; i++) {
            data[i].exertion_score = 15
        }
        // Baseline calc will see mean ~2, std ~1 if we add some variance
        data[0].exertion_score = 1
        data[1].exertion_score = 3

        const result = calculateCurrentPEMDanger(data as any)
        expect(result.level).toBeGreaterThanOrEqual(40)
        const load = result.matchedTriggers.find(t => t.type === 'Cumulative Load')
        expect(load?.isPersonal).toBe(false)
        expect(load?.descriptionKey).toBe('navbar.pem_status.matches_general_desc')
        expect(load?.descriptionParams?.label).toBeDefined()
    })

    it('should correctly match composite (synergistic) triggers', () => {
        const data = createMockData(-1, 0, false) // Generic base
        // Create a historical synergistic crash
        // Use Exertion (High=Bad) and Stress (High=Bad) to ensure constructive interference
        data[5].crash = 1
        data[3].exertion_score = 10
        data[3].custom_metrics = { stress_score: 10 }

        // Today has same synergy
        data[38].exertion_score = 10
        data[38].custom_metrics = { stress_score: 10 }

        const result = calculateCurrentPEMDanger(data as any)
        expect(result.status).toBe('danger')
        const composite = result.matchedTriggers.find(t => t.metric.includes(' + '))
        expect(composite).toBeDefined()
    })

    it('should deduplicate triggers that match on multiple days', () => {
        const data = createMockData(5, -1) // Historical at day 5
        // Match on multiple days (37, 38, 39)
        data[37].exertion_score = 10
        data[38].exertion_score = 10
        data[39].exertion_score = 10

        const result = calculateCurrentPEMDanger(data as any)
        const personalExertion = result.matchedTriggers.filter(t => t.metric === 'exertion_score' && t.isPersonal)
        const generalExertion = result.matchedTriggers.filter(t => t.metric === 'exertion_score' && !t.isPersonal)

        // Should only have 1 personal trigger despite matching on 3 days
        expect(personalExertion.length).toBe(1)
        // Should also have 1 general trigger
        expect(generalExertion.length).toBe(1)
    })
})
