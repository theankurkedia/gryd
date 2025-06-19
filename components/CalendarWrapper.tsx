import { useHabitsStore } from '@/store';
import { DataSource, Habit } from '@/types';
import { formatDate } from '@/utils/date';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import React, { useCallback } from 'react';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { Calendar } from 'react-native-calendars';
import {
  MarkedDates,
  Theme as CalendarTheme,
} from 'react-native-calendars/src/types';

interface Props {
  habit: Habit;
}

const CALENDAR_THEME: CalendarTheme | Record<string, object> = {
  calendarBackground: 'rgba(13, 17, 23, 0.8)',
  textMonthFontWeight: 'bold',
  dayTextColor: '#fff',
  monthTextColor: '#fff',
  textDisabledColor: '#424242',
  textDayFontSize: 12,
  'stylesheet.calendar.main': {
    week: {
      height: 24,
      marginVertical: 10,
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
  },
  'stylesheet.calendar.header': {
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 10,
      marginVertical: 12,
    },
  },
};

export function CalendarWrapper({ habit }: Props) {
  const { updateHabitCompletion, getHabitCompletions, getSetting } =
    useHabitsStore();
  const weekStartsOnSunday = getSetting('weekStartsOnSunday');
  const showDayLabels = getSetting('showDayLabels');
  const todayFormatted = formatDate(new Date());
  const habitCompletions = getHabitCompletions(habit.id);

  const markedDates: MarkedDates = Object.keys(habitCompletions).reduce(
    (acc, date) => {
      const count = habitCompletions[date];
      acc[date] = {
        marked: true,
        dots: Array.from({ length: Math.min(count, 5) }, () => ({
          color: habit.color,
        })),
      };
      return acc;
    },
    {}
  );

  const updateCompletion = useCallback(
    (date: string) => {
      updateHabitCompletion(date, habit?.id);
    },
    [habit?.id, updateHabitCompletion]
  );

  return (
    <View style={styles.calendarSheetContent}>
      <Calendar
        maxDate={todayFormatted}
        markedDates={markedDates}
        theme={CALENDAR_THEME}
        markingType="multi-dot"
        monthFormat={'MMMM yyyy'}
        renderArrow={direction =>
          direction === 'left' ? (
            <ChevronLeft color="#fff" />
          ) : (
            <ChevronRight color="#fff" />
          )
        }
        firstDay={weekStartsOnSunday ? 0 : 1}
        hideDayNames={!showDayLabels}
        disableAllTouchEventsForDisabledDays
        enableSwipeMonths
        dayComponent={props => (
          <DayComponent
            {...props}
            onPress={updateCompletion}
            count={habitCompletions[props.date.dateString] || 0}
            color={habit.color}
            disabled={[DataSource.GitHub, DataSource.GitLab].includes(
              habit.dataSource
            )}
          />
        )}
      />
    </View>
  );
}

const DayComponent = ({ date, state, count, color, onPress, ...props }) => (
  <TouchableOpacity
    {...props}
    style={styles.dayContainer}
    onPress={() => onPress(date.dateString)}
  >
    <Text
      style={{
        color: state === 'disabled' ? '#424242' : '#fff',
      }}
    >
      {date.day}
    </Text>
    {count < 5 ? (
      <View style={styles.countDot}>
        {[...Array(count)].map((_, idx) => (
          <View
            key={idx}
            style={[styles.customCountDot, { backgroundColor: color }]}
          />
        ))}
      </View>
    ) : (
      <View style={styles.customCount}>
        <View
          style={[
            styles.customCountDot,
            {
              backgroundColor: color,
            },
          ]}
        />
        <Text style={styles.customCountText}>{count}</Text>
      </View>
    )}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  calendarSheetContent: {
    flex: 1,
  },
  customCount: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
    borderRadius: 8,
    backgroundColor: '#fff',
    padding: 1,
    marginTop: 2,
  },
  customCountText: {
    fontSize: 10,
  },
  dayContainer: {
    alignItems: 'center',
  },
  countDot: {
    flexDirection: 'row',
    marginTop: 2,
  },
  customCountDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginHorizontal: 1,
  },
});
