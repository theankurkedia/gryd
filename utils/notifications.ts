import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return null;
    }

    token = await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig?.extra?.eas?.projectId,
    });
  }

  return token;
}

interface ScheduleNotificationProps {
  title: string;
  body: string;
  trigger: any;
}

interface SetHabitReminderProps {
  habitName: string;
  hours: number;
  minutes: number;
}

export async function setHabitReminder(params: SetHabitReminderProps) {
  if (Platform.OS === 'android') {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Habit Reminder',
          body: `Time to complete your habit: ${params.habitName}`,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: params.hours,
          minute: params.minutes,
        },
      });
    } catch (error) {
      console.error('Failed to schedule notification:', error);
    }
  }
}

export async function cancelScheduledNotification(habitId: string) {
  if (Platform.OS === 'android') {
    await Notifications.cancelScheduledNotificationAsync(habitId);
  }
}
