import { formatTime } from '@/utils/date';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { icons, Trash, X } from 'lucide-react-native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { COLORS_PALETTE } from '../constants/colors';
import { useHabitsStore } from '../store';
import { DataSource, Habit } from '../types';
import {
  cancelScheduledNotification,
  setHabitReminder,
} from '../utils/notifications';
import { DeleteDialog } from './DeleteDialog';
import { FrequencySelector } from './FrequencySelector';
import { Picker } from './Picker';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const PADDING_HORIZONTAL = 20;
const ICON_MARGIN = 4;
const COLUMNS = 8; // We want 4 icons per row
const AVAILABLE_WIDTH = SCREEN_WIDTH - PADDING_HORIZONTAL * 2;
const ICON_SIZE = (AVAILABLE_WIDTH - ICON_MARGIN * 2 * COLUMNS) / COLUMNS;

interface Props {
  visible: boolean;
  onClose: () => void;
  habit?: Habit;
}

const getVisibleIcons = (iconSearch: string, selectedIcon?: string) => {
  const allIcons = Object.entries(icons);
  const selectedIconEntry = selectedIcon
    ? [allIcons.find(([name]) => name === selectedIcon)!]
    : [];
  return [
    ...selectedIconEntry,
    ...allIcons
      .filter(
        ([name]) =>
          name !== selectedIcon &&
          name.toLowerCase().includes(iconSearch?.toLowerCase() || '')
      )
      .slice(0, 31),
  ];
};

// Memoized icon button component to prevent unnecessary re-renders
const IconButton = React.memo(
  ({
    name,
    Icon,
    isSelected,
    onPress,
  }: {
    name: string;
    Icon: any;
    isSelected: boolean;
    onPress: (name: string) => void;
  }) => (
    <TouchableOpacity
      style={[styles.iconButton, isSelected && styles.selectedIconButton]}
      onPress={() => onPress(name)}
    >
      <Icon color={isSelected ? '#fff' : '#6B7280'} size={24} />
    </TouchableOpacity>
  )
);

// Memoized color button component
const ColorButton = React.memo(
  ({
    color,
    isSelected,
    onPress,
  }: {
    color: string;
    isSelected: boolean;
    onPress: (color: string) => void;
  }) => (
    <TouchableOpacity
      style={[
        styles.colorButton,
        { backgroundColor: color },
        isSelected && styles.selectedColorButton,
      ]}
      onPress={() => onPress(color)}
    />
  )
);

