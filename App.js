import React, {useEffect} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  Button,
  Alert,
  TouchableOpacity,
  PermissionsAndroid,
  Platform,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import messaging from '@react-native-firebase/messaging';
//import PushNotification from 'react-native-push-notification';
import notifee, {AndroidImportance, AndroidColor} from '@notifee/react-native';
import Home from '/screens/Home';
import QrScanner from '/screens/QrScanner';
import GeoLocation from '/screens/GeoLocation';

const navOptionHandler = () => ({
  headerShown: false
})
const Stack = createNativeStackNavigator();

messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('[Background Remote Message]', remoteMessage);
  //displayNotification(remoteMessage);
});

const displayNotification = async message => {

  const channelAnoucement = await notifee.createChannel({
    id: 'default',
    name: 'channel_A',
    importance: AndroidImportance.HIGH,
  });

  await notifee.displayNotification({
    title: message.notification.title,
    body: message.notification.body,
    android: {
      channelId: channelAnoucement,
      smallIcon: 'ic_launcher',
      sound : "default"
    },
  });

};

export default function App() {

  useEffect(() => {
      const unsubscribe = messaging().onMessage(async remoteMessage => {
        console.log('[Remote Message] ', JSON.stringify(remoteMessage));
        displayNotification(remoteMessage);
        /* PushNotification.localNotification({
            message: remoteMessage.notification.body,
            title: remoteMessage.notification.title,
            bigPictureUrl: remoteMessage.notification.android.imageUrl,
            smallIcon: remoteMessage.notification.android.imageUrl,
            channelId: true,
            vibrate: true
        }); */
      });
      return unsubscribe;
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={Home} options={navOptionHandler}/>
        <Stack.Screen name="QrScanner" component={QrScanner} options={navOptionHandler}/>
        <Stack.Screen name="GeoLocation" component={GeoLocation} options={navOptionHandler}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
};