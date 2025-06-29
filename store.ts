import { create } from 'zustand';
import { DEFAULT_FREQUENCY } from './constants/frequency';
import {
  getHabitCompletionsFromDb,
  getHabitsData,
  saveCompletionsData,
  saveHabitsData,
  getSettingsFromDb,
  saveSettingsToDb,
} from './services/db';
import { fetchExternalContributionData } from './services/external-data-sources';
import { Completion, DataSource, Habit, Settings } from './types';
import { sanitiseHabitsToPersist } from './utils/data';

interface HabitsStore {
  habits: Habit[];
  completions: Completion;
  settings: Settings;
  getSetting: (setting: keyof Settings) => Settings[keyof Settings];
  getAllSettings: () => Settings;
  setSettings: (
    setting: keyof Settings,
    value: Settings[keyof Settings]
  ) => void;
  notifToken?: string;
  isInitialisingHabits: boolean;
  initialiseHabits: () => Promise<void>;
  syncHabits: () => Promise<void>;
  initialiseCompletions: () => Promise<void>;
  addHabit: (habit: Habit) => Promise<void>;
  editHabit: (habit: Habit) => Promise<void>;
  editHabits: (habits: Habit[]) => void;
  deleteHabit: (habitId: string) => Promise<void>;
  getHabitCompletions: (habitId: string) => Record<string, number>;
  updateHabitCompletion: (date: string, habitId: string) => Promise<void>;
  saveNotifToken: (token: string) => void;
  updateCompletionsFromExternalSource: (h: Habit) => Promise<void>;
}

const DEFAULT_SETTINGS: Settings = {
  showMonthLabels: true,
  showDayLabels: true,
  weekStartsOnSunday: false,
};

