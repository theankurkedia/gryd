import { COLORS_PALETTE, getContributionColor } from '@/constants/colors';
import { useHabitsStore } from '@/store';
import { DataSource, Habit } from '@/types';
import { formatDate } from '@/utils/date';
import { cancelScheduledNotification } from '@/utils/notifications';
import { BlurView } from 'expo-blur';
import { router, usePathname } from 'expo-router';
import { Circle, CircleCheckBig, Pencil, Trash } from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
import {
  GestureResponderEvent,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { BottomSheet } from './BottomSheet';
import { CalendarWrapper } from './CalendarWrapper';
import { DeleteDialog } from './DeleteDialog';
import { Heatmap } from './Heatmap';

interface Props {
  visible: boolean;
  onClose: () => void;
  habit: Habit;
}

export function HeatmapInModal({ visible, onClose, habit }: Props) {
  const pathname = usePathname();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { deleteHabit, updateHabitCompletion, getHabitCompletions } =
    useHabitsStore();
  const isEditScreenOpen = pathname === '/add-edit-habit';

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
  }, [habit.id, deleteHabit, onClose]);

  const handleEdit = (e: GestureResponderEvent) => {
    e.stopPropagation();
    router.push({
      pathname: '/add-edit-habit',
      params: { habitId: habit.id },
    });
  };
  const handleTodayButtonPress = useCallback(
    (e: GestureResponderEvent) => {
      e.stopPropagation();
      updateHabitCompletion(todayFormatted, habit.id);
    },
    [updateHabitCompletion, todayFormatted, habit.id]
  );

  const isTodayDone = todaysCompletions >= (habit?.frequency ?? 1);

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
            <BottomSheet visible onClose={onClose}>
              <Heatmap habit={habit} />
              <View style={styles.editButtonContainer}>
                {(!habit.dataSource ||
                  habit.dataSource === DataSource.Manual) && (
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
                )}
                <View style={styles.moreActionButtons}>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={handleEdit}
                  >
                    <Pencil color="#fff" size={16} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={handleDelete}
                  >
                    <Trash color="#fff" size={16} />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.divider} />
              <CalendarWrapper habit={habit} />
            </BottomSheet>
          </BlurView>
        </Pressable>
      </Modal>

      {showDeleteDialog && (
        <DeleteDialog
          habitName={habit.name}
          visible={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
          onConfirm={handleConfirmDelete}
        />
      )}
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
    flexDirection: 'row',
    width: '100%',
    gap: 16,
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  editButton: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  divider: {
    height: 1,
    marginHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  moreActionButtons: {
    display: 'flex',
    flexDirection: 'row',
    marginLeft: 'auto',
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
