import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  Text,
  Alert,
  Button,
  ScrollView,
} from 'react-native';
import messaging, {
  FirebaseMessagingTypes,
} from '@react-native-firebase/messaging';
import Clipboard from '@react-native-clipboard/clipboard';
import notifee from '@notifee/react-native';

const App = () => {
  const [token, setToken] = useState<string>('');
  const [notiData, setNotiData] =
    useState<FirebaseMessagingTypes.RemoteMessage | null>(null);

  // ✅ Tạo notification channel khi app mở
  useEffect(() => {
    async function createNotificationChannel() {
      await notifee.requestPermission();
      await notifee.createChannel({
        id: 'default',
        name: 'Default Channel',
        importance: notifee.AndroidImportance.HIGH,
      });
    }

    createNotificationChannel();
  }, []);

  // ✅ Lấy token & xử lý các trạng thái noti
  useEffect(() => {
    messaging()
      .getToken()
      .then(fcmToken => {
        setToken(fcmToken);
        console.log('\n🎯========== FCM DEVICE TOKEN ==========');
        console.log(fcmToken);
        console.log('=======================================\n');
      });

    const unsub1 = messaging().onMessage(async remoteMessage => {
      Alert.alert(
        '📬 FCM Notification',
        remoteMessage.notification?.body || 'Thông báo mới'
      );
      setNotiData(remoteMessage);
    });

    const unsub2 = messaging().onNotificationOpenedApp(remoteMessage => {
      console.log('🔁 Mở app từ noti (background):', remoteMessage.data);
      setNotiData(remoteMessage);
    });

    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log('💤 Mở app từ noti (quit):', remoteMessage.data);
          setNotiData(remoteMessage);
        }
      });

    return () => {
      unsub1();
      unsub2();
    };
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, padding: 20 }}>
      <ScrollView>
        <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>
          🔥 FCM Token:
        </Text>
        <Text selectable>{token}</Text>

        <Button
          title="📋 Log lại token"
          onPress={() => console.log(token)}
          color="#1E90FF"
        />

        <Button
          title="📎 Copy token"
          onPress={() => {
            Clipboard.setString(token);
            Alert.alert('✅ Token đã được copy vào clipboard');
          }}
          color="#28a745"
        />

        {notiData && (
          <>
            <Text style={{ marginTop: 20, fontWeight: 'bold' }}>
              📦 Notification Received:
            </Text>
            <Text selectable>{JSON.stringify(notiData, null, 2)}</Text>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default App;
