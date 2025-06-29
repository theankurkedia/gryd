import { COLORS_PALETTE, getContributionColor } from '@/constants/colors';
import { Minus, Plus } from 'lucide-react-native';
import React from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface FrequencySelectorProps {
  value: number;
  onChange: (value: number) => void;
  color?: string;
}

const MAX_PROGRESS_SQUARES = 6;

export const FrequencySelector: React.FC<FrequencySelectorProps> = ({
  color = COLORS_PALETTE.cyan,
  value,
  onChange,
}) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const animatePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePress = (newValue: number) => {
    animatePress();
    onChange(newValue);
  };

  const progressSquaresToShow = Math.min(value + 1, MAX_PROGRESS_SQUARES);
  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <Text style={styles.subtitle}>Daily frequency</Text>
        <View style={styles.progressRow}>
          {[...Array(progressSquaresToShow)].map((_, i) => (
            <View
              key={i}
              style={[
                styles.progressSquare,
                {
                  backgroundColor: getContributionColor(
                    color || COLORS_PALETTE.cyan,
                    i,
                    progressSquaresToShow
                  ),
                },
              ]}
            />
          ))}
        </View>
      </View>
      <View style={styles.row}>
        <Animated.View
          style={[styles.valueBox, { transform: [{ scale: scaleAnim }] }]}
        >
          <Text style={styles.valueText}>{value}</Text>
          <Text style={styles.unitText}>/ day</Text>
        </Animated.View>
        <TouchableOpacity
          style={[styles.button]}
          onPress={() => handlePress(Math.max(1, value - 1))}
          disabled={value <= 1}
          activeOpacity={0.7}
        >
          <Minus color="#fff" size={20} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button]}
          onPress={() => handlePress(value + 1)}
          activeOpacity={0.7}
        >
          <Plus color="#fff" size={20} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginTop: 12,
    gap: 8,
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  titleRow: {
    display: 'flex',
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  subtitle: {
    color: '#fff',
    fontSize: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    display: 'flex',
    flex: 1,
    width: '60%',
    minWidth: 284,
  },
  valueBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#23232b',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    minWidth: 56,
    flex: 3,
    justifyContent: 'center',
  },
  valueText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginRight: 4,
  },
  unitText: {
    color: '#fff',
    fontSize: 14,
  },
  button: {
    backgroundColor: '#23232b',
    borderRadius: 6,
    padding: 8,
    flex: 1,
    marginHorizontal: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  progressSquare: {
    width: 8,
    height: 8,
    borderRadius: 2,
    backgroundColor: '#23232b',
  },
});
