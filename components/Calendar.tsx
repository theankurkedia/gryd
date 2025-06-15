import {
  GRID_SIZE,
  TOTAL_DAYS,
  WEEKDAYS_STARTING_MONDAY,
  WEEKDAYS_STARTING_SUNDAY,
  WEEKS,
} from '@/constants/date';
import { Check } from 'lucide-react-native';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { COLORS_PALETTE, getContributionColor } from '../constants/colors';
import { useHabitsStore } from '../store';
import { DataSource, Habit } from '../types';
import { formatDate } from '../utils/date';
import { CalendarGridSkeleton } from './CalendarSkeleton';
import Icon from './Icon';

interface Props {
  habit: Habit;
  onClick?: () => void;
}

export function Calendar({ habit, onClick }: Props) {
  const scrollViewRef = useRef<ScrollView>(null);
  const { getSetting, getHabitCompletions, updateHabitCompletion } =
    useHabitsStore();

  const weekStartsOnSunday = getSetting('weekStartsOnSunday');
  const showDayLabels = getSetting('showDayLabels');
  const showMonthLabels = getSetting('showMonthLabels');
  const weekdays = useMemo(
    () =>
      weekStartsOnSunday ? WEEKDAYS_STARTING_SUNDAY : WEEKDAYS_STARTING_MONDAY,
    [weekStartsOnSunday]
  );

  const todayFormatted = useMemo(() => formatDate(new Date()), []);
  const habitCompletions = getHabitCompletions(habit.id);
  const todaysCompletions = habitCompletions?.[todayFormatted] ?? 0;

  const calendarData = useMemo(() => {
    if (!habit) return [];

    const habitData = getHabitCompletions(habit?.id);
    const today = new Date();

    // Adjust day of week calculation based on week start preference
    const todayDayOfWeek = today.getDay(); // 0=Sunday, 1=Monday, etc.
    const adjustedDayOfWeek = weekStartsOnSunday
      ? todayDayOfWeek
      : todayDayOfWeek === 0
        ? 6
        : todayDayOfWeek - 1; // Monday=0, Sunday=6

    const daysUntilEndOfWeek = 6 - adjustedDayOfWeek; // Days remaining until end of week
    const totalDaysToShow = TOTAL_DAYS - daysUntilEndOfWeek; // Reduce past days to accommodate future days

    // Get past dates up to today
    const pastDates = Array.from({ length: totalDaysToShow }, (_, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (totalDaysToShow - 1 - index));
      const dateString = formatDate(date);
      return {
        date: dateString,
        completed: habitData?.[dateString] || 0,
      };
    });

    // Add future dates to complete the week
    const futureDates = Array.from(
      { length: daysUntilEndOfWeek },
      (_, index) => {
        const date = new Date(today);
        date.setDate(today.getDate() + index + 1);
        const dateString = formatDate(date);
        return {
          date: dateString,
          completed: 0,
        };
      }
    );

    return [...pastDates, ...futureDates];
  }, [habit?.id, JSON.stringify(habitCompletions), weekStartsOnSunday]);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: false });
  }, []);

  const contributionCount = useMemo(
    () => calendarData.reduce((sum, day) => sum + day.completed, 0),
    [calendarData]
  );

  const gridData = useMemo(() => {
    return calendarData.map((day, index) => {
      const date = new Date(day.date);
      const dayOfWeek = date.getDay(); // 0-6, where 0 is Sunday

      // Adjust day of week for grid positioning based on week start preference
      const adjustedDayOfWeek = weekStartsOnSunday
        ? dayOfWeek
        : dayOfWeek === 0
          ? 6
          : dayOfWeek - 1; // Monday=0, Sunday=6

      const weekNumber = Math.floor(index / 7);

      return {
        key: index,
        dayOfWeek: adjustedDayOfWeek,
        weekNumber,
        completed: day.completed,
        date: day.date,
        isToday: day.date === todayFormatted,
      };
    });
  }, [calendarData, todayFormatted, weekStartsOnSunday]);

  const grid = useMemo(() => {
    return gridData.map(gridItem => {
      return (
        <View
          key={gridItem.key}
          style={[
            styles.contributionBox,
            {
              backgroundColor: getContributionColor(
                habit?.color || COLORS_PALETTE.cyan,
                gridItem.completed,
                habit?.frequency || 1
              ),
              position: 'absolute',
              top: gridItem.dayOfWeek * GRID_SIZE,
              left: gridItem.weekNumber * GRID_SIZE,
              borderWidth: gridItem.isToday ? 1 : 0,
              borderColor: '#ffffff',
            },
          ]}
        />
      );
    });
  }, [gridData, habit?.color, habit?.frequency]);

  const monthLabelsData = useMemo(() => {
    const months: { [key: string]: number } = {};
    const currentMonthKey = new Date().toLocaleString('default', {
      month: 'short',
    });

    // Find the first day of each month in the calendar data
    calendarData.forEach((day, index) => {
      const date = new Date(day.date);
      const monthKey = date.toLocaleString('default', { month: 'short' });

      // Only store the first day of each month
      if (date.getDate() === 1 && !months.hasOwnProperty(monthKey)) {
        const weekNumber = Math.floor(index / 7);
        months[monthKey] = weekNumber;
      }
    });

    // If current month doesn't have a label (because it doesn't start on day 1),
    // add it at the appropriate position
    if (!months.hasOwnProperty(currentMonthKey)) {
      const today = new Date();
      const currentMonthStart = new Date(
        today.getFullYear(),
        today.getMonth(),
        1
      );
      const currentMonthStartStr = formatDate(currentMonthStart);

      const currentMonthIndex = calendarData.findIndex(
        day => day.date === currentMonthStartStr
      );
      if (currentMonthIndex !== -1) {
        months[currentMonthKey] = Math.floor(currentMonthIndex / 7);
      }
    }

    return Object.entries(months);
  }, [calendarData]);

  const monthLabels = useMemo(() => {
    return monthLabelsData.map(([month, weekNumber]) => (
      <Text
        key={month}
        style={[
          styles.monthLabel,
          {
            left: weekNumber * GRID_SIZE,
          },
        ]}
      >
        {month}
      </Text>
    ));
  }, [monthLabelsData]);

  const handleTodayButtonPress = useCallback(
    (e: any) => {
      e.stopPropagation();
      updateHabitCompletion(todayFormatted, habit.id);
    },
    [updateHabitCompletion, todayFormatted, habit.id]
  );

  return (
    <View style={styles.container}>
      <Pressable style={styles.header} onPress={onClick}>
        <View>
          <View style={styles.habitNameContainer}>
            {habit.icon && <Icon name={habit.icon} color="#fff" size={20} />}
            <Text style={styles.habitName}>{habit.name}</Text>
          </View>
          <Text style={styles.contributionCount}>
            {contributionCount} contributions in the last year
          </Text>
        </View>
        {(!habit.dataSource || habit.dataSource === DataSource.Manual) && (
          <TouchableOpacity
            style={[
              styles.todayButton,
              {
                backgroundColor: getContributionColor(
                  habit?.color || COLORS_PALETTE.cyan,
                  todaysCompletions,
                  habit?.frequency || 1
                ),
              },
            ]}
            onPress={handleTodayButtonPress}
          >
            <Check color="#fff" size={20} />
          </TouchableOpacity>
        )}
      </Pressable>

      <View style={styles.calendarContainer}>
        {showDayLabels && (
          <View
            style={[
              styles.weekdayLabels,
              showMonthLabels && styles.weekdayLabelsTopSpacing,
            ]}
          >
            {weekdays.map(day => (
              <Text key={day} style={styles.weekdayLabel}>
                {day}
              </Text>
            ))}
          </View>
        )}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollViewContent}
          onPointerUp={Platform.OS === 'web' ? onClick : undefined}
          onTouchEnd={Platform.OS === 'android' ? onClick : undefined}
        >
          <View style={[showMonthLabels && styles.contributionWrapper]}>
            {showMonthLabels && (
              <View style={styles.monthLabelsContainer}>{monthLabels}</View>
            )}
            {habit.loading ? (
              <CalendarGridSkeleton color={habit?.color} />
            ) : (
              <View
                style={[
                  styles.contributionGrid,
                  {
                    width: WEEKS * GRID_SIZE,
                    height: 7 * GRID_SIZE,
                  },
                ]}
              >
                {grid}
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0D1117',
    borderRadius: 12,
    padding: 16,
    maxWidth: 796,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  habitName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  contributionCount: {
    color: '#8B949E',
    fontSize: 12,
    marginTop: 4,
  },
  todayButton: {
    padding: 8,
    borderRadius: 6,
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  contributionGrid: {
    position: 'relative',
  },
  contributionBox: {
    width: 10,
    height: 10,
    margin: 2,
    borderRadius: 2,
  },
  calendarContainer: {
    flexDirection: 'row',
  },
  weekdayLabels: {
    marginRight: 4,
    gap: 2,
  },
  weekdayLabelsTopSpacing: {
    marginTop: 20,
  },
  weekdayLabel: {
    color: '#8B949E',
    fontSize: 12,
    lineHeight: 12,
    textAlign: 'right',
    width: 32,
    height: 12,
  },
  contributionWrapper: {
    paddingTop: 20, // Make room for month labels
  },
  monthLabelsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 16,
  },
  monthLabel: {
    position: 'absolute',
    color: '#8B949E',
    fontSize: 12,
    top: 0,
  },
  habitNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 6,
  },
  habitIcon: {
    marginRight: 8,
  },
});
