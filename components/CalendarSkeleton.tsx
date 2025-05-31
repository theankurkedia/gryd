import { COLORS_PALETTE, withOpacity } from '@/constants/colors';
import { GRID_SIZE, WEEKDAYS, WEEKS } from '@/constants/date';
import React, { useEffect, useMemo } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

export function CalendarSkeleton() {
  const animatedValue = new Animated.Value(0);

  // Pre-generate random values to avoid re-calculation on each render
  const randomValues = useMemo(
    () =>
      Array.from({ length: 364 }, () => ({
        minOpacity: Math.random() * 0.3,
        maxOpacity: Math.random() * 0.5,
      })),
    []
  );

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false, // Changed to false to support backgroundColor animation
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false, // Changed to false to support backgroundColor animation
        }),
      ])
    ).start();
  }, []);

  const renderGrid = () => {
    return Array.from({ length: 364 }).map((_, index) => (
      <Animated.View
        key={index}
        style={[
          styles.contributionBox,
          {
            position: 'absolute',
            top: (index % 7) * 14,
            left: Math.floor(index / 7) * 14,
            backgroundColor: animatedValue.interpolate({
              inputRange: [0, 1],
              outputRange: [
                `rgba(86, 211, 100, ${randomValues[index].minOpacity})`,
                `rgba(86, 211, 100, ${randomValues[index].maxOpacity})`,
              ],
            }),
          },
        ]}
      />
    ));
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
          <CalendarGridSkeleton />
        </View>
      </View>
    </Animated.View>
  );
}

interface CalendarGridSkeletonProps {
  color?: string;
}

export const CalendarGridSkeleton = ({
  color = COLORS_PALETTE.green,
}: CalendarGridSkeletonProps) => {
  const animatedValue = new Animated.Value(0);
  const randomValues = useMemo(
    () =>
      Array.from({ length: 364 }, () => ({
        minOpacity: Math.random() * 0.3,
        maxOpacity: Math.random() * 0.5,
      })),
    []
  );

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, []);

  const renderGrid = () => {
    return Array.from({ length: 364 }).map((_, index) => (
      <Animated.View
        key={index}
        style={[
          styles.contributionBox,
          {
            position: 'absolute',
            top: (index % 7) * 14,
            left: Math.floor(index / 7) * 14,
            backgroundColor: animatedValue.interpolate({
              inputRange: [0, 1],
              outputRange: [
                withOpacity(color, randomValues[index].minOpacity),
                withOpacity(color, randomValues[index].maxOpacity),
              ],
            }),
          },
        ]}
      />
    ));
  };

  return (
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
  );
};

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
    width: 10,
    height: 10,
    margin: 2,
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
