import React, { useCallback, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  View,
  TouchableOpacity,
  GestureResponderEvent,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Calendar } from './Calendar';
import { Habit } from '@/types';
import { router, usePathname } from 'expo-router';
import { Pencil, Trash } from 'lucide-react-native';
import { DeleteDialog } from './DeleteDialog';
import { useHabitsStore } from '@/store';
import { cancelScheduledNotification } from '@/utils/notifications';

interface Props {
  visible: boolean;
  onClose: () => void;
  habit: Habit;
}

export function CalendarModal({ visible, onClose, habit }: Props) {
  const pathname = usePathname();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { deleteHabit } = useHabitsStore();
  const isEditScreenOpen = pathname === '/add-edit-habit';

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
              <View style={styles.content}>
                <Calendar habit={habit} onClick={onClose} />
                <View style={styles.editButtonContainer}>
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
    gap: 8,
    flexDirection: 'row',
    position: 'absolute',
    bottom: -40,
    right: 20,
  },
  editButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
});
