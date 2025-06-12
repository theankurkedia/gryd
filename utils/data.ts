import { Habit, PersistentHabit } from '@/types';

export function sanitiseHabitsToPersist(habits: Habit[]): PersistentHabit[] {
  return habits.map(habit => {
    const persistentHabit: PersistentHabit = {
      id: habit.id,
      name: habit.name,
      description: habit.description,
      icon: habit.icon,
      color: habit.color,
      createdAt: habit.createdAt,
      dailyReminderTime: habit.dailyReminderTime,
      dataSource: habit.dataSource,
      dataSourceIdentifier: habit.dataSourceIdentifier,
      frequency: habit.frequency,
      dailyReminderNotificationIdentifier:
        habit.dailyReminderNotificationIdentifier,
      order: habit.order,
    };
    return persistentHabit;
  });
}

export function sortHabitsByOrder(habits: Habit[]): Habit[] {
  return [...habits].sort((a, b) => {
    // If both habits have order, sort by order
    if (a.order !== undefined && b.order !== undefined) {
      return a.order - b.order;
    }
    // If only one habit has order, put it first
    if (a.order !== undefined) return -1;
    if (b.order !== undefined) return 1;
    // If neither has order, maintain original order
    return 0;
  });
}
