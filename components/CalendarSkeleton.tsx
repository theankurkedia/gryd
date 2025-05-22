import React, { useEffect } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

const BOX_SIZE = 10;
const MARGIN = 2;
const GRID_SIZE = BOX_SIZE + MARGIN * 2;
const TOTAL_DAYS = 364;
const WEEKS = 52;
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function CalendarSkeleton() {
  const animatedValue = new Animated.Value(0);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const renderGrid = () => {
    return Array.from({ length: TOTAL_DAYS }).map((_, index) => {
      const dayOfWeek = index % 7;
      const weekNumber = Math.floor(index / 7);

      return (
        <View
          key={index}
          style={[
            styles.contributionBox,
            {
              position: 'absolute',
              top: dayOfWeek * GRID_SIZE,
              left: weekNumber * GRID_SIZE,
            },
          ]}
        />
      );
    });
  };

  const renderWeekdayLabels = () => {
    return WEEKDAYS.map(day => <View key={day} style={styles.weekdayLabel} />);
  };

  const renderMonthLabels = () => {
    return Array.from({ length: 12 }).map((_, index) => (
      <View
        key={index}
        style={[
          styles.monthLabel,
          {
            left: ((index * WEEKS) / 12) * GRID_SIZE,
          },
        ]}
      />
    ));
  };

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 0.8],
  });

  return (
    <Animated.View style={[styles.container, { opacity }]}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <View style={styles.titleSkeleton} />
          <View style={styles.subtitleSkeleton} />
        </View>
        <View style={styles.todayButtonSkeleton} />
      </View>

      <View style={styles.calendarContainer}>
        <View style={styles.weekdayLabels}>{renderWeekdayLabels()}</View>

        <View style={styles.contributionWrapper}>
          <View style={styles.monthLabelsContainer}>{renderMonthLabels()}</View>
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
      </View>
    </Animated.View>
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
  titleContainer: {
    gap: 8,
  },
  titleSkeleton: {
    width: 150,
    height: 20,
    backgroundColor: '#161B22',
    borderRadius: 4,
  },
  subtitleSkeleton: {
    width: 200,
    height: 14,
    backgroundColor: '#161B22',
    borderRadius: 4,
  },
  todayButtonSkeleton: {
    width: 36,
    height: 36,
    backgroundColor: '#161B22',
    borderRadius: 6,
  },
  calendarContainer: {
    flexDirection: 'row',
    overflow: 'hidden',
  },
  weekdayLabels: {
    marginRight: 4,
    gap: 2,
    marginTop: 19,
  },
  weekdayLabel: {
    width: 32,
    height: 12,
    backgroundColor: '#161B22',
    borderRadius: 2,
  },
  contributionWrapper: {
    paddingTop: 20,
  },
  contributionGrid: {
    position: 'relative',
  },
  contributionBox: {
    width: BOX_SIZE,
    height: BOX_SIZE,
    margin: MARGIN,
    borderRadius: 2,
    backgroundColor: '#161B22',
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
    width: 30,
    height: 12,
    backgroundColor: '#161B22',
    borderRadius: 2,
  },
});
