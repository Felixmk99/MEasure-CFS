
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { DonationDialog } from '@/components/donation/donation-dialog'

// Mock the language provider
jest.mock('@/components/providers/language-provider', () => ({
    useLanguage: () => ({
        t: (key: string) => {
            const translations: Record<string, string> = {
                'donation.button_label': 'Support Research',
                'donation.dialog_title': 'Support ME/CFS Research',
                'donation.dialog_desc': 'Description text',
                'donation.open_paypal': 'Donate via PayPal'
            }
            return translations[key] || key
        }
    }),
    LanguageProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>
}))

// Mock Next/Image
jest.mock('next/image', () => ({
    __esModule: true,
    default: (props: any) => {
        // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
        return <img {...props} />
    },
}))

describe('DonationDialog', () => {
    it('renders the support research button', () => {
        render(<DonationDialog />)
        expect(screen.getByText('Support Research')).toBeInTheDocument()
    })

    it('opens the dialog when clicked', () => {
        render(<DonationDialog />)
        const button = screen.getByText('Support Research')
        fireEvent.click(button)

        expect(screen.getByText('Support ME/CFS Research')).toBeInTheDocument()
        expect(screen.getByText('Description text')).toBeInTheDocument()
        expect(screen.getByText('Donate via PayPal')).toBeInTheDocument()
    })

    it('contains the correct PayPal link', () => {
        render(<DonationDialog />)
        const button = screen.getByText('Support Research')
        fireEvent.click(button)

        const link = screen.getByRole('link', { name: 'Donate via PayPal' })
        expect(link).toHaveAttribute('href', 'https://www.paypal.com/pool/9lxn4Sh3sl?sr=wccr')
    })

    it('displays the QR code image', () => {
        render(<DonationDialog />)
        const button = screen.getByText('Support Research')
        fireEvent.click(button)

        const image = screen.getByAltText('PayPal Pool QR Code')
        expect(image).toBeInTheDocument()
    })
})
