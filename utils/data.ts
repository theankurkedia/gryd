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
    };
    return persistentHabit;
  });
}
