import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				sans: ["Inter", "sans-serif"],
				cinzel: ["Cinzel", "serif"],
				cormorant: ["Cormorant Garamond", "serif"],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				// Wagyu Warriors Premium Colors
				warrior: {
					gold: 'hsl(var(--warrior-gold))',
					dark: 'hsl(var(--warrior-dark))',
					leather: 'hsl(var(--warrior-leather))',
					smoke: 'hsl(var(--warrior-smoke))',
					ember: 'hsl(var(--warrior-ember))',
					light: 'hsl(var(--warrior-light))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				// Wagyu Warriors Animations
				'smoke-rise': {
					'0%': { transform: 'translateY(0) rotate(0deg)', opacity: '0.7' },
					'50%': { transform: 'translateY(-20px) rotate(5deg)', opacity: '0.4' },
					'100%': { transform: 'translateY(-40px) rotate(-3deg)', opacity: '0' }
				},
				'ember-glow': {
					'0%, 100%': { boxShadow: '0 0 10px hsla(15, 85%, 55%, 0.3)' },
					'50%': { boxShadow: '0 0 20px hsla(15, 85%, 55%, 0.6)' }
				},
				'knife-shimmer': {
					'0%': { transform: 'translateX(-100%)' },
					'100%': { transform: 'translateX(100%)' }
				},
				'warrior-pulse': {
					'0%, 100%': { opacity: '1', transform: 'scale(1)' },
					'50%': { opacity: '0.8', transform: 'scale(1.05)' }
				},
				'fade-in-up': {
					'0%': { opacity: '0', transform: 'translateY(20px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'smoke-rise': 'smoke-rise 3s ease-out infinite',
				'ember-glow': 'ember-glow 2s ease-in-out infinite',
				'knife-shimmer': 'knife-shimmer 2s ease-in-out infinite',
				'warrior-pulse': 'warrior-pulse 2s ease-in-out infinite',
				'fade-in-up': 'fade-in-up 0.6s ease-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
