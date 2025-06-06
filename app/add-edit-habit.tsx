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
  SafeAreaView,
} from 'react-native';
import { COLORS_PALETTE } from '../constants/colors';
import { useHabitsStore } from '../store';
import { DataSource, Habit } from '../types';
import {
  cancelScheduledNotification,
  registerForPushNotificationsAsync,
  setHabitReminder,
} from '../utils/notifications';
import { DeleteDialog } from '../components/DeleteDialog';
import { FrequencySelector } from '../components/FrequencySelector';
import { Picker } from '../components/Picker';
import { router, useLocalSearchParams } from 'expo-router';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PADDING_HORIZONTAL = 20;
const ICON_MARGIN = 4;
const COLUMNS = 8;
const AVAILABLE_WIDTH = SCREEN_WIDTH - PADDING_HORIZONTAL * 2;
const ICON_SIZE = (AVAILABLE_WIDTH - ICON_MARGIN * 2 * COLUMNS) / COLUMNS;

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

// Memoized icon button component
const IconButton = React.memo(
  ({
    name,
    Icon,
    isSelected,
    onPress,
  }: {
    name: string;
    Icon: React.ElementType;
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

IconButton.displayName = 'IconButton';
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

ColorButton.displayName = 'ColorButton';
export default function AddEditHabitScreen() {
  const params = useLocalSearchParams();
  const habitId = params.habitId as string;

  const {
    habits,
    addHabit,
    editHabit: editHabitStore,
    deleteHabit,
  } = useHabitsStore();
  const existingHabit = habitId
    ? habits.find(h => h.id === habitId)
    : undefined;

  const [selectedHabit, setSelectedHabit] = useState<Habit | undefined>(
    existingHabit
  );
  const [iconSearch, setIconSearch] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    if (existingHabit) {
      setSelectedHabit(existingHabit);
    } else {
      setSelectedHabit(undefined);
    }
    setIconSearch('');
  }, [existingHabit]);

  const handleAddHabit = useCallback(async () => {
    if (!selectedHabit?.name) return;

    if (
      selectedHabit.dailyReminderTime &&
      selectedHabit.dailyReminderTime !== existingHabit?.dailyReminderTime
    ) {
      // Cancel existing notification if editing
      const oldNotificationId =
        existingHabit?.dailyReminderNotificationIdentifier;
      if (oldNotificationId) {
        await cancelScheduledNotification(oldNotificationId);
      }

      const [hours, minutes] = selectedHabit.dailyReminderTime
        ?.split(':')
        .map(Number);

      // Schedule new notification
      selectedHabit.dailyReminderNotificationIdentifier =
        await setHabitReminder({
          habitName: selectedHabit.name,
          hours,
          minutes,
        });
    }
    if (existingHabit) {
      editHabitStore(selectedHabit);
    } else {
      addHabit(selectedHabit);
    }
    router.back();
  }, [selectedHabit, existingHabit, editHabitStore, addHabit]);

  const handleDelete = useCallback(() => {
    setShowDeleteDialog(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (existingHabit?.id) {
      await cancelScheduledNotification(existingHabit.id);
      deleteHabit(existingHabit.id);
      setShowDeleteDialog(false);
      router.back();
    }
  }, [existingHabit?.id, deleteHabit]);

  // Memoize visible icons to prevent recalculation on every render
  const visibleIcons = useMemo(
    () => getVisibleIcons(iconSearch, existingHabit?.icon),
    [iconSearch, existingHabit?.icon]
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

  return (
    <>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => router.back()}
          >
            <X color="#fff" size={24} />
          </TouchableOpacity>
          <Text style={styles.title}>
            {existingHabit?.id ? 'Edit Habit' : 'Add New Habit'}
          </Text>
          {existingHabit?.id && (
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
                onPress={() => {
                  if (Platform.OS === 'android') {
                    registerForPushNotificationsAsync();
                  }
                  setShowTimePicker(true);
                }}
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
                  display="default"
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
      </SafeAreaView>
      <DeleteDialog
        visible={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}

AddEditHabitScreen.displayName = 'AddEditHabitScreen';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1F2937',
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
});
