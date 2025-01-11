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
import { Habit } from '../types';
import { Check, Undo } from 'lucide-react-native';
import Icon from './Icon';
import { COLORS_PALETTE } from '../constants/Colors';

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

  const { getHabitCompletions, toggleHabitCompletion } = useHabitsStore();

  const habitCompletions = getHabitCompletions(habit.id);
  const isTodayCompleted = habitCompletions?.[formatDate(new Date())] ?? false;

  const calendarData = useMemo(() => {
    if (!habit) return [];

    const habitData = getHabitCompletions(habit?.id);
    const today = new Date();
    return Array.from({ length: TOTAL_DAYS }, (_, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (TOTAL_DAYS - 1 - index));
      const dateString = formatDate(date);
      return {
        date: dateString,
        completed: habitData?.[dateString] || false,
      };
    });
  }, [habit?.id, JSON.stringify(habitCompletions)]); // Use JSON.stringify in the dependency array instead

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: false });
  }, []);

  if (!habit) return null;

  const getContributionColor = (completed: boolean) => {
    return completed ? habit?.color || COLORS_PALETTE[0] : '#161B22';
  };

  const getContributionCount = () => {
    return calendarData.filter(day => day.completed).length;
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
              backgroundColor: getContributionColor(day.completed),
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

    calendarData.forEach((day, index) => {
      const date = new Date(day.date);
      const monthKey = date.toLocaleString('default', { month: 'short' });
      const weekNumber = Math.floor(index / 7);

      // Only store the first week number for each month
      if (!months.hasOwnProperty(monthKey)) {
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
        <TouchableOpacity
          style={[
            styles.todayButton,
            { backgroundColor: habit?.color || COLORS_PALETTE[0] },
          ]}
          onPress={e => {
            e.stopPropagation();
            toggleHabitCompletion(formatDate(new Date()), habit.id);
          }}
        >
          {isTodayCompleted ? (
            <Undo color="#fff" size={20} />
          ) : (
            <Check color="#fff" size={20} />
          )}
        </TouchableOpacity>
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
