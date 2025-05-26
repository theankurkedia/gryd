import { icons, Trash, X } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Platform,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useHabitsStore } from '../store';
import { DataSource, Habit } from '../types';
import { DeleteDialog } from './DeleteDialog';
import { COLORS_PALETTE } from '../constants/colors';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import {
  cancelScheduledNotification,
  setHabitReminder,
} from '../utils/notifications';
import { Picker } from '@react-native-picker/picker';
import { FrequencySelector } from './FrequencySelector';

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

const formatTime = (hours: number, minutes: number): string => {
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

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
  }, [props.habit]);

  useEffect(() => {
    requestAnimationFrame(() => {
      translateY.value = withSpring(props.visible ? 0 : SCREEN_HEIGHT, {
        damping: 50,
        stiffness: 100,
      });
    });
  }, [props.visible]);

  const rBottomSheetStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  const handleAddHabit = async () => {
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
  };

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

  const visibleIcons = getVisibleIcons(iconSearch, props.habit?.icon);

  const handleTimeChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date
  ) => {
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
  };

  const renderColorGrid = () => (
    <View style={styles.colorContainer}>
      {Object.values(COLORS_PALETTE).map(color => (
        <TouchableOpacity
          key={color}
          style={[
            styles.colorButton,
            { backgroundColor: color },
            (selectedHabit?.color
              ? selectedHabit.color === color
              : COLORS_PALETTE[0] === color) && styles.selectedColorButton,
          ]}
          onPress={() =>
            setSelectedHabit(prev => ({ ...(prev ?? {}), color }) as Habit)
          }
        />
      ))}
    </View>
  );

  if (!isMounted) return null;

  return (
    <>
      <Animated.View
        style={[
          styles.bottomSheetContainer,
          rBottomSheetStyle,
          { transform: [{ translateY: props.visible ? 0 : SCREEN_HEIGHT }] },
        ]}
      >
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
        <ScrollView>
          <TextInput
            style={styles.input}
            placeholder="Habit Name"
            placeholderTextColor="#6B7280"
            value={selectedHabit?.name ?? ''}
            onChangeText={text =>
              setSelectedHabit(
                prev => ({ ...(prev ?? {}), name: text }) as Habit
              )
            }
            underlineColorAndroid="transparent"
          />
          <View>
            <Text style={styles.subtitle}>Description</Text>
            <TextInput
              style={styles.input}
              placeholderTextColor="#6B7280"
              value={selectedHabit?.description}
              onChangeText={text =>
                setSelectedHabit(
                  prev => ({ ...(prev ?? {}), description: text }) as Habit
                )
              }
            />
          </View>
          <View>
            <Text style={styles.subtitle}>Data Source</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedHabit?.dataSource ?? DataSource.Manual}
                onValueChange={(value: DataSource) =>
                  setSelectedHabit(
                    prev => ({ ...(prev ?? {}), dataSource: value }) as Habit
                  )
                }
                style={styles.picker}
                dropdownIconColor="#fff"
              >
                <Picker.Item label="Manual" value={DataSource.Manual} />
                <Picker.Item label="GitHub" value={DataSource.GitHub} />
                <Picker.Item label="GitLab" value={DataSource.GitLab} />
              </Picker>
            </View>
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
                  onChangeText={text =>
                    setSelectedHabit(
                      prev =>
                        ({
                          ...(prev ?? {}),
                          dataSourceIdentifier: text,
                        }) as Habit
                    )
                  }
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
          >
            <View style={styles.iconContainer}>
              {visibleIcons.map(([name, Icon]) => (
                <TouchableOpacity
                  key={name}
                  style={[
                    styles.iconButton,
                    selectedHabit?.icon === name && styles.selectedIconButton,
                  ]}
                  onPress={() =>
                    setSelectedHabit(
                      prev => ({ ...(prev ?? {}), icon: name }) as Habit
                    )
                  }
                >
                  <Icon
                    color={selectedHabit?.icon === name ? '#fff' : '#6B7280'}
                    size={24}
                  />
                </TouchableOpacity>
              ))}
            </View>
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
            <View style={styles.colorGrid}>{renderColorGrid()}</View>
          </View>
          {(!selectedHabit?.dataSource ||
            selectedHabit?.dataSource === DataSource.Manual) && (
            <FrequencySelector
              value={selectedHabit?.frequency || 1}
              onChange={freq =>
                setSelectedHabit(
                  prev => ({ ...(prev ?? {}), frequency: freq }) as Habit
                )
              }
              max={5}
              editable={true}
              onEditPress={() => {}}
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
    zIndex: 1000,
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
    fontSize: 16,
  },
  placeholderText: {
    color: '#6B7280',
  },
  pickerContainer: {
    backgroundColor: '#374151',
    borderRadius: 4,
    marginHorizontal: 20,
    marginBottom: 8,
    overflow: 'hidden',
  },
  picker: {
    color: '#fff',
    height: 40,
    backgroundColor: '#374151',
    padding: 12,
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
});
