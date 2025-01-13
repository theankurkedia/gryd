import AsyncStorage from '@react-native-async-storage/async-storage';
import { Completion, Habit, Storage } from '../types';

const STORAGE_HABITS_KEY = 'gryd-habits';
const STORAGE_COMPLETE_KEY = 'gryd-completions';

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
  completed: boolean
) => {
  const completions = await getHabitCompletionsFromDb();

  if (!completions[habitId]) {
    completions[habitId] = {};
  }

  completions[habitId][date] = completed;
  await saveCompletionsData(completions);
  return completions[habitId];
};
