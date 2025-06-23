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
  title: string;
  message: string;
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
  type?: 'warning' | 'danger' | 'info';
}

const getDialogStyle = (type: 'warning' | 'danger' | 'info' = 'warning') => {
  switch (type) {
    case 'danger':
      return {
        iconColor: '#EF4444',
        buttonStyle: 'dangerButton',
      };
    case 'warning':
      return {
        iconColor: '#F59E0B',
        buttonStyle: 'warningButton',
      };
    case 'info':
      return {
        iconColor: '#3B82F6',
        buttonStyle: 'infoButton',
      };
  }
};

export function ConfirmDialog({
  title,
  message,
  visible,
  onClose,
  onConfirm,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'warning',
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

  const style = getDialogStyle(type);

  return (
    <Animated.View style={[styles.container, rDialogStyle]}>
      <View style={styles.content}>
        <View style={styles.titleContainer}>
          <AlertTriangle size={24} color={style.iconColor} strokeWidth={2.5} />
          <Text style={styles.title}>{title}</Text>
        </View>
        <Text style={styles.message}>{message}</Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Text style={[styles.buttonText, styles.cancelButtonText]}>
              {cancelText}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.button,
              styles[style.buttonStyle as keyof typeof styles] as any,
            ]}
            onPress={onConfirm}
            activeOpacity={0.7}
          >
            <Text style={[styles.buttonText, styles.confirmButtonText]}>
              {confirmText}
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
  warningButton: {
    backgroundColor: '#F59E0B',
  },
  dangerButton: {
    backgroundColor: '#EF4444',
  },
  infoButton: {
    backgroundColor: '#3B82F6',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButtonText: {
    color: '#E5E7EB',
  },
  confirmButtonText: {
    color: '#fff',
  },
});
