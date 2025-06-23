import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Completion, DataSource, Habit, Settings } from '../types';
import {
  getValidationErrorMessage,
  validateAppData,
} from '../utils/data-validation';
import { getAppVersion } from '../utils/version';
import { Platform } from 'react-native';
import { saveHabitsData, saveSettingsToDb } from './db';
import {
  getHabitCompletionsFromDb,
  getHabitsData,
  getSettingsFromDb,
  saveCompletionsData,
} from './db';

export interface AppData {
  version: string;
  habits: Habit[];
  completions: Completion;
  settings: Settings;
  exportedAt: string;
}

// Export all app data to JSON file
const createFileWithData = async (
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
    const jsonData = JSON.stringify(appData, null, 2);

    if (Platform.OS === 'web') {
      // Web: Use browser download
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else {
      const filePath = `${FileSystem.documentDirectory}${fileName}`;
      await FileSystem.writeAsStringAsync(filePath, jsonData);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(filePath, {
          mimeType: 'application/json',
          dialogTitle: 'Export Gryd Data',
        });
      }
    }
  } catch (error) {
    console.error('Export failed:', error);
    throw new Error('Failed to export data');
  }
};

// Import app data from JSON file
const readFileData = async (): Promise<AppData> => {
  try {
    let fileContent: string;

    if (Platform.OS === 'web') {
      // Web: Use file input
      fileContent = await new Promise((resolve, reject) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = event => {
          const file = (event.target as HTMLInputElement).files?.[0];
          if (!file) {
            reject(new Error('No file selected'));
            return;
          }

          const reader = new FileReader();
          reader.onload = e => {
            resolve(e.target?.result as string);
          };
          reader.onerror = () => reject(new Error('Failed to read file'));
          reader.readAsText(file);
        };
        input.click();
      });
    } else {
      // Mobile: Use expo-document-picker
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets[0]) {
        throw new Error('No file selected');
      }

      const fileUri = result.assets[0].uri;
      fileContent = await FileSystem.readAsStringAsync(fileUri);
    }

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

const filterAutomatedCompletions = (
  habits: Habit[],
  completions: Completion
) => {
  return Object.keys(completions).reduce((acc, habitId) => {
    const habit = habits.find(habit => habit.id === habitId);
    if (!habit) return acc;
    if ([DataSource.GitHub, DataSource.GitLab].includes(habit.dataSource)) {
      return acc;
    }
    return { ...acc, [habitId]: completions[habitId] };
  }, {});
};

// Export all data from the database
export const exportAppData = async (): Promise<void> => {
  const habits = await getHabitsData();
  const completions = await getHabitCompletionsFromDb();
  const filteredCompletions = filterAutomatedCompletions(habits, completions);
  const settings = await getSettingsFromDb();
  await createFileWithData(habits, filteredCompletions, settings);
};

// Import all data to the database
export const importAppData = async (): Promise<void> => {
  const appData = await readFileData();
  // TODO: Migrate data if needed
  await saveHabitsData(appData.habits);
  await saveCompletionsData(appData.completions);
  await saveSettingsToDb(appData.settings);
};
