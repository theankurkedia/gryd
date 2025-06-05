import AsyncStorage from '@react-native-async-storage/async-storage';
import { Completion, Habit, Settings } from '../types';

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
