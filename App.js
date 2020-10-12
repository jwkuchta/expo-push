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
    // this will do nothing on Android but is necessary to enable local and push notifications on iOS
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
        return 
      }
    })
    // after we get permissions we need to sign our app up with google/iOS notification servers
    // we need to get a push token 
    .then(() => {
      return Notifications.getExpoPushTokenAsync()
    })
    .then(data => console.log(data))
  }, [])

  useEffect(() => {
    // responds on tap
    const backgroundSub = Notifications.addNotificationResponseReceivedListener(response => {
      console.log(response)
    })
    // allows us to define fundctionn when an incoming notification is received while the app is running
    const foregroundSub = Notifications.addNotificationReceivedListener(notification => {
      console.log(notification)
    })

    return () => {
      foregroundSub.remove()
      backgroundSub.remove()
    }
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
