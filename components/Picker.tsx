import { DataSource, Habit } from '@/types';
import { ChevronDown } from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
  Pressable,
} from 'react-native';

interface PickerProps {
  selectedHabit: Habit | undefined;
  onValueChange: (value: string) => void;
}

const dataSourceOptions = [
  { label: 'Manual', value: DataSource.Manual },
  { label: 'GitHub', value: DataSource.GitHub },
  { label: 'GitLab', value: DataSource.GitLab },
];

const getDataSourceLabel = (value: DataSource): string => {
  return (
    dataSourceOptions.find(option => option.value === value)?.label || 'Manual'
  );
};

export function Picker({ selectedHabit, onValueChange }: PickerProps) {
  const [showDataSourceDropdown, setShowDataSourceDropdown] = useState(false);

  const handleDropdownToggle = () => {
    setShowDataSourceDropdown(!showDataSourceDropdown);
  };

  return (
    <>
      <View style={styles.pickerContainer}>
        <TouchableOpacity
          style={styles.pickerButton}
          onPress={handleDropdownToggle}
        >
          <Text style={styles.pickerText}>
            {getDataSourceLabel(selectedHabit?.dataSource ?? DataSource.Manual)}
          </Text>
          <ChevronDown color="#fff" size={20} />
        </TouchableOpacity>
      </View>

      <Modal
        visible={showDataSourceDropdown}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDataSourceDropdown(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setShowDataSourceDropdown(false)}
        >
          <View style={styles.modalContent}>
            {dataSourceOptions.map(option => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.dropdownItem,
                  (selectedHabit?.dataSource ?? DataSource.Manual) ===
                    option.value && styles.selectedDropdownItem,
                ]}
                onPress={() => {
                  onValueChange(option.value);
                  setShowDataSourceDropdown(false);
                }}
              >
                <Text
                  style={[
                    styles.dropdownItemText,
                    (selectedHabit?.dataSource ?? DataSource.Manual) ===
                      option.value && styles.selectedDropdownItemText,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
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
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
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
  dropdownItemText: {
    color: '#fff',
    fontSize: 14,
  },
  selectedDropdownItemText: {
    fontWeight: 'bold',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#374151',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#4B5563',
    minWidth: 200,
    maxWidth: 300,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});
