import { analyzeExperiments, Experiment, MetricDay } from './experiment-analysis'

describe('analyzeExperiments (Multivariate OLS)', () => {
    const generateHistory = (count: number, startDay: string, config: (i: number) => Record<string, unknown>): MetricDay[] => {
        const msPerDay = 86400000
        const start = new Date(startDay).getTime()

        return Array.from({ length: count }).map((_, i) => {
            const date = new Date(start + i * msPerDay).toISOString().split('T')[0]
            return {
                date,
                ...config(i)
            }
        })
    }

    it('should isolate impacts of overlapping experiments', () => {
        // Experiment A: Days 10-40, increases HRV by 20
        // Experiment B: Days 30-50, decreases HRV by 10 (Overlap on 30-40)
        // Baseline: HRV 50

        const history = generateHistory(60, '2023-01-01', (i) => {
            let hrv = 50
            if (i >= 10 && i <= 40) hrv += 20 // Exp A effect
            if (i >= 30 && i <= 50) hrv -= 10 // Exp B effect
            return { hrv }
        })

        const experiments: Experiment[] = [
            { id: 'A', name: 'Exp A', dosage: null, start_date: '2023-01-11', end_date: '2023-02-10', category: 'med' },
            { id: 'B', name: 'Exp B', dosage: null, start_date: '2023-01-31', end_date: '2023-02-20', category: 'med' }
        ]

        const baselineStats = { hrv: { mean: 50, std: 5 } }

        const reports = analyzeExperiments(experiments, history, baselineStats)

        const reportA = reports.find(r => r.experimentId === 'A')
        const reportB = reports.find(r => r.experimentId === 'B')

        const impactA = reportA?.impacts.find(i => i.metric === 'hrv')
        const impactB = reportB?.impacts.find(i => i.metric === 'hrv')

        // Expect Coeffs to be close to 20 and -10
        expect(impactA?.coefficient).toBeCloseTo(20, 0)
        expect(impactB?.coefficient).toBeCloseTo(-10, 0)

        // P-values should be extremely low for this perfectly clean data
        expect(impactA?.pValue).toBeLessThan(0.01)
        expect(impactB?.pValue).toBeLessThan(0.01)
    })

    it('should strictly exclude requested metrics from analysis', () => {
        const history = generateHistory(20, '2023-01-01', () => ({
            hrv: 50,
            'Crash': 0,
            'Physical Exertion': 5
        }))

        const experiments: Experiment[] = [
            { id: 'A', name: 'Exp A', dosage: null, start_date: '2023-01-10', end_date: null, category: 'med' }
        ]

        const reports = analyzeExperiments(experiments, history, { hrv: { mean: 50, std: 5 } })
        const impacts = reports[0].impacts.map(i => i.metric)

        expect(impacts).toContain('hrv')
        expect(impacts).not.toContain('Crash')
        expect(impacts).not.toContain('Physical Exertion')
    })

    it('should return empty if metrics have no numeric data', () => {
        const history = generateHistory(20, '2023-01-01', () => ({
            hrv: 'invalid'
        }))
        const experiments: Experiment[] = [{ id: 'A', name: 'A', dosage: null, start_date: '2023-01-10', end_date: null, category: 'med' }]
        const reports = analyzeExperiments(experiments, history, {})
        expect(reports).toHaveLength(0)
    })

    it('should handle small datasets gracefully', () => {
        const history = generateHistory(5, '2023-01-01', () => ({ hrv: 50 }))
        const experiments: Experiment[] = [{ id: 'A', name: 'A', dosage: null, start_date: '2023-01-02', end_date: null, category: 'med' }]
        const reports = analyzeExperiments(experiments, history, {})
        expect(reports).toHaveLength(0)
    })
})
