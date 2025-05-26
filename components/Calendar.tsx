import React, { useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { formatDate } from '../utils/date';
import { useHabitsStore } from '../store';
import { DataSource, Habit } from '../types';
import { Check } from 'lucide-react-native';
import Icon from './Icon';
import { COLORS_PALETTE, getContributionColor } from '../constants/colors';
import { cancelScheduledNotification } from '../utils/notifications';

interface Props {
  habit: Habit;
  onClick: () => void;
}

const BOX_SIZE = 10;
const MARGIN = 2;
const GRID_SIZE = BOX_SIZE + MARGIN * 2;
const TOTAL_DAYS = 364; // 52 weeks * 7 days
const WEEKS = 52;
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function Calendar({ habit, onClick }: Props) {
  const scrollViewRef = useRef<ScrollView>(null);

  const { getHabitCompletions, updateHabitCompletion } = useHabitsStore();

  const habitCompletions = getHabitCompletions(habit.id);
  const todaysCompletions = habitCompletions?.[formatDate(new Date())] ?? 0;

  const calendarData = useMemo(() => {
    if (!habit) return [];

    const habitData = getHabitCompletions(habit?.id);
    const today = new Date();
    const daysUntilEndOfWeek = 6 - today.getDay(); // Days remaining until Saturday
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
  }, [habit?.id, JSON.stringify(habitCompletions)]);

  useEffect(() => {
    cancelScheduledNotification(habit?.id);
    scrollViewRef.current?.scrollToEnd({ animated: false });
  }, []);

  if (!habit) return null;

  const getContributionCount = () => {
    return calendarData.reduce((sum, day) => sum + day.completed, 0);
  };

  const renderGrid = () => {
    const today = formatDate(new Date());

    return calendarData.map((day, index) => {
      const date = new Date(day.date);
      const dayOfWeek = date.getDay(); // 0-6, where 0 is Sunday
      const weekNumber = Math.floor(index / 7);

      return (
        <TouchableOpacity
          key={index}
          style={[
            styles.contributionBox,
            {
              backgroundColor: getContributionColor(
                habit?.color || COLORS_PALETTE.cyan,
                day.completed,
                habit?.frequency || 1
              ),
              position: 'absolute',
              top: dayOfWeek * GRID_SIZE,
              left: weekNumber * GRID_SIZE,
              borderWidth: day.date === today ? 1 : 0,
              borderColor: '#ffffff',
            },
          ]}
        />
      );
    });
  };

  const renderMonthLabels = () => {
    const months: { [key: string]: number } = {};
    const currentMonthKey = new Date().toLocaleString('default', {
      month: 'short',
    });
    calendarData.forEach((day, index) => {
      const date = new Date(day.date);
      const monthKey = date.toLocaleString('default', { month: 'short' });
      const weekNumber = Math.floor(index / 7);

      // Only store the first week number for each month
      // Exclude current month if it's the first week because it will pick up the current month of last year
      if (
        !months.hasOwnProperty(monthKey) ||
        (monthKey === currentMonthKey && months[monthKey] === 0)
      ) {
        months[monthKey] = weekNumber;
      }
    });

    return Object.entries(months).map(([month, weekNumber]) => (
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
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.header} onPress={onClick}>
        <View>
          <View style={styles.habitNameContainer}>
            {habit.icon && <Icon name={habit.icon} color="#fff" size={20} />}
            <Text style={styles.habitName}>{habit.name}</Text>
          </View>
          <Text style={styles.contributionCount}>
            {getContributionCount()} contributions in the last year
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
            onPress={e => {
              e.stopPropagation();
              updateHabitCompletion(formatDate(new Date()), habit.id);
            }}
          >
            <Check color="#fff" size={20} />
          </TouchableOpacity>
        )}
      </TouchableOpacity>

      <View style={styles.calendarContainer}>
        <View style={styles.weekdayLabels}>
          {WEEKDAYS.map(day => (
            <Text key={day} style={styles.weekdayLabel}>
              {day}
            </Text>
          ))}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollViewContent}
        >
          <View style={styles.contributionWrapper}>
            <View style={styles.monthLabelsContainer}>
              {renderMonthLabels()}
            </View>
            <View
              style={[
                styles.contributionGrid,
                {
                  width: WEEKS * GRID_SIZE,
                  height: 7 * GRID_SIZE,
                },
              ]}
            >
              {renderGrid()}
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0D1117',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
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
    marginTop: 19,
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
