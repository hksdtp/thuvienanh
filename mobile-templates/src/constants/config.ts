/**
 * App Configuration
 * Cấu hình cho React Native app
 */

export const API_CONFIG = {
  // Development: Backend chạy local
  DEV_URL: 'http://localhost:4000',
  
  // Production: Backend trên server
  PROD_URL: 'https://thuvienanh.ninh.app',
  
  // Sử dụng URL nào?
  BASE_URL: __DEV__ 
    ? 'http://localhost:4000'  // Dev mode
    : 'https://thuvienanh.ninh.app',  // Production
  
  // Timeout
  TIMEOUT: 30000, // 30 seconds
}

export const APP_CONFIG = {
  NAME: 'Thư Viện Ảnh VẢI',
  VERSION: '1.0.0',
  BUILD: 1,
}

export const COLORS = {
  primary: '#3B82F6',      // Blue
  secondary: '#10B981',    // Green
  accent: '#F59E0B',       // Amber
  background: '#F9FAFB',   // Gray 50
  surface: '#FFFFFF',      // White
  error: '#EF4444',        // Red
  text: {
    primary: '#111827',    // Gray 900
    secondary: '#6B7280',  // Gray 500
    disabled: '#9CA3AF',   // Gray 400
  },
  border: '#E5E7EB',       // Gray 200
}

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
}

export const FONT_SIZES = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 24,
  xxl: 32,
}

