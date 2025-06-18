import { useHabitsStore } from '@/store';
import { Habit } from '@/types';
import { formatDate } from '@/utils/date';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { MarkedDates } from 'react-native-calendars/src/types';

interface Props {
  habit: Habit;
}

const CALENDAR_THEME = {
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
  const { updateHabitCompletion, getHabitCompletions } = useHabitsStore();
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

  return (
    <View style={styles.calendarSheetContent}>
      <Calendar
        maxDate={todayFormatted}
        onDayPress={day => {
          console.log('** selected day', day);
        }}
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
        // If firstDay=1 week starts from Monday. Note that dayNames and dayNamesShort should still start from Sunday
        firstDay={1}
        hideDayNames
        // Disable all touch events for disabled days. can be override with disableTouchEvent in markedDates
        disableAllTouchEventsForDisabledDays
        enableSwipeMonths
        dayComponent={({ date, state }) => (
          <DayComponent
            date={date}
            state={state}
            count={habitCompletions[date.dateString] || 0}
            color={habit.color}
          />
        )}
      />
    </View>
  );
}

const DayComponent = ({ date, state, count, color }) => {
  return (
    <View style={styles.dayContainer}>
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
    </View>
  );
};

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
