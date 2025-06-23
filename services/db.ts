import AsyncStorage from '@react-native-async-storage/async-storage';
import { Completion, Habit, Settings } from '../types';
import { getAppVersion } from '../utils/version';
import { AppData, exportAppData, importAppData } from './import-export';

const STORAGE_HABITS_KEY = 'gryd-habits';
const STORAGE_COMPLETE_KEY = 'gryd-completions';
const STORAGE_SETTINGS_KEY = 'gryd-settings';

// Get habits data
export const getHabitsData = async (): Promise<Habit[]> => {
  const data = await AsyncStorage.getItem(STORAGE_HABITS_KEY);
  return data ? JSON.parse(data) : [];
};

// Get completions data
export const getHabitCompletionsFromDb = async (): Promise<Completion> => {
  const data = await AsyncStorage.getItem(STORAGE_COMPLETE_KEY);
  return data ? JSON.parse(data) : {};
};

// Save habits data
export const saveHabitsData = async (habits: Habit[]) => {
  await AsyncStorage.setItem(STORAGE_HABITS_KEY, JSON.stringify(habits));
};

// Save completions data
export const saveCompletionsData = async (completions: Completion) => {
  await AsyncStorage.setItem(STORAGE_COMPLETE_KEY, JSON.stringify(completions));
};

export const addHabitToDb = async (habit: Habit) => {
  const habits = await getHabitsData();
  habits.push(habit);
  await saveHabitsData(habits);
  return habit;
};

export const updateHabitCompletionInDb = async (
  date: string,
  habitId: string,
  frequency: number
) => {
  const completions = await getHabitCompletionsFromDb();

  if (!completions[habitId]) {
    completions[habitId] = {};
  }

  completions[habitId][date] = frequency;
  await saveCompletionsData(completions);
  return completions[habitId];
};

export const getSettingsFromDb = async (): Promise<Settings> => {
  const data = await AsyncStorage.getItem(STORAGE_SETTINGS_KEY);
  return data ? JSON.parse(data) : {};
};

export const saveSettingsToDb = async (settings: Settings) => {
  await AsyncStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(settings));
};

// Get all data for backup purposes
const getAllData = async (): Promise<AppData> => {
  const habits = await getHabitsData();
  const completions = await getHabitCompletionsFromDb();
  const settings = await getSettingsFromDb();

  return {
    version: getAppVersion(),
    habits,
    completions,
    settings,
    exportedAt: new Date().toISOString(),
  };
};

// Export all data from the database
export const exportAllData = async (): Promise<void> => {
  const appData = await getAllData();
  await exportAppData(appData.habits, appData.completions, appData.settings);
};

// Import all data to the database
export const importAllData = async (): Promise<void> => {
  const appData = await importAppData();
  // TODO: Migrate data if needed
  await saveHabitsData(appData.habits);
  await saveCompletionsData(appData.completions);
  await saveSettingsToDb(appData.settings);
};
