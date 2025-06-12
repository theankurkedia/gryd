import { useHabitsStore } from '@/store';
import {
  DndProvider,
  Draggable,
  DraggableStack,
  DraggableStackProps,
} from '@mgcrea/react-native-dnd';
import { router } from 'expo-router';
import { X } from 'lucide-react-native';
import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
export default function ReorderHabitsScreen() {
  const habits = useHabitsStore(state => state.habits);
  const editHabits = useHabitsStore(state => state.editHabits);

  const onStackOrderChange: DraggableStackProps['onOrderChange'] =
    newHabitsOrder => {
      const updatedHabits = habits.map(habit => ({
        ...habit,
        order: newHabitsOrder?.findIndex(h => h === habit.id),
      }));
      editHabits(updatedHabits);
    };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => router.back()}
        >
          <X color="#fff" size={24} />
        </TouchableOpacity>
        <Text style={styles.title}>Reorder habits</Text>
      </View>
      <ScrollView>
        <GestureHandlerRootView>
          <DndProvider>
            <DraggableStack
              direction="column"
              gap={10}
              onOrderChange={onStackOrderChange}
            >
              {habits.map(habit => (
                <Draggable key={habit.id} id={habit.id}>
                  <View style={styles.box}>
                    <Text>{habit.name}</Text>
                  </View>
                </Draggable>
              ))}
            </DraggableStack>
          </DndProvider>
        </GestureHandlerRootView>
      </ScrollView>
    </SafeAreaView>
  );
}

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
    flex: 1,
    marginLeft: 12,
  },
  box: {
    margin: 24,
    padding: 24,
    height: 128,
    width: 128,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'darkseagreen',
  },
});
