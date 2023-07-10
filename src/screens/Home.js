/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { Component, useEffect, useState, useRef } from 'react';
import type {PropsWithChildren} from 'react';
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
  Linking,
  Platform,
  RefreshControl
} from 'react-native';
import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks, 
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';

import { check, PERMISSIONS, RESULTS, request } from "react-native-permissions";
import { WebView } from 'react-native-webview';
import Toast from 'react-native-toast-message';
import messaging from '@react-native-firebase/messaging';
import dynamicLinks from '@react-native-firebase/dynamic-links';
import * as biometrics from '/lib/Biometrics';
import Share from "react-native-share";

const statusBarHeight = StatusBar.currentHeight ==undefined?0:StatusBar.currentHeight;
console.log('statusBarHeight :: '+statusBarHeight);

const fcmToken = messaging().getToken();
console.log('fcmToken :: '+fcmToken);

/**
* 화면에서 post를 던지면 react-native에서 받음
*/
const onWebViewMessage = event => {
    console.log('onWebViewMessage', JSON.parse(event.nativeEvent.data))
    let msgData;
    try {
        msgData = JSON.parse(event.nativeEvent.data) || {}
    } catch (error) {
        console.error(error)
        return
    }
    this[msgData.targetFunc].apply(this, [msgData]);
}

const webViewInit = async () => {
    console.log('[FCM Token] ', fcmToken);
};

