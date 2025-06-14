import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { AlertTriangle } from 'lucide-react-native';

interface Props {
  habitName: string;
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteDialog({
  habitName,
  visible,
  onClose,
  onConfirm,
}: Props) {
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    if (visible) {
      opacity.value = withSpring(1, { damping: 20 });
      scale.value = withSpring(1, { damping: 20 });
    } else {
      opacity.value = withSpring(0, { damping: 20 });
      scale.value = withSpring(0.8, { damping: 20 });
    }
  }, [visible]);

  const rDialogStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [
        {
          scale: interpolate(scale.value, [0, 1], [0.8, 1], Extrapolate.CLAMP),
        },
      ],
    };
  });

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, rDialogStyle]}>
      <View style={styles.content}>
        <View style={styles.titleContainer}>
          <AlertTriangle size={24} color="#EF4444" strokeWidth={2.5} />
          <Text style={styles.title}>Delete Habit</Text>
        </View>
        <Text style={styles.message}>
          This action cannot be undone. Are you sure you want to delete{' '}
          <Text style={styles.bold}>{habitName}</Text>?
        </Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Text style={[styles.buttonText, styles.cancelButtonText]}>
              Cancel
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.deleteButton]}
            onPress={onConfirm}
            activeOpacity={0.7}
          >
            <Text style={[styles.buttonText, styles.deleteButtonText]}>
              Delete
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1100,
    backdropFilter: 'blur(4px)',
  },
  content: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 24,
    width: Math.min(width * 0.85, 400),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 12,
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '500',
  },
  message: {
    color: '#9CA3AF',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#374151',
    borderWidth: 1,
    borderColor: '#4B5563',
  },
  deleteButton: {
    backgroundColor: '#EF4444',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButtonText: {
    color: '#E5E7EB',
  },
  deleteButtonText: {
    color: '#fff',
  },
  bold: {
    fontWeight: 'bold',
  },
});
