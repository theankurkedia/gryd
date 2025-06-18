import React, { useEffect } from 'react';
import { Modal, Pressable, StyleSheet, View, Dimensions } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const BOTTOM_SHEET_HEIGHT = SCREEN_HEIGHT * 0.45;

interface Props {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function BottomSheet({ visible, onClose, children }: Props) {
  const translateY = useSharedValue(BOTTOM_SHEET_HEIGHT);
  const backdropOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      backdropOpacity.value = withTiming(1, { duration: 300 });
      translateY.value = withSpring(0, {
        damping: 20,
        stiffness: 90,
      });
    } else {
      backdropOpacity.value = withTiming(0, { duration: 300 });
      translateY.value = withSpring(BOTTOM_SHEET_HEIGHT, {
        damping: 20,
        stiffness: 90,
      });
    }
  }, [visible]);

  const handleBackdropPress = () => {
    onClose();
  };

  const handleSheetPress = (e: any) => {
    e.stopPropagation();
  };

  const animatedBackdropStyle = useAnimatedStyle(() => {
    return {
      opacity: backdropOpacity.value,
    };
  });

  const animatedSheetStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
    >
      <GestureHandlerRootView style={styles.container}>
        <Animated.View style={[styles.backdrop, animatedBackdropStyle]}>
          <Pressable
            style={styles.backdropPressable}
            onPress={handleBackdropPress}
          >
            <Animated.View style={[styles.sheet, animatedSheetStyle]}>
              <Pressable style={styles.sheetContent} onPress={handleSheetPress}>
                <View style={styles.content}>{children}</View>
              </Pressable>
            </Animated.View>
          </Pressable>
        </Animated.View>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdropPressable: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    height: BOTTOM_SHEET_HEIGHT,
    backgroundColor: 'rgba(13, 17, 23, 0.95)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderBottomWidth: 0,
  },
  sheetContent: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
});
