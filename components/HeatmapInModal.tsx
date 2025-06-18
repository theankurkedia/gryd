import React, { useCallback, useState, useRef, useEffect } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  GestureResponderEvent,
  Dimensions,
  Animated,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Heatmap } from './Heatmap';
import { Habit } from '@/types';
import { router, usePathname } from 'expo-router';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Circle,
  CircleCheckBig,
  Pencil,
  Trash,
} from 'lucide-react-native';
import { DeleteDialog } from './DeleteDialog';
import { BottomSheet } from './BottomSheet';
import { useHabitsStore } from '@/store';
import { cancelScheduledNotification } from '@/utils/notifications';
import { formatDate } from '@/utils/date';
import { COLORS_PALETTE, getContributionColor } from '@/constants/colors';
import { Calendar } from 'react-native-calendars';
import { MarkedDates } from 'react-native-calendars/src/types';

interface Props {
  visible: boolean;
  onClose: () => void;
  habit: Habit;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const CONTENT_HEIGHT_ADJUSTMENT = SCREEN_HEIGHT * 0.3;

export function HeatmapInModal({ visible, onClose, habit }: Props) {
  const pathname = usePathname();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showCalendarSheet, setShowCalendarSheet] = useState(false);
  const { deleteHabit, updateHabitCompletion, getHabitCompletions } =
    useHabitsStore();
  const isEditScreenOpen = pathname === '/add-edit-habit';

  // Animated value for marginBottom
  const marginBottomAnim = useRef(new Animated.Value(0)).current;

  const habitCompletions = getHabitCompletions(habit.id);
  const todayFormatted = formatDate(new Date());
  const todaysCompletions = habitCompletions?.[todayFormatted] ?? 0;

  const handleDelete = useCallback(() => {
    setShowDeleteDialog(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (habit?.id) {
      await cancelScheduledNotification(habit.id);
      deleteHabit(habit.id);
      setShowDeleteDialog(false);
      onClose();
    }
  }, [habit?.id, deleteHabit]);

  const handleEdit = (e: GestureResponderEvent) => {
    e.stopPropagation();
    router.push({
      pathname: '/add-edit-habit',
      params: { habitId: habit.id },
    });
  };
  const handleTodayButtonPress = useCallback(
    (e: any) => {
      e.stopPropagation();
      updateHabitCompletion(todayFormatted, habit.id);
    },
    [updateHabitCompletion, habit.id]
  );

  const isTodayDone = todaysCompletions >= (habit?.frequency ?? 1);

  // Animate marginBottom when calendar sheet opens/closes
  useEffect(() => {
    Animated.timing(marginBottomAnim, {
      toValue: showCalendarSheet ? CONTENT_HEIGHT_ADJUSTMENT : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [showCalendarSheet, marginBottomAnim]);

  const openCalendar = useCallback(() => {
    setShowCalendarSheet(true);
  }, []);

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
    <>
      <Modal
        visible={isEditScreenOpen ? false : visible}
        transparent={true}
        animationType="fade"
        onRequestClose={onClose}
      >
        <Pressable style={styles.backdrop} onPress={onClose}>
          <BlurView intensity={30} style={styles.blurContainer}>
            {!showDeleteDialog ? (
              <Animated.View
                style={[
                  styles.content,
                  {
                    marginBottom: marginBottomAnim,
                  },
                ]}
              >
                <Heatmap habit={habit} />
                <View style={styles.editButtonContainer}>
                  <TouchableOpacity
                    style={[
                      styles.editButton,
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
                    {isTodayDone ? (
                      <>
                        <Circle color="#fff" size={20} />
                        <Text style={styles.editButtonText}>
                          Mark as undone
                        </Text>
                      </>
                    ) : (
                      <>
                        <CircleCheckBig color="#fff" size={20} />
                        <Text style={styles.editButtonText}>
                          {!habit?.frequency || habit?.frequency === 1
                            ? 'Mark as done'
                            : `Mark as done (${todaysCompletions} / ${habit?.frequency}) `}
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                  <View style={styles.moreActionButtons}>
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={openCalendar}
                    >
                      <CalendarDays color="#fff" size={20} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={handleEdit}
                    >
                      <Pencil color="#fff" size={20} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={handleDelete}
                    >
                      <Trash color="#fff" size={20} />
                    </TouchableOpacity>
                  </View>
                </View>
              </Animated.View>
            ) : (
              <DeleteDialog
                habitName={habit.name}
                visible={showDeleteDialog}
                onClose={() => setShowDeleteDialog(false)}
                onConfirm={handleConfirmDelete}
              />
            )}
          </BlurView>
        </Pressable>
      </Modal>

      <BottomSheet
        visible={showCalendarSheet}
        onClose={() => setShowCalendarSheet(false)}
      >
        <View style={styles.calendarSheetContent}>
          <Calendar
            maxDate={todayFormatted}
            onDayPress={day => {
              console.log('** selected day', day);
            }}
            markedDates={markedDates}
            theme={{
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
                  marginTop: 6,
                  marginBottom: 12,
                },
              },
            }}
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
            dayComponent={({ date, state }) => {
              const count = habitCompletions[date.dateString] || 0;
              const showCustomCount = count > 5;

              if (!showCustomCount) {
                return (
                  <View style={{ alignItems: 'center' }}>
                    <Text
                      style={{
                        color: state === 'disabled' ? '#424242' : '#fff',
                      }}
                    >
                      {date.day}
                    </Text>
                    <View style={{ flexDirection: 'row', marginTop: 2 }}>
                      {[...Array(count)].map((_, idx) => (
                        <View
                          key={idx}
                          style={{
                            width: 4,
                            height: 4,
                            borderRadius: 2,
                            backgroundColor: habit.color,
                            marginHorizontal: 1,
                          }}
                        />
                      ))}
                    </View>
                  </View>
                );
              } else {
                return (
                  <View style={{ alignItems: 'center' }}>
                    <Text
                      style={{
                        color: state === 'disabled' ? '#424242' : '#fff',
                      }}
                    >
                      {date.day}
                    </Text>
                    <View style={styles.customCount}>
                      <View
                        style={{
                          width: 4,
                          height: 4,
                          borderRadius: 2,
                          backgroundColor: habit.color,
                          marginHorizontal: 1,
                        }}
                      />
                      <Text style={styles.customCountText}>{count}</Text>
                    </View>
                  </View>
                );
              }
            }}
          />
        </View>
      </BottomSheet>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  blurContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '90%',
    maxWidth: 796,
    borderRadius: 12,
    overflow: 'visible',
    backgroundColor: 'rgba(13, 17, 23, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  editButtonContainer: {
    display: 'flex',
    width: '100%',
    gap: 8,
    flexDirection: 'row',
    position: 'absolute',
    justifyContent: 'space-between',
    bottom: -50,
  },
  editButton: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    gap: 4,
    borderRadius: 8,
  },
  moreActionButtons: {
    display: 'flex',
    flexDirection: 'row',
    gap: 8,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 14,
  },
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
});
