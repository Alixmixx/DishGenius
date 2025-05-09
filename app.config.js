export default {
  expo: {
    name: 'DishGenius',
    slug: 'dishgenius',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    splash: {
      image: './assets/images/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff'
    },
    updates: {
      fallbackToCacheTimeout: 0
    },
    assetBundlePatterns: [
      '**/*'
    ],
    ios: {
      supportsTablet: true
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/images/adaptive-icon.png',
        backgroundColor: '#FFFFFF'
      }
    },
    web: {
      favicon: './assets/images/favicon.png'
    },
    extra: {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
    },
  }
}