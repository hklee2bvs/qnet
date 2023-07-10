import React, { useState, useEffect } from "react";

import GeolocationService from "react-native-geolocation-service";
import MapView, { PROVIDER_GOOGLE , Marker} from "react-native-maps";
import styled from "styled-components";
import { Platform, PermissionsAndroid } from "react-native";

async function requestPermission() {
  try {
    if (Platform.OS === "ios") {
      return await GeolocationService.requestAuthorization("always");
    }
    // 안드로이드 위치 정보 수집 권한 요청
    if (Platform.OS === "android") {
      return await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
    }
  } catch (e) {
    console.log(e);
  }
}

function Geolocation() {
  const [location, setLocation] = useState();
  useEffect(() => {
    requestPermission().then(result => {
      console.log({ result });
      if (result === "granted") {
        GeolocationService.getCurrentPosition(
          pos => {
            console.log('pos.coords :: ' + pos.coords);
            setLocation(pos.coords);
          },
          error => {
            console.log(error);
          },
          {
            enableHighAccuracy: true,
            timeout: 3600,
            maximumAge: 3600,
          },
        );
      }
    });
  }, []);

  if (!location) {
    return (
      <View>
        <Text>Splash Screen</Text>
      </View>
    );
  }

  return (
    <>
      <View>
        <Map
          provider={PROVIDER_GOOGLE}
          initialRegion={{
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          }}
          loadingEnabled = {true}
          moveOnMarkerPress = {false}
          showsUserLocation={true}
          showsCompass={true}
          showsPointsOfInterest = {false}
          provider="google"
        />
        <Marker
          coordinate={{latitude: location.latitude, longitude: location.longitude}}
          title="this is a marker"
          description="this is a marker example"
          pinColor="green"
        />
      </View>
    </>
  );
}

const View = styled.View`
  flex: 1;
`;

const Text = styled.Text`
  flex: 1;
`;

const Map = styled(MapView)`
  flex: 1;
`;

export default Geolocation;