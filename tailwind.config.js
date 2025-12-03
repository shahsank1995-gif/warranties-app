/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./*.{js,ts,jsx,tsx}"
    ],
    darkMode: 'class',
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                serif: ['Spectral', 'serif'],
            },
            colors: {
                'charcoal-black': '#0A0A0C',
                'deep-graphite': '#151518',
                'onyx-gray': '#1F1F22',
                'off-white': '#F4F4F5',
                'muted-silver': '#909095',
                'dark-smoke': '#5F5F63',
                'soft-platinum': '#EDEEF0',
                'fresh-green': '#4CAF50',
                'amber-gold': '#DDA021',
                'alert-red': '#D94545',
                'brand-purple': '#A951F9',
            },
            animation: {
                'fade-in-stagger': 'fadeIn 0.5s ease-out forwards',
                'draw-check': 'drawCheck 0.4s 0.2s ease-in-out forwards',
                'sparkle': 'sparkle 1s ease-out forwards',
                'energy-pulse': 'energyPulse 2s ease-in-out infinite',
                'ki-charge': 'kiCharge 1.5s ease-in-out infinite',
                'power-up': 'powerUp 0.8s ease-out forwards',
                'aura-glow': 'auraGlow 1.5s ease-in-out infinite',
                'super-saiyan': 'super-saiyan-pulse 0.3s ease-in-out infinite',
                'beam': 'beam-expand 2s ease-in-out infinite',
                'shake-intense': 'shake 0.1s ease-in-out infinite',
                'spring-bounce': 'spring-scale 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
                'slide-up': 'slide-up-fade 0.6s ease-out forwards',
                'shimmer': 'shimmer-slide 2s infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                drawCheck: {
                    '0%': { strokeDashoffset: '1' },
                    '100%': { strokeDashoffset: '0' },
                },
                sparkle: {
                    '0%': { transform: 'scale(0) rotate(0deg)', opacity: '0.5' },
                    '50%': { opacity: '1' },
                    '100%': { transform: 'scale(1.2) rotate(90deg)', opacity: '0' },
                },
                energyPulse: {
                    '0%, 100%': {
                        boxShadow: '0 0 20px rgba(169, 81, 249, 0.5), 0 0 40px rgba(169, 81, 249, 0.3), 0 0 60px rgba(169, 81, 249, 0.2)',
                        transform: 'scale(1)'
                    },
                    '50%': {
                        boxShadow: '0 0 30px rgba(169, 81, 249, 0.8), 0 0 60px rgba(169, 81, 249, 0.5), 0 0 90px rgba(169, 81, 249, 0.3)',
                        transform: 'scale(1.05)'
                    },
                },
                kiCharge: {
                    '0%': { opacity: '0.3', transform: 'scale(0.8)' },
                    '50%': { opacity: '1', transform: 'scale(1.2)' },
                    '100%': { opacity: '0.3', transform: 'scale(0.8)' },
                },
                powerUp: {
                    '0%': {
                        transform: 'scale(0)',
                        opacity: '0',
                        filter: 'brightness(3)'
                    },
                    '50%': {
                        opacity: '1',
                        filter: 'brightness(2)'
                    },
                    '100%': {
                        transform: 'scale(1.5)',
                        opacity: '0',
                        filter: 'brightness(1)'
                    },
                },
                auraGlow: {
                    '0%, 100%': {
                        filter: 'drop-shadow(0 0 10px rgba(169, 81, 249, 0.6)) drop-shadow(0 0 20px rgba(169, 81, 249, 0.4))',
                    },
                    '50%': {
                        filter: 'drop-shadow(0 0 20px rgba(169, 81, 249, 0.9)) drop-shadow(0 0 40px rgba(169, 81, 249, 0.6))',
                    },
                },
                'super-saiyan-pulse': {
                    '0%, 100%': { boxShadow: '0 0 15px #FFD700, 0 0 30px #FFA500' },
                    '50%': { boxShadow: '0 0 30px #FFD700, 0 0 60px #FFA500, 0 0 90px #FF4500' },
                },
                'beam-expand': {
                    '0%': { width: '0%', opacity: '0.5' },
                    '50%': { opacity: '1' },
                    '100%': { width: '100%', opacity: '0.5' },
                },
                'shake': {
                    '0%, 100%': { transform: 'translate(0, 0)' },
                    '25%': { transform: 'translate(-2px, 2px)' },
                    '75%': { transform: 'translate(2px, -2px)' },
                },
                'spring-scale': {
                    '0%': { transform: 'scale(0)', opacity: '0' },
                    '60%': { transform: 'scale(1.1)', opacity: '1' },
                    '100%': { transform: 'scale(1)', opacity: '1' },
                },
                'slide-up-fade': {
                    '0%': { transform: 'translateY(20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                'shimmer-slide': {
                    '0%': { transform: 'translateX(-100%)' },
                    '100%': { transform: 'translateX(100%)' },
                }
            }
        }
    },
    plugins: [],
}
