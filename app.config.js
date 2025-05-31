import 'dotenv/config';

export default {
  expo: {
    name: 'Gryd',
    slug: 'gryd',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'myapp',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.ankurkedia.gryd',
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/images/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      package: 'com.ankurkedia.gryd',
    },
    web: {
      bundler: 'metro',
      output: 'static',
      favicon: './assets/images/icon.png',
    },
    plugins: [
      'expo-router',
      [
        'expo-splash-screen',
        {
          image: './assets/images/adaptive-icon.png',
          imageWidth: 200,
          resizeMode: 'contain',
          backgroundColor: '#ffffff',
        },
      ],
      ['expo-notifications'],
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      router: {
        origin: false,
      },
      eas: {
        projectId: 'a2180897-5b9f-4bae-848e-a19b85ca94d1',
      },
      // Environment variables accessible via Constants.expoConfig.extra
      GITHUB_ENDPOINT: process.env.EXPO_PUBLIC_GITHUB_ACTIVITY_ENDPOINT,
      GITLAB_ENDPOINT: process.env.EXPO_PUBLIC_GITLAB_ACTIVITY_ENDPOINT,
    },
  },
};
