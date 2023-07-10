/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import {
  Alert,
  TouchableOpacity
} from 'react-native';
import ReactNativeBiometrics, {BiometryTypes} from 'react-native-biometrics';
const rnBiometrics = new ReactNativeBiometrics();

export const getbiometricsUseType = () => {

    return rnBiometrics.isSensorAvailable().then(resultObject => {
        const {available, biometryType} = resultObject;
        console.log('available :: ' + available);
        console.log('biometryType :: ' + biometryType);
        if(available && biometryType === BiometryTypes.TouchID){
            console.log('biometricsCheck :: TouchID(키입력)');
            return {result: true, type: biometryType};
        }else if(available && biometryType === BiometryTypes.FaceID){
            console.log('biometricsCheck :: FaceID(얼굴인식)');
            return {result: true, type: biometryType};
        }else if(available && biometryType === BiometryTypes.Biometrics){
            console.log('biometricsCheck :: Biometrics(지문)');
            return {result: true, type: biometryType};
        }else{
            console.log('biometricsCheck :: None');
            return {result: false, type: null};
        }
    }).catch(() => {
        console.log('biometricsCheck :: Error');
        return {result: false, type: null};
    });


};

// 생체인증 - 단순인증
export const biometricSimplePrompt = async () => {
    return await rnBiometrics.simplePrompt({
        promptMessage: 'Sign in with Touch ID',
        cancelButtonText: 'Close',
    }).then(resultObject => {
        const { success } = resultObject;
        return {pass: success};
    }).catch(()=>{
        console.log('biometricSimplePrompt :: Error');
        return {pass: false};
    });
};

// 전자서명 - 로그인 또는 서버인증
export const biometricsSignature = async () => {
    let epochTimeSeconds = Math.round((new Date()).getTime() / 1000).toString()
    let payload = epochTimeSeconds + 'some message'
    console.log('biometricsSignature [epochTimeSeconds] :: ' + epochTimeSeconds);
    console.log('biometricsSignature [payload] :: ' + payload);
    return await rnBiometrics.createSignature({
        promptMessage: 'Sign in with Singature',
        payload: payload,
        cancelButtonText: 'Close',
    }).then(resultObject => {
        const { success, signature } = resultObject;
        if(success){
            return {pass: success, key: signature};
        }else{
            return {pass: false, key: null};
        }
    }).catch((error)=>{
        console.log('biometricsSignature :: ' + error);
        return {pass: false, key: null};
    });
};

// 키 존재 여부
export const isExistKey = () => {
    return rnBiometrics.biometricKeysExist().then(resultObject => {
        const [keysExist] = resultObject;
        if(keysExist){
            return true;
        }else{
            return false;
        }
    })
    .catch(() => {
        return false;
    });
};

// 키 생성
export const createKey = () => {
    console.log('createKey :: ');
    return rnBiometrics.createKeys().then(resultObject => {
        const [publicKey] = resultObject;
        return {result:true, key: publicKey};
    })
    .catch((error) => {
        console.log('createKey error :: '+error);
        return {result:false, key: null};
    });
};

// 키 삭제
export const deleteKey = () => {
    return rnBiometrics.deleteKeys().then(resultObject => {
        const [keyDeleted] = resultObject;
        if(keyDeleted){
            return true;
        }else{
            return false;
        }
    })
    .catch(() => {
        return false;
    });
};
