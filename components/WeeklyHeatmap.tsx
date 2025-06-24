import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Habit } from '@/types';
import { useHabitsStore } from '@/store';
import { formatDate } from '@/utils/date';
import { COLORS_PALETTE, getContributionColor } from '@/constants/colors';
import {
  WEEKDAYS_STARTING_MONDAY,
  WEEKDAYS_STARTING_SUNDAY,
} from '@/constants/date';
import Icon from './Icon';

interface Props {
  habit: Habit;
  onClick?: () => void;
}

const CELL_SIZE = 24;
const CELL_SPACING = 4;

export function WeeklyHeatmap({ habit, onClick }: Props) {
  const { getSetting, getHabitCompletions, updateHabitCompletion } =
    useHabitsStore();
  const showDayLabels = getSetting('showDayLabels');
  const weekStartsOnSunday = getSetting('weekStartsOnSunday');
  const weekdays = useMemo(
    () =>
      weekStartsOnSunday ? WEEKDAYS_STARTING_SUNDAY : WEEKDAYS_STARTING_MONDAY,
    [weekStartsOnSunday]
  );

  const habitCompletions = getHabitCompletions(habit.id);
  const todayFormatted = useMemo(() => formatDate(new Date()), []);

  const weekData = useMemo(() => {
    const today = new Date();
    const data: Array<{
      date: string;
      completed: number;
      dayName: string;
      isToday: boolean;
      dayOfWeek: number;
    }> = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateString = formatDate(date);
      const completed = habitCompletions?.[dateString] || 0;
      const dayName = weekdays[date.getDay()];

      data.push({
        date: dateString,
        completed,
        dayName,
        isToday: dateString === todayFormatted,
        dayOfWeek: date.getDay(),
      });
    }

    return data;
  }, [habit.id, habitCompletions, todayFormatted, weekdays]);

  const handleCellPress = async (e: any, date: string) => {
    e.stopPropagation();
    await updateHabitCompletion(date, habit.id);
  };

  return (
    <Pressable style={styles.container} onPress={onClick}>
      <View style={styles.header}>
        {habit.icon && <Icon name={habit.icon} color="#fff" size={20} />}
        <Text style={styles.habitName}>{habit.name}</Text>
      </View>
      <View style={styles.weekContainer}>
        {weekData.map(day => (
          <View key={day.date} style={styles.dayContainer}>
            {showDayLabels && (
              <Text style={styles.dayLabel}>{day.dayName}</Text>
            )}
            <Pressable
              style={[
                styles.cell,
                {
                  backgroundColor: getContributionColor(
                    habit?.color || COLORS_PALETTE.cyan,
                    day.completed,
                    habit?.frequency || 1
                  ),
                  borderWidth: day.isToday ? 1 : 0,
                  borderColor: day.isToday ? '#ffffff' : 'transparent',
                },
              ]}
              onPress={e => handleCellPress(e, day.date)}
            >
              {day.completed > 0 && (
                <Text style={styles.completionText}>
                  {day.completed > 1 ? day.completed : ''}
                </Text>
              )}
            </Pressable>
          </View>
        ))}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0D1117',
    borderRadius: 12,
    padding: 16,
    display: 'flex',
    flexDirection: 'row',
    gap: 30,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  habitName: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    color: '#fff',
  },
  weekContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayContainer: {
    alignItems: 'center',
    flex: 1,
  },
  dayLabel: {
    fontSize: 10,
    color: '#666',
    marginBottom: 4,
    fontWeight: '500',
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: CELL_SPACING / 2,
  },
  completionText: {
    fontSize: 10,
    color: '#ffffff',
    fontWeight: 'bold',
  },
});
