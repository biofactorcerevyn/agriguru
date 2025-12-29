/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontSize: {
        xs: "0.875rem",     // 14px (increased from default)
        sm: "1rem",         // 16px (increased from default)
        base: "1.125rem",   // 18px (increased from default)
        lg: "1.25rem",      // 20px
        xl: "1.5rem",       // 24px (increased from default)
        "2xl": "1.75rem",   // 28px (increased from default)
        "3xl": "2rem",      // 32px (increased from default)
        "4xl": "2.5rem",    // 40px (increased from default)
      },
      colors: {
        // Base colors
        background: "#FFFFFF",
        foreground: "#111111",
        
        // Card colors
        card: "#FFFFFF",
        "card-foreground": "#111111",
        
        // Popover colors
        popover: "#FFFFFF",
        "popover-foreground": "#111111",
        
        // Subtle backgrounds
        muted: "#F5F5F5",
        "muted-foreground": "#555555", // Darker for better readability
        
        // UI elements
        border: "#E5E5E5",
        input: "#E5E5E5",
        ring: "#E5E5E5",
        
        // AgriGuru theme colors - Pastel colors for farming/agriculture
        primary: "#3E8E41", // Green (main brand color)
        "primary-foreground": "#FFFFFF",
        secondary: "#F4D35E", // Soft yellow
        "secondary-foreground": "#111111",
        accent: "#8E6C88", // Soft purple
        "accent-foreground": "#FFFFFF",
        
        // Feedback colors with pastel tones
        destructive: "#E57373", // Soft red
        "destructive-foreground": "#FFFFFF",
        success: "#81C784", // Soft green
        "success-foreground": "#FFFFFF",
        warning: "#FFD54F", // Soft amber
        "warning-foreground": "#111111",
        
        // Additional colors - Pastel tones
        info: "#64B5F6", // Soft blue
        "info-foreground": "#FFFFFF",
        purple: "#B39DDB", // Soft purple
        "purple-foreground": "#FFFFFF",
        pink: "#F48FB1", // Soft pink
        "pink-foreground": "#FFFFFF",
        orange: "#FFB74D", // Soft orange
        "orange-foreground": "#111111",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
