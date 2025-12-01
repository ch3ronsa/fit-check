/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                base: {
                    blue: '#0052FF', // Base Network Blue
                    black: '#000000',
                    white: '#FFFFFF',
                },
                neon: {
                    blue: '#00F0FF',
                    purple: '#BD00FF',
                    green: '#00FF94',
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                display: ['Outfit', 'sans-serif'],
            },
            animation: {
                'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'glow': 'glow 2s ease-in-out infinite alternate',
            },
            keyframes: {
                glow: {
                    '0%': { boxShadow: '0 0 5px #0052FF, 0 0 10px #0052FF' },
                    '100%': { boxShadow: '0 0 20px #00F0FF, 0 0 30px #00F0FF' },
                }
            }
        },
    },
    plugins: [],
}
