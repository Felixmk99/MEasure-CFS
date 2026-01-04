import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'MEasure-CFS Logo'
export const size = {
    width: 1200,
    height: 630,
}

export const contentType = 'image/png'

export default async function Image() {
    return new ImageResponse(
        (
            <div
                style={{
                    background: '#09090b', // zinc-950
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'sans-serif',
                }}
            >
                {/* Logo / Triangle */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 40,
                    }}
                >
                    <svg
                        width="150"
                        height="150"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M12 3L22 21H2L12 3Z"
                            fill="white"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </div>

                {/* Brand Name */}
                <div
                    style={{
                        fontSize: 80,
                        fontWeight: 'bold',
                        color: 'white',
                        letterSpacing: '-0.025em',
                        marginBottom: 20,
                    }}
                >
                    MEasure-CFS
                </div>

                {/* Tagline */}
                <div
                    style={{
                        fontSize: 32,
                        color: '#a1a1aa', // zinc-400
                        textAlign: 'center',
                        maxWidth: '80%',
                    }}
                >
                    Privacy-focused health dashboard
                </div>
            </div>
        ),
        {
            ...size,
        }
    )
}
