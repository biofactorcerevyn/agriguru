// Theme configuration for AgriGuruGlobal
// Modern agricultural theme with green, yellow, and white color scheme

export const themeConfig = {
  name: "agri",
  description: "A modern agricultural theme with green, yellow, and white color scheme",
  
  // Color palette
  colors: {
    // Base colors
    background: "#FFFFFF",
    foreground: "#1A1A1A",
    
    // Primary - Green
    primary: "#3E8E41",
    primaryForeground: "#FFFFFF",
    
    // Secondary - Light Gray
    secondary: "#F8F8F8",
    secondaryForeground: "#333333",
    
    // Accent - Yellow
    accent: "#F4D35E",
    accentForeground: "#333333",
    
    // Success - Green
    success: "#DCFCE7",
    successForeground: "#166534",
    
    // Warning - Amber/Yellow
    warning: "#F4D35E",
    warningForeground: "#92400E",
    
    // Destructive - Light Pink
    destructive: "#FFB6C1",
    destructiveForeground: "#991B1B",
    
    // Muted
    muted: "#F5F5F5",
    mutedForeground: "#6E6E6E",
    
    // Border and Input
    border: "#EEEEEE",
    input: "#F0F0F0",
    
    // Card
    card: "#FFFFFF",
    cardForeground: "#1A1A1A",
    
    // Status colors for agricultural conditions
    optimal: "#DCFCE7",
    optimalForeground: "#166534",
    moderate: "#FFF8E6",
    moderateForeground: "#92400E",
    unfavorable: "#FFD6DB",
    unfavorableForeground: "#991B1B",
  },
  
  // Border radius
  radius: {
    sm: "0.5rem",
    md: "1rem",
    lg: "1.5rem",
    full: "9999px",
  },
  
  // Shadows
  shadows: {
    sm: "0 2px 6px rgba(0, 0, 0, 0.05)",
    md: "0 4px 12px rgba(0, 0, 0, 0.08)",
    lg: "0 8px 24px rgba(0, 0, 0, 0.1)",
  },
  
  // Typography
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontSizes: {
      xs: "0.75rem",    // 12px
      sm: "0.875rem",   // 14px
      base: "1rem",     // 16px
      lg: "1.125rem",   // 18px
      xl: "1.25rem",    // 20px
      "2xl": "1.5rem",  // 24px
      "3xl": "1.875rem", // 30px
      "4xl": "2.25rem", // 36px
    },
    fontWeights: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },
};

export default themeConfig;
