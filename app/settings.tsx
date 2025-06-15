import { useHabitsStore } from '@/store';
import { Settings } from '@/types';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import { ChevronRight, X } from 'lucide-react-native';
import React, { useCallback } from 'react';
import {
  Linking,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function SettingsScreen() {
  const { settings, setSettings } = useHabitsStore();
  const handleSendFeedback = useCallback(() => {
    const email = Constants.expoConfig?.extra?.FEEDBACK_EMAIL;
    const subject = 'Gryd App Feedback';
    const body = 'Hi, I would like to share feedback about the Gryd app:\n\n';
    const emailUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    Linking.openURL(emailUrl).catch(err => {
      console.error('Error opening email:', err);
    });
  }, []);

  const handleReorderHabits = useCallback(() => {
    router.push('/reorder-habits');
  }, []);

  const handleUpdateSetting = useCallback(
    (setting: keyof Settings, value: Settings[keyof Settings]) => {
      setSettings(setting, value);
    },
    []
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => router.back()}
        >
          <X color="#fff" size={24} />
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        removeClippedSubviews={Platform.OS === 'android'}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.mainContent}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>App</Text>

            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Show month labels</Text>
              <Switch
                value={settings.showMonthLabels}
                onValueChange={() =>
                  handleUpdateSetting(
                    'showMonthLabels',
                    !settings.showMonthLabels
                  )
                }
              />
            </View>
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Show day labels</Text>
              <Switch
                value={settings.showDayLabels}
                onValueChange={() =>
                  handleUpdateSetting('showDayLabels', !settings.showDayLabels)
                }
              />
            </View>
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Week starts on Sunday</Text>
              <Switch
                value={settings.weekStartsOnSunday}
                onValueChange={() =>
                  handleUpdateSetting(
                    'weekStartsOnSunday',
                    !settings.weekStartsOnSunday
                  )
                }
              />
            </View>
            <TouchableOpacity
              style={styles.settingItem}
              onPress={handleReorderHabits}
            >
              <Text style={styles.settingLabel}>Reorder habits</Text>
              <ChevronRight size={18} />
            </TouchableOpacity>
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>General</Text>

            <TouchableOpacity
              style={styles.settingItem}
              onPress={handleSendFeedback}
            >
              <Text style={styles.settingLabel}>Send Feedback</Text>
              <ChevronRight size={18} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Gryd 1.0.0</Text>
          <Text style={styles.footerText}>Made with ❤️ by Ankur</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1F2937',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginVertical: 16,
  },
  closeButton: {
    padding: 4,
  },
  title: {
    color: '#fff',
    fontSize: 20,
    flex: 1,
    marginLeft: 12,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    marginBottom: 8,
    paddingHorizontal: 20,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  settingLabel: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 4,
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 8,
    backgroundColor: '#1F2937',
    paddingBottom: 24,
  },
  footerText: {
    color: '#fff',
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  mainContent: {
    flex: 1,
    color: '#fff',
  },
});
