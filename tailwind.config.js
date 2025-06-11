/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#EBF2FB",
          100: "#C5D9F0", 
          200: "#9DBFE5",
          300: "#75A5D9",
          400: "#4E8BCE",
          500: "#2C5282",
          600: "#234268",
          700: "#1A324E",
          800: "#122134",
          900: "#09111A",
        },
        secondary: {
          50: "#EDFAF3",
          100: "#C7EED9",
          200: "#A1E2C0",
          300: "#7BD6A7",
          400: "#54CA8D",
          500: "#38A169",
          600: "#2D8154",
          700: "#22603F",
          800: "#17402A",
          900: "#0B2015",
        },
        accent: {
          orange: {
            50: "#FBEFE7",
            100: "#F5D4BB",
            200: "#EFB890",
            300: "#E89D64",
            400: "#E28239",
            500: "#DD6B20",
            600: "#B0551A",
            700: "#844013",
            800: "#572B0D",
            900: "#2B1506",
          },
          red: {
            50: "#FCEBEB",
            100: "#F6C4C4",
            200: "#F19D9D",
            300: "#EB7676",
            400: "#E64F4F",
            500: "#E53E3E",
            600: "#B72424",
            700: "#891B1B",
            800: "#5C1212",
            900: "#2E0909",
          },
        },
        slate: {
          50: "#F7FAFC",
          100: "#EDF2F7",
          200: "#E2E8F0",
          300: "#CBD5E0",
          400: "#A0AEC0",
          500: "#718096",
          600: "#4A5568",
          700: "#2D3748",
          800: "#1A202C",
          900: "#171923",
          950: "#0D1117",
        },
        border: "#E2E8F0",
        background: "#F7FAFC",
        foreground: "#1A202C",
        popover: {
          50: "#FFFFFF",
          100: "#FFFFFF",
          200: "#FFFFFF",
          300: "#FFFFFF",
          400: "#FFFFFF",
          500: "#FFFFFF",
          600: "#FFFFFF",
          700: "#FFFFFF",
          800: "#FFFFFF",
          900: "#FFFFFF",
        },
      },
      spacing: {
        "1": "4px",
        "2": "8px",
        "3": "12px",
        "4": "16px",
        "5": "20px",
        "6": "24px",
        "8": "32px",
        "10": "40px",
        "12": "48px",
        "16": "64px",
      },
      fontFamily: {
        sans: ["'Source Sans Pro'", "'Noto Sans'", "sans-serif"],
        mono: ["'Fira Mono'", "monospace"],
      },
      borderRadius: {
        sm: "0.125rem",
        DEFAULT: "0.25rem",
        md: "0.375rem",
        lg: "0.5rem",
        xl: "0.75rem",
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        DEFAULT: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
        md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        card: "0px 4px 12px rgba(0, 0, 0, 0.05), 0px 1px 3px rgba(0, 0, 0, 0.08)",
        dropdown: "0px 10px 15px -3px rgba(0, 0, 0, 0.1), 0px 4px 6px -2px rgba(0, 0, 0, 0.05)",
        dialog: "0px 25px 50px -12px rgba(0, 0, 0, 0.25)",
        inner: "inset 0px 2px 4px rgba(0, 0, 0, 0.06)",
        focus: "0 0 0 4px rgba(44, 82, 130, 0.25)",
        none: "none"
      },
      animation: {
        fade: "fadeIn 0.3s ease-in-out",
        slideDown: "slideDown 0.3s ease-in-out",
        slideUp: "slideUp 0.3s ease-in-out",
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        spin: "spin 1s linear infinite",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideDown: {
          "0%": { transform: "translateY(-10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        pulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: ".5" },
        },
        spin: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      typography: {
        DEFAULT: {
          css: {
            color: '#1A202C',
            a: {
              color: '#2C5282',
              '&:hover': {
                color: '#234268',
              },
            },
            h1: {
              color: '#1A202C',
            },
            h2: {
              color: '#1A202C',
            },
            h3: {
              color: '#1A202C',
            },
            h4: {
              color: '#1A202C',
            },
            blockquote: {
              borderLeftColor: '#9DBFE5',
            },
            'code::before': {
              content: '""',
            },
            'code::after': {
              content: '""',
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
} 