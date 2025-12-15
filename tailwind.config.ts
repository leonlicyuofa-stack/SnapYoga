
import type { Config } from "tailwindcss";

export default {
    darkMode: ["class"],
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
            'splash-background': 'hsl(var(--splash-background))',
            'splash-foreground': 'hsl(var(--splash-foreground))',
            'splash-blob-1': 'hsl(var(--splash-blob-1))',
            'splash-blob-2': 'hsl(var(--splash-blob-2))',
            'splash-blob-3': 'hsl(var(--splash-blob-3))',
            'pistachio-background': 'hsl(var(--pistachio-background))',
            'home-pink-bg': 'hsl(var(--home-pink-bg))',
            'home-pink-fg': 'hsl(var(--home-pink-fg))',
            'home-dark-bg': 'hsl(var(--home-dark-bg))',
            'home-dark-fg': 'hsl(var(--home-dark-fg))',
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
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
            'breathing-bg': {
                '0%, 100%': { transform: 'scale(1)', opacity: '1' },
                '50%': { transform: 'scale(1.05)', opacity: '0.9' },
            },
            typewriter: {
                from: { width: '0' },
                to: { width: '100%' },
            },
            'snap-flash': {
              '0%, 100%': { opacity: '1' },
              '50%': { opacity: '0.2' },
            },
            'move-down-and-fade': {
              '0%': { transform: 'translateY(0)', opacity: 1 },
              '100%': { transform: 'translateY(40px)', opacity: 0 },
            },
            'move-right-and-fade': {
              '0%': { transform: 'translateX(0)', opacity: 1 },
              '100%': { transform: 'translateX(40px)', opacity: 0 },
            },
            'swing': {
              '0%, 100%': { transform: 'rotate(20deg)' },
              '50%': { transform: 'rotate(-20deg)' },
            },
            'zoom-in': {
                '0%': { transform: 'scale(0.8)', opacity: '0' },
                '100%': { transform: 'scale(1)', opacity: '1' },
            },
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
            'breathing-bg': 'breathing-bg 8s ease-in-out infinite',
            typewriter: 'typewriter 2s steps(12) 1s 1 normal both',
            'snap-flash': 'snap-flash 0.7s ease-in-out',
            'move-down-and-fade': 'move-down-and-fade 0.6s ease-in forwards',
            'move-right-and-fade': 'move-right-and-fade 0.6s ease-in forwards',
            'swing': 'swing 1.5s ease-in-out infinite alternate',
            'zoom-in': 'zoom-in 0.7s ease-out forwards',
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