export function AddEditDialog(props: Props) {
  const [selectedHabit, setSelectedHabit] = useState<Habit | undefined>(
    props.habit
  );
  const [iconSearch, setIconSearch] = useState('');
  const { addHabit, editHabit: editHabitStore, deleteHabit } = useHabitsStore();
  const translateY = useSharedValue(props.visible ? 0 : SCREEN_HEIGHT);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showDataSourceDropdown, setShowDataSourceDropdown] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  useEffect(() => {
    if (props.habit) {
      setSelectedHabit(props.habit);
    } else {
      setSelectedHabit(undefined);
    }
    setIconSearch('');
    setShowDataSourceDropdown(false);
  }, [props.habit]);

  useEffect(() => {
    if (props.visible) {
      translateY.value = withSpring(0, {
        damping: 20,
        stiffness: 90,
        mass: 0.8,
      });
    } else {
      translateY.value = withSpring(
        SCREEN_HEIGHT,
        {
          damping: 20,
          stiffness: 90,
          mass: 0.8,
        },
        () => {
          runOnJS(setShowDataSourceDropdown)(false);
        }
      );
    }
  }, [props.visible]);

  const rBottomSheetStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  }, []);

  const handleAddHabit = useCallback(async () => {
    if (!selectedHabit?.name) return;

    if (props.habit) {
      editHabitStore(selectedHabit);
    } else {
      addHabit(selectedHabit);
    }

    if (selectedHabit.dailyReminderTime) {
      const [hours, minutes] = selectedHabit.dailyReminderTime
        .split(':')
        .map(Number);
      // Cancel existing notification if editing
      if (props.habit?.id) {
        await cancelScheduledNotification(props.habit.id);
      }

      // Schedule new notification
      await setHabitReminder({ habitName: selectedHabit.name, hours, minutes });
    }
    setSelectedHabit(undefined);
    props.onClose();
  }, [selectedHabit, props.habit, editHabitStore, addHabit, props.onClose]);

  const handleDelete = useCallback(() => {
    setShowDeleteDialog(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (props.habit?.id) {
      await cancelScheduledNotification(props.habit.id);
      deleteHabit(props.habit.id);
      setShowDeleteDialog(false);
      props.onClose();
    }
  }, [props.habit?.id, deleteHabit, props.onClose]);

  // Memoize visible icons to prevent recalculation on every render
  const visibleIcons = useMemo(
    () => getVisibleIcons(iconSearch, props.habit?.icon),
    [iconSearch, props.habit?.icon]
  );

  const handleTimeChange = useCallback(
    (event: DateTimePickerEvent, selectedDate?: Date) => {
      setShowTimePicker(false);
      if (event.type === 'set' && selectedDate) {
        const hours = selectedDate.getHours();
        const minutes = selectedDate.getMinutes();
        setSelectedHabit(
          prev =>
            ({
              ...(prev ?? {}),
              dailyReminderTime: formatTime(hours, minutes),
            }) as Habit
        );
      }
    },
    []
  );

  const handleIconPress = useCallback((iconName: string) => {
    setSelectedHabit(prev => ({ ...(prev ?? {}), icon: iconName }) as Habit);
  }, []);

  const handleColorPress = useCallback((color: string) => {
    setSelectedHabit(prev => ({ ...(prev ?? {}), color }) as Habit);
  }, []);

  const handleNameChange = useCallback((text: string) => {
    setSelectedHabit(prev => ({ ...(prev ?? {}), name: text }) as Habit);
  }, []);

  const handleDescriptionChange = useCallback((text: string) => {
    setSelectedHabit(prev => ({ ...(prev ?? {}), description: text }) as Habit);
  }, []);

  const handleDataSourceChange = useCallback((value: string) => {
    setSelectedHabit(
      prev =>
        ({
          ...(prev ?? {}),
          dataSource: value as DataSource,
        }) as Habit
    );
  }, []);

  const handleDataSourceIdentifierChange = useCallback((text: string) => {
    setSelectedHabit(
      prev =>
        ({
          ...(prev ?? {}),
          dataSourceIdentifier: text,
        }) as Habit
    );
  }, []);

  const handleFrequencyChange = useCallback((freq: number) => {
    setSelectedHabit(prev => ({ ...(prev ?? {}), frequency: freq }) as Habit);
  }, []);

  // Memoize color grid to prevent unnecessary re-renders
  const renderColorGrid = useMemo(
    () => (
      <View style={styles.colorContainer}>
        {Object.values(COLORS_PALETTE).map(color => (
          <ColorButton
            key={color}
            color={color}
            isSelected={
              selectedHabit?.color
                ? selectedHabit.color === color
                : COLORS_PALETTE[0] === color
            }
            onPress={handleColorPress}
          />
        ))}
      </View>
    ),
    [selectedHabit?.color, handleColorPress]
  );

  // Memoize icon grid to prevent unnecessary re-renders
  const renderIconGrid = useMemo(
    () => (
      <View style={styles.iconContainer}>
        {visibleIcons.map(([name, Icon]) => (
          <IconButton
            key={name}
            name={name}
            Icon={Icon}
            isSelected={selectedHabit?.icon === name}
            onPress={handleIconPress}
          />
        ))}
      </View>
    ),
    [visibleIcons, selectedHabit?.icon, handleIconPress]
  );

  if (!isMounted) return null;

  return (
    <>
      <Animated.View style={[styles.bottomSheetContainer, rBottomSheetStyle]}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={props.onClose}>
            <X color="#fff" size={24} />
          </TouchableOpacity>
          <Text style={styles.title}>
            {props.habit?.id ? 'Edit Habit' : 'Add New Habit'}
          </Text>
          {props.habit?.id && (
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDelete}
            >
              <Trash color="#fff" size={20} />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[
              styles.headerButton,
              { opacity: selectedHabit?.name ? 1 : 0.5 },
            ]}
            onPress={handleAddHabit}
            disabled={!selectedHabit?.name}
          >
            <Text style={styles.headerButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          removeClippedSubviews={Platform.OS === 'android'}
        >
          <TextInput
            style={styles.input}
            placeholder="Habit Name"
            placeholderTextColor="#6B7280"
            value={selectedHabit?.name ?? ''}
            onChangeText={handleNameChange}
            underlineColorAndroid="transparent"
          />
          <View>
            <Text style={styles.subtitle}>Description</Text>
            <TextInput
              style={styles.input}
              placeholderTextColor="#6B7280"
              value={selectedHabit?.description}
              onChangeText={handleDescriptionChange}
            />
          </View>
          <View>
            <Text style={styles.subtitle}>Data Source</Text>
            <Picker
              selectedHabit={selectedHabit}
              onValueChange={handleDataSourceChange}
            />
          </View>
          {selectedHabit?.dataSource &&
            selectedHabit?.dataSource !== DataSource.Manual && (
              <View>
                <Text style={styles.subtitle}>Username</Text>
                <TextInput
                  style={styles.input}
                  placeholder={`Enter ${selectedHabit?.dataSource} username`}
                  placeholderTextColor="#6B7280"
                  value={selectedHabit?.dataSourceIdentifier}
                  onChangeText={handleDataSourceIdentifierChange}
                />
              </View>
            )}
          <View>
            <Text style={styles.subtitle}>Select an icon</Text>
            <TextInput
              style={styles.input}
              placeholder="Search icons..."
              placeholderTextColor="#6B7280"
              value={iconSearch}
              onChangeText={setIconSearch}
            />
          </View>
          <ScrollView
            style={styles.iconGrid}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            removeClippedSubviews={Platform.OS === 'android'}
            nestedScrollEnabled={true}
          >
            {renderIconGrid}
          </ScrollView>
          {Platform.OS === 'android' && (
            <View>
              <Text style={styles.subtitle}>Daily Reminder Time</Text>
              <TouchableOpacity
                onPress={() => setShowTimePicker(true)}
                style={styles.input}
              >
                <Text
                  style={[
                    styles.timeText,
                    !selectedHabit?.dailyReminderTime && styles.placeholderText,
                  ]}
                >
                  {selectedHabit?.dailyReminderTime
                    ? selectedHabit.dailyReminderTime
                    : 'Select time'}
                </Text>
              </TouchableOpacity>
              {showTimePicker && (
                <DateTimePicker
                  value={
                    selectedHabit?.dailyReminderTime
                      ? new Date(selectedHabit.dailyReminderTime)
                      : new Date()
                  }
                  mode="time"
                  is24Hour={true}
                  display={'default'}
                  onChange={handleTimeChange}
                />
              )}
            </View>
          )}
          <View>
            <Text style={styles.subtitle}>Select a color</Text>
            <View style={styles.colorGrid}>{renderColorGrid}</View>
          </View>
          {(!selectedHabit?.dataSource ||
            selectedHabit?.dataSource === DataSource.Manual) && (
            <FrequencySelector
              value={selectedHabit?.frequency || 1}
              onChange={handleFrequencyChange}
              max={5}
              editable={true}
              color={selectedHabit?.color || COLORS_PALETTE.cyan}
            />
          )}
        </ScrollView>
      </Animated.View>
      <DeleteDialog
        visible={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}

const styles = StyleSheet.create({
  bottomSheetContainer: {
    height: SCREEN_HEIGHT,
    width: '100%',
    backgroundColor: '#1F2937',
    position: 'absolute',
    top: 0,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    zIndex: 900,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginVertical: 16,
  },
  closeButton: {
    padding: 4,
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    marginLeft: 12,
  },
  headerButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginLeft: 8,
  },
  headerButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  subtitle: {
    color: '#fff',
    fontSize: 14,
    marginTop: 8,
    marginBottom: 4,
    paddingHorizontal: 20,
  },
  input: {
    backgroundColor: '#374151',
    color: '#fff',
    borderRadius: 4,
    padding: 12,
    marginBottom: 8,
    marginHorizontal: 20,
    textAlignVertical: 'center',
    ...Platform.select({
      web: {
        outlineStyle: 'none',
        outlineWidth: 0,
        outline: 'none',
        borderWidth: 0,
      },
    }),
  },
  iconGrid: {
    flex: 1,
    paddingHorizontal: PADDING_HORIZONTAL,
    marginBottom: 4,
  },
  iconContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  iconButton: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    margin: ICON_MARGIN,
  },
  selectedIconButton: {
    backgroundColor: '#3B82F6',
  },
  scrollContent: {
    paddingBottom: 8,
  },
  deleteButton: {
    padding: 4,
    marginLeft: 'auto',
  },
  colorGrid: {
    paddingHorizontal: PADDING_HORIZONTAL,
    marginBottom: 4,
  },
  colorContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginTop: 8,
  },
  colorButton: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    borderRadius: '100%',
    margin: ICON_MARGIN,
    borderWidth: 2,
    borderColor: '#374151',
  },
  selectedColorButton: {
    borderColor: '#fff',
  },
  timeText: {
    color: '#fff',
    fontSize: 14,
  },
  placeholderText: {
    color: '#6B7280',
  },
  pickerContainer: {
    backgroundColor: '#374151',
    borderRadius: 4,
    marginHorizontal: 20,
    marginBottom: 8,
    position: 'relative',
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
  pickerText: {
    color: '#fff',
    fontSize: 14,
  },
  overlayDropdown: {
    position: 'absolute',
    backgroundColor: '#374151',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#4B5563',
    zIndex: 1001,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  dropdownItem: {
    padding: 12,
  },
  selectedDropdownItem: {
    backgroundColor: '#3B82F6',
  },
  selectedDropdownItemText: {
    fontWeight: 'bold',
  },
});
