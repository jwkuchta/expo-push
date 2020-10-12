import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Button, Alert, Platform } from 'react-native';
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

  const [ token, setToken ] = useState(null)

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
            {text: 'ok', onPress: () => console.log('pressed', Platform.OS)}
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
    .then(data => {
      setToken(data.data)
      console.log('token - ', Platform.OS, token)
    })
    .catch(error => {
      console.log(error)
      return null
    })
  }, [])

  useEffect(() => {
    // responds on tap
    const backgroundSub = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('response - ', Platform.OS)
      console.log(response)
    })
    // allows us to define fundctionn when an incoming notification is received while the app is running
    const foregroundSub = Notifications.addNotificationReceivedListener(notification => {
      console.log('notification - ', Platform.OS)
      console.log(notification)
    })

    return () => {
      foregroundSub.remove()
      backgroundSub.remove()
    }
  }, [])

  const triggerNotificationHandler = () => {
    // Notifications.scheduleNotificationAsync({
    //   content: {
    //     title: 'first!',
    //     body: 'you have been notified'
    //   },
    //   trigger: {
    //     seconds: 5
    //   }
    // })
    // send an HTTP request to another device via expo servers and
    fetch('https://exp.host/--/api/v2/push/send', {
      method: 'post',
      headers: {
        'accept': 'application/json',
        'accept-encoding': 'gzip, deflate',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        to: token,
        data: { extradata: 'some data' },
        title: 'sent via the app',
        body: 'this is sent programatically via expo server!'
      })
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

// look into expo push notification SDKs for Node and RoR