function Home (props){

    getFcmToken = async(msgData) => {
        console.log('getFcmToken [msgData.msgId] :: ' + msgData.msgId)
        msgData.isSuccessfull = true
        msgData.data = await messaging().getToken()
        appWebview.postMessage(JSON.stringify(msgData), '*');
    }
    /**
    * Toast Message
    */
    viewToastMessage = msgData => {
        console.log('viewToastMessage [msgData.msgId] :: ' + msgData.msgId)
        Toast.show({
            type: 'info',
            text1: msgData.data.value,
            onHide: async () => {
                msgData.isSuccessfull = true
                msgData.data = 'viewToastMessage error'
                appWebview.postMessage(JSON.stringify(msgData), '*');
            }
        });
    }

    /**
    * checkBiometricsSimple
    */
    checkBiometricsSimple = async(msgData) => {
      const  {result, type}  = await biometrics.getbiometricsUseType();
      console.log('checkBiometricsSimple [msgData.msgId] :: ' + msgData.msgId);
      if(result){
          let msg = '';
          if(type == 'TouchID'){
              msg = '키입력';
              console.log('checkBiometricsSimple :: '+msg);
          }else if(type == 'FaceID'){
              msg = '얼굴인식';
              console.log('checkBiometricsSimple :: '+msg);
          }else if(type == 'Biometrics'){
              msg = '지문인식';
              console.log('checkBiometricsSimple :: '+msg);
              const {pass} = await biometrics.biometricSimplePrompt();
              if(pass){
                  //지문 일치
                  console.log('checkBiometricsSimple :: 지문 일치');
                  msgData.isSuccessfull = true
                  msgData.data = '지문이 일치합니다.'
                  appWebview.postMessage(JSON.stringify(msgData), '*');
              }else{
                  //지문 뷸일치
                  console.log('checkBiometricsSimple :: 지문 뷸일치');
                  msgData.isSuccessfull = false
                  msgData.data = '지문이 불일치 합니다.'
                  appWebview.postMessage(JSON.stringify(msgData), '*');
              }
          }else{
              msg = '지원되는 형식 없음';
              console.log('checkBiometricsSimple :: '+msg);
          }
      }else{
          Alert.alert('type :: '+type);
      }
    }

    /**
    * checkBiometricsSignature
    */
    checkBiometricsSignature = async(msgData) => {
      //키 존재여부 확인
      const keysExist  = await biometrics.isExistKey();
      console.log('checkBiometricsSignature [keysExist] :: '+keysExist);
      if(!keysExist){
        console.log('checkBiometricsSignature [keysExist] :: 키 없음');
        const {result, key}  =  await biometrics.createKey();
        console.log('checkBiometricsSignature [createKey] :: '+key);
      }

      const  {result, type}  = await biometrics.getbiometricsUseType();
      console.log('checkBiometricsSignature [msgData.msgId] :: ' + msgData.msgId);
      if(result){
          let msg = '';
          if(type == 'TouchID'){
              msg = '키입력';
              console.log('checkBiometricsSignature :: '+msg);
          }else if(type == 'FaceID'){
              msg = '얼굴인식';
              console.log('checkBiometricsSignature :: '+msg);
          }else if(type == 'Biometrics'){
              msg = '지문인식';
              console.log('checkBiometricsSignature :: '+msg);
              const {pass,key} = await biometrics.biometricsSignature();
              if(pass){
                  //지문 일치
                  console.log('checkBiometricsSignature :: 지문 일치');
                  console.log('checkBiometricsSignature [key]:: ' + key);
                  msgData.isSuccessfull = true
                  msgData.data = '지문이 일치합니다.'
                  msgData.key = key // 인증성공한 key
                  appWebview.postMessage(JSON.stringify(msgData), '*');
                  console.log('checkBiometricsSignature :: 지문 일치 222');
              }else{
                  //지문 뷸일치
                  console.log('checkBiometricsSignature :: 지문 뷸일치');
                  msgData.isSuccessfull = false
                  msgData.data = '지문이 불일치 합니다.'
                  msgData.key = null
                  appWebview.postMessage(JSON.stringify(msgData), '*');
              }
          }else{
              msg = '지원되는 형식 없음';
              msgData.isSuccessfull = false
              msgData.data = '지원되는 형식 없음'
              msgData.key = null
              console.log('checkBiometricsSignature :: '+msg);
          }
      }else{
          const msg = '지원되는 형식 없음';
          msgData.isSuccessfull = false
          msgData.data = '지원되는 형식 없음'
          msgData.key = null
          Alert.alert('type :: '+type);
      }
    }

    /**
    * QrScanner Load
    */
    qrScannerLoad = async (msgData)=> {
      if (Platform.OS === 'android' || Platform.OS === 'ios') {
        const platformPermissions = Platform.OS === "ios" ? PERMISSIONS.IOS.CAMERA : PERMISSIONS.ANDROID.CAMERA;
        console.log("qrScannerLoad [platformPermissions] :: " + platformPermissions);
        try{
            const granted = await request(platformPermissions);
            console.log("qrScannerLoad [granted] :: " + granted);
            if(granted === RESULTS.GRANTED){
                props.navigation.navigate('QrScanner')
            }else{
                Alert.alert("이 기능은 카메라 권한이 필요합니다.");
            }
        }catch(error){
            Alert.alert("카메라 권한 확인 중 에러.");
            console.log("qrScannerLoad error :: " + error);
        }
      }else{
        Alert.alert("카메라 권한 확인할 수 없음.");
        console.log("qrScannerLoad error" );
      }
    }

    /**
    * Geolocation Load
    */
    geoLocationLoad = (msgData)=> {
      props.navigation.navigate('GeoLocation')
    }

    onGetBarcode = (qrCode) => {
      console.log("qrCode value :: ", qrCode);
      Alert.alert("qrCode value :: ", qrCode);
    };

    const wait = (timeout) => {
      return new Promise(resolve => setTimeout(resolve, timeout));
    }
    const [refreshing, setRefreshing] = React.useState(false);

    onRefresh = React.useCallback(() => {
      setRefreshing(true);
      wait(2000).then(() => setRefreshing(false));

      const msgData = {type:"refresh"};
      console.log('onRefresh :: '+JSON.stringify(msgData));
      appWebview.postMessage(JSON.stringify(msgData), '*');

    }, []);

    const [enableRefresher, setEnableRefresher] = useState(true);

    useEffect(() => {

    }, []);

    handleScroll = (event) => {
        console.log(Number(event.nativeEvent.contentOffset.y))
        const yOffset = Number(event.nativeEvent.contentOffset.y)
        if (yOffset === 0){
          console.log('top of the page')
          setEnableRefresher(true)
        }else{
          setEnableRefresher(false)
        }
    };



    share = async (msgData) => {
        console.log('Click Share')
        const link = await dynamicLinks().buildLink({
            link: 'http://pms.bvs.co.kr',
            ios: {
              bundleId: 'com.myapp',
              appStoreId: '20230526',
            },
            android: {
              packageName: 'com.myapp',
            },
            domainUriPrefix: 'http://hklee.page.link/oN6u',
        });

        const url = link;
        const title = 'Awesome Contents';
        const message = 'Please check this out.';
        const options = {
          title,
          url,
          message,
        };
        await Share.open(options)
        .then((res) => {
            console.log(res);
        })
        .catch((err) => {
            err && console.log(err);
        });
    }

    return (
        <>
            <StatusBar barStyle="dark-content" />
            <SafeAreaView style={{ flex:1, paddingTop: statusBarHeight }}>
                <ScrollView
                    contentContainerStyle={styles.scrollView}
                    contentContainerStyle={{flex: 1}}
                    refreshControl={
                      <RefreshControl refreshing={refreshing} onRefresh={onRefresh} enabled={enableRefresher} />
                    }
                >
                    <WebView
                        onLoad={webViewInit}
                        source={{uri:'http://192.168.0.106/rntest.jsp'}}
                        originWhitelist={['*']}
                        ref={webview => appWebview = webview}
                        onMessage={onWebViewMessage}
                        javaScriptEnabled={true}
                        startInLoadingState={true}
                        cacheEnabled
                        useWebKit={true}
                        style={{marginTop:0}}
                        onScroll={handleScroll}
                    />
                </ScrollView>
            </SafeAreaView>
            <Toast position='bottom' bottomOffset={20}/>
        </>
    );


}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default Home;
