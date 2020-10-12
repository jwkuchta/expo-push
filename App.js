import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View, Button, Alert } from 'react-native';
import * as Notifications from 'expo-notifications'
import * as Permissions from 'expo-permissions'

// define how incoming notofications are handled if the app is running
// this will let the system know what to do with an incoming notification
Notifications.setNotificationHandler({
  handleNotification: async () => {
    return {
      shouldShowAlert: true
    }
  }
})

export default function App() {

  useEffect(() => {
    // this will do nothing on Android
    Permissions.getAsync(Permissions.NOTIFICATIONS).then(statusObj => {
      if (statusObj.status !== 'granted') {
        return Permissions.askAsync(Permissions.NOTIFICATIONS)
      } else {
        return statusObj
      }
    }).then(statusObj => {
      if (statusObj.status !== 'granted') {
        Alert.alert(
          'notifications denied', 
          'we will not be able to send you notifications', 
          [
            {text: 'ok', onPress: () => console.log('pressed')}
          ]
        )
      }
    })
  }, [])

  const triggerNotificationHandler = () => {
    Notifications.scheduleNotificationAsync({
      content: {
        title: 'first!',
        body: 'you have been notified'
      },
      trigger: {
        seconds: 5
      }
    })
  }

  return (
    <View style={styles.container}>
      <Button title='trigger notification' onPress={triggerNotificationHandler} />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
