import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Completion, Habit, Settings } from '../types';
import {
  getValidationErrorMessage,
  validateAppData,
} from '../utils/data-validation';
import { getAppVersion } from '../utils/version';

export interface AppData {
  version: string;
  habits: Habit[];
  completions: Completion;
  settings: Settings;
  exportedAt: string;
}

// Export all app data to JSON file
export const exportAppData = async (
  habits: Habit[],
  completions: Completion,
  settings: Settings
): Promise<void> => {
  try {
    const appData: AppData = {
      version: getAppVersion(),
      habits,
      completions,
      settings,
      exportedAt: new Date().toISOString(),
    };

    const fileName = `gryd-backup-${new Date().toISOString().split('T')[0]}.json`;
    const filePath = `${FileSystem.documentDirectory}${fileName}`;

    await FileSystem.writeAsStringAsync(
      filePath,
      JSON.stringify(appData, null, 2)
    );

    if (await Sharing.isAvailableAsync()) {
      console.log('*** filePath', filePath);
      await Sharing.shareAsync(filePath, {
        mimeType: 'application/json',
        dialogTitle: 'Export Gryd Data',
      });
    }
  } catch (error) {
    console.error('Export failed:', error);
    throw new Error('Failed to export data');
  }
};

// Import app data from JSON file
export const importAppData = async (): Promise<AppData> => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/json',
      copyToCacheDirectory: true,
    });

    if (result.canceled || !result.assets[0]) {
      throw new Error('No file selected');
    }

    const fileUri = result.assets[0].uri;
    const fileContent = await FileSystem.readAsStringAsync(fileUri);

    let appData: AppData;
    try {
      appData = JSON.parse(fileContent);
    } catch (parseError) {
      throw new Error('Invalid JSON file format');
    }

    // Validate the imported data structure
    const validation = validateAppData(appData);
    if (!validation.isValid) {
      const errorMessage = getValidationErrorMessage(validation);
      throw new Error(`Invalid data format: ${errorMessage}`);
    }

    return appData;
  } catch (error) {
    console.error('Import failed:', error);
    throw error;
  }
};
