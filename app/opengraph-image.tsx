import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'MEasure-CFS'
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
                }}
            >
                {/* Logo Recreated from favicon.svg */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 40 }}>
                    <svg
                        width="200"
                        height="200"
                        viewBox="0 0 100 100"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        {/* Background Rects */}
                        <rect width="100" height="100" rx="22" fill="white" />
                        <rect width="100" height="100" rx="22" fill="url(#bg-grad)" fillOpacity="0.08" />

                        {/* Wave Path */}
                        <path
                            d="M 10 50 L 13 42 L 17 58 L 21 45 L 25 55 L 29 48 C 35 50 35 50 40 50 C 50 25 60 75 70 50 S 90 25 95 50"
                            stroke="url(#logo-grad)"
                            strokeWidth="8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            fill="none"
                        />

                        {/* Gradient Definitions */}
                        <defs>
                            <linearGradient
                                id="bg-grad"
                                x1="0"
                                y1="0"
                                x2="100"
                                y2="100"
                                gradientUnits="userSpaceOnUse"
                            >
                                <stop stopColor="#60a5fa" /> {/* Approximated Blue */}
                                <stop offset="1" stopColor="#fb923c" /> {/* Approximated Orange */}
                            </linearGradient>

                            <linearGradient
                                id="logo-grad"
                                x1="0"
                                y1="50"
                                x2="100"
                                y2="50"
                                gradientUnits="userSpaceOnUse"
                            >
                                <stop stopColor="#94a3b8" stopOpacity="0.8" />
                                <stop offset="0.4" stopColor="#60a5fa" />
                                <stop offset="1" stopColor="#fb923c" />
                            </linearGradient>
                        </defs>
                    </svg>
                </div>

                {/* Brand Name */}
                <div
                    style={{
                        fontSize: 80,
                        fontWeight: 'bold',
                        color: 'white',
                        letterSpacing: '-0.025em',
                        marginBottom: 10,
                        fontFamily: 'sans-serif',
                    }}
                >
                    MEasure-CFS
                </div>

                <div
                    style={{
                        fontSize: 32,
                        color: '#a1a1aa', // zinc-400
                        textAlign: 'center',
                        maxWidth: '80%',
                        fontFamily: 'sans-serif',
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
