import React from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { Calendar } from './Calendar';
import { Habit } from '@/types';

interface Props {
  visible: boolean;
  onClose: () => void;
  habit: Habit;
}

export function CalendarModal({ visible, onClose, habit }: Props) {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <BlurView intensity={20} style={styles.blurContainer}>
          <View style={styles.content}>
            <Calendar habit={habit} onClick={onClose} />
          </View>
        </BlurView>
      </Pressable>
    </Modal>
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
    overflow: 'hidden',
    backgroundColor: 'rgba(13, 17, 23, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
});
