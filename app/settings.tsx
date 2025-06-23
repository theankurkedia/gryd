import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Toast, ToastType } from '@/components/Toast';
import { exportAllData, importAllData } from '@/services/db';
import { useHabitsStore } from '@/store';
import { Settings } from '@/types';
import { getAppVersion } from '@/utils/version';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import { ChevronRight, Download, Upload, X } from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
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
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    type: ToastType;
  }>({
    visible: false,
    message: '',
    type: 'success',
  });
  const [showImportConfirm, setShowImportConfirm] = useState(false);

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

  const handleExportData = useCallback(async () => {
    try {
      setIsExporting(true);
      await exportAllData();
      setToast({
        visible: true,
        message: 'Data exported successfully!',
        type: 'success',
      });
    } catch (error) {
      setToast({
        visible: true,
        message: 'Failed to export data. Please try again.',
        type: 'error',
      });
      console.error('Export error:', error);
    } finally {
      setIsExporting(false);
    }
  }, []);

  const handleImportData = useCallback(() => {
    setShowImportConfirm(true);
  }, []);

  const handleConfirmImport = useCallback(async () => {
    try {
      setIsImporting(true);
      setShowImportConfirm(false);
      await importAllData();
      setToast({
        visible: true,
        message: 'Data imported successfully!',
        type: 'success',
      });
      // Refresh the app data
      router.replace('/');
    } catch (error) {
      setToast({
        visible: true,
        message: 'Failed to import data. Please check the file format.',
        type: 'error',
      });
      console.error('Import error:', error);
    } finally {
      setIsImporting(false);
    }
  }, []);

  const hideToast = useCallback(() => {
    setToast(prev => ({ ...prev, visible: false }));
  }, []);

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
            <Text style={styles.sectionTitle}>Data</Text>
            <TouchableOpacity
              style={[styles.settingItem, isExporting && styles.disabledItem]}
              onPress={handleExportData}
              disabled={isExporting}
            >
              <View style={styles.settingLeft}>
                <Download size={18} color="#fff" style={styles.settingIcon} />
                <Text style={styles.settingLabel}>
                  {isExporting ? 'Exporting...' : 'Export Data'}
                </Text>
              </View>
              <ChevronRight size={18} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.settingItem, isImporting && styles.disabledItem]}
              onPress={handleImportData}
              disabled={isImporting}
            >
              <View style={styles.settingLeft}>
                <Upload size={18} color="#fff" style={styles.settingIcon} />
                <Text style={styles.settingLabel}>
                  {isImporting ? 'Importing...' : 'Import Data'}
                </Text>
              </View>
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
          <Text style={styles.footerText}>Gryd {getAppVersion()}</Text>
          <Text style={styles.footerText}>Made with ❤️ by Ankur</Text>
        </View>
      </ScrollView>

      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={hideToast}
      />

      <ConfirmDialog
        title="Import Data"
        message="This will replace all your current data. Are you sure you want to continue?"
        visible={showImportConfirm}
        onClose={() => setShowImportConfirm(false)}
        onConfirm={handleConfirmImport}
        confirmText="Import"
        cancelText="Cancel"
        type="danger"
      />
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
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    marginRight: 12,
  },
  settingLabel: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 4,
  },
  disabledItem: {
    opacity: 0.5,
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
