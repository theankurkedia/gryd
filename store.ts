import { create } from 'zustand';
import {
  getHabitCompletionsFromDb,
  getHabitsData,
  saveCompletionsData,
  saveHabitsData,
} from './services/db';
import { Completion, Habit, DataSource } from './types';
import { fetchExternalContributionData } from './services/external-data-sources';
import { DEFAULT_FREQUENCY } from './constants/frequency';

interface HabitsStore {
  habits: Habit[];
  completions: Completion;
  notifToken?: string;
  isInitialisingHabits: boolean;
  initialiseHabits: () => Promise<void>;
  initialiseCompletions: () => Promise<void>;
  addHabit: (habit: Habit) => Promise<void>;
  editHabit: (habit: Habit) => Promise<void>;
  deleteHabit: (habitId: string) => Promise<void>;
  getHabitCompletions: (habitId: string) => {
    [date: string]: number;
  };
  updateHabitCompletion: (date: string, habitId: string) => Promise<void>;
  saveNotifToken: (token: string) => void;
}

export const useHabitsStore = create<HabitsStore>((set, get) => ({
  habits: [],
  isInitialisingHabits: true,
  completions: {},
  initialiseHabits: async () => {
    let habits = await getHabitsData();
    set({ habits });
    set({ isInitialisingHabits: false });
  },
  initialiseCompletions: async () => {
    // Get all manual completions
    let completions = await getHabitCompletionsFromDb();
    set({ completions });

    if (
      get().habits?.some(
        h => h.dataSource && h.dataSource !== DataSource.Manual
      )
    ) {
      await Promise.all(
        get()
          .habits?.filter(
            h => h.dataSource !== DataSource?.Manual && h.dataSourceIdentifier
          )
          ?.map(async h => {
            try {
              const externalCompletions = await fetchExternalContributionData(
                h.dataSource as Exclude<DataSource, 'manual'>,
                h.dataSourceIdentifier as string
              );
              completions = {
                ...completions,
                [h.id]: externalCompletions?.data,
              };
              h.frequency = DEFAULT_FREQUENCY[h.dataSource];
            } catch (error) {
              console.error(error);
            }
          }) || []
      );
    }

    set({ completions });
  },
  addHabit: async (habit: Habit) => {
    const habits = get().habits;
    habits.push({
      ...habit,
      id: Math.random().toString(36).substring(2, 10),
      createdAt: new Date().toISOString(),
    });
    set({ habits });
    await saveHabitsData(habits);
    get().initialiseHabits();
  },
  editHabit: async (habit: Habit) => {
    const habits = get().habits;
    const updatedHabits = habits.map(h => (h.id === habit.id ? habit : h));
    set({ habits: updatedHabits });
    await saveHabitsData(updatedHabits);
    get().initialiseHabits();
  },
  deleteHabit: async (habitId: string) => {
    const habit = get().habits.find(h => h.id === habitId);
    // Remove completions for the habit
    const { [habitId]: deletedCompletions, ...remainingCompletions } =
      get().completions;
    set({ completions: remainingCompletions });

    // Only save to storage if it's a manual habit
    if (!habit?.dataSource || habit?.dataSource === DataSource.Manual) {
      await saveCompletionsData(remainingCompletions);
    }

    // Remove the habit
    const updatedHabits = get().habits.filter(habit => habit.id !== habitId);
    set({ habits: updatedHabits });
    await saveHabitsData(updatedHabits);
  },
  setHabits: (habits: Habit[]) => set({ habits }),
  getHabitCompletions: (habitId: string) => {
    const completions = get().completions;
    return completions[habitId];
  },
  updateHabitCompletion: async (date: string, habitId: string) => {
    const habit = get().habits.find(h => h.id === habitId);
    const completions = get().completions;
    const completed = completions?.[habitId]?.[date] ?? 0;
    if (!completions?.[habitId]) {
      completions[habitId] = {};
    }
    completions[habitId][date] =
      completed === habit?.frequency ? 0 : completed + 1;
    set({ completions });

    // Only save to storage if it's a manual habit
    if (!habit?.dataSource || habit?.dataSource === DataSource.Manual) {
      await saveCompletionsData(completions);
    }
  },
  saveNotifToken: (token: string) => set({ notifToken: token }),
}));