export const useHabitsStore = create<HabitsStore>((set, get) => ({
  habits: [],
  isInitialisingHabits: true,
  settings: DEFAULT_SETTINGS,
  completions: {},
  getSetting: (setting: keyof Settings) => get().settings[setting],
  getAllSettings: () => get().settings,
  setSettings: (setting: keyof Settings, value: Settings[keyof Settings]) => {
    const updatedSettings = { ...get().settings, [setting]: value };
    set({ settings: updatedSettings });
    saveSettingsToDb(updatedSettings);
  },
  initialiseHabits: async () => {
    let habits = await getHabitsData();
    set({
      habits: habits.map(h => ({
        ...h,
        loading:
          !h.dataSource || h.dataSource === DataSource.Manual ? false : true,
      })),
    });
    const settings = await getSettingsFromDb();
    set({
      settings: { ...DEFAULT_SETTINGS, ...settings },
      isInitialisingHabits: false,
    });
  },
  syncHabits: async () => {
    const habits = await getHabitsData();
    set({ habits });
  },
  initialiseCompletions: async () => {
    // Get all manual completions
    let completions = await getHabitCompletionsFromDb();
    set({ completions });

    // Fetch external data asynchronously without blocking
    const habitsWithExternalData =
      get().habits?.filter(
        h =>
          h.dataSource &&
          h.dataSource !== DataSource.Manual &&
          h.dataSourceIdentifier
      ) || [];

    if (habitsWithExternalData.length > 0) {
      // Process each habit independently without waiting for all to complete
      habitsWithExternalData.forEach(async h => {
        try {
          const externalCompletions = await fetchExternalContributionData(
            h.dataSource as Exclude<DataSource, 'manual'>,
            h.dataSourceIdentifier as string
          );

          // Update completions for this specific habit
          set(state => ({
            habits: state.habits.map(habit =>
              h.id === habit.id
                ? {
                    ...habit,
                    frequency: h.frequency ?? DEFAULT_FREQUENCY[h.dataSource],
                    loading: false,
                    error: undefined,
                  }
                : habit
            ),
            completions: {
              ...state.completions,
              [h.id]: externalCompletions?.data,
            },
          }));
        } catch (error) {
          set(state => ({
            habits: state.habits.map(habit =>
              h.id === habit.id
                ? {
                    ...habit,
                    frequency: h.frequency ?? DEFAULT_FREQUENCY[h.dataSource],
                    loading: false,
                    error:
                      error instanceof Error ? error.message : 'Unknown error',
                  }
                : habit
            ),
          }));
          console.error(error);
        }
      });
    }
  },
  addHabit: async (habit: Habit) => {
    const habits = get().habits;
    const newHabit = {
      ...habit,
      id: Math.random().toString(36).substring(2, 10),
      createdAt: new Date().toISOString(),
      frequency: habit.frequency ?? DEFAULT_FREQUENCY[habit.dataSource],
      order:
        habit.order ??
        (habits.length > 0
          ? Math.max(...habits.map(h => h.order ?? 0)) + 1
          : 0),
    };
    const updatedHabits = [...habits, newHabit];
    set({ habits: updatedHabits });
    await saveHabitsData(sanitiseHabitsToPersist(updatedHabits));
    if (habit.dataSource && habit.dataSource !== DataSource.Manual) {
      await get().updateCompletionsFromExternalSource(newHabit);
    }
    get().syncHabits();
  },
  editHabit: async (habit: Habit) => {
    const habits = get().habits;
    const updatedHabits = habits.map(h => (h.id === habit.id ? habit : h));

    set({ habits: updatedHabits });
    await saveHabitsData(sanitiseHabitsToPersist(updatedHabits));
    if (habit.dataSource && habit.dataSource !== DataSource.Manual) {
      await get().updateCompletionsFromExternalSource(habit);
    }
    get().syncHabits();
  },
  editHabits: async (habits: Habit[]) => {
    const originalHabits = get().habits;
    const updatedHabits = originalHabits.map(h => {
      const updatedHabit = habits.find(h2 => h2.id === h.id);
      return updatedHabit ?? h;
    });
    set({ habits: updatedHabits });
    await saveHabitsData(sanitiseHabitsToPersist(updatedHabits));
    get().syncHabits();
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
    await saveHabitsData(sanitiseHabitsToPersist(updatedHabits));
  },
  setHabits: (habits: Habit[]) => set({ habits }),
  getHabitCompletions: (habitId: string) => {
    const completions = get().completions;
    return completions[habitId];
  },
  updateCompletionsFromExternalSource: async (h: Habit) => {
    try {
      const externalCompletions = await fetchExternalContributionData(
        h.dataSource as Exclude<DataSource, 'manual'>,
        h.dataSourceIdentifier as string
      );

      // Update completions for this specific habit
      set(state => ({
        habits: state.habits.map(habit =>
          h.id === habit.id
            ? {
                ...habit,
                loading: false,
                error: undefined,
              }
            : habit
        ),
        completions: {
          ...(state.completions || {}),
          [h.id]: externalCompletions?.data,
        },
      }));
    } catch (error) {
      set(state => ({
        habits: state.habits.map(habit =>
          h.id === habit.id
            ? {
                ...habit,
                loading: false,
                error: error instanceof Error ? error.message : 'Unknown error',
              }
            : habit
        ),
      }));
      console.error(error);
    }
  },
  updateHabitCompletion: async (date: string, habitId: string) => {
    const habit = get().habits.find(h => h.id === habitId);
    const completions = get().completions;
    const completed = completions?.[habitId]?.[date] ?? 0;
    if (!completions?.[habitId]) {
      completions[habitId] = {};
    }

    if (completed < (habit?.frequency ?? 1)) {
      completions[habitId][date] = completed + 1;
    } else {
      delete completions[habitId][date];
    }

    if (!habit?.dataSource || habit?.dataSource === DataSource.Manual) {
      set({ completions });
    }

    // Only save to storage if it's a manual habit
    if (!habit?.dataSource || habit?.dataSource === DataSource.Manual) {
      await saveCompletionsData(completions);
    }
  },
  saveNotifToken: (token: string) => set({ notifToken: token }),
}));
