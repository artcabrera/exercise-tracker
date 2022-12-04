import React, { useEffect, useRef, useState } from "react";
import {
  Text,
  View,
  Dimensions,
  SafeAreaView,
  TouchableOpacity,
  Animated,
  Platform,
} from "react-native";
import { Pedometer } from "expo-sensors";
import haversine from "haversine";
import { StatusBar } from "expo-status-bar";
import { FontAwesome5, AntDesign } from "@expo/vector-icons";
import MapView, {
  AnimatedRegion,
  Callout,
  MarkerAnimated,
  Polyline,
  PROVIDER_GOOGLE,
} from "react-native-maps";
import * as Location from "expo-location";

const formatTime = (number) => `0${number}`.slice(-2);

const getTime = (time) => {
  const mins = Math.floor(time / 60);
  const secs = time - mins * 60;
  return { mins: formatTime(mins), secs: formatTime(secs) };
};

const { width, height } = Dimensions.get("screen");

const LATITUDE_DELTA = 0.007;
const LONGITUDE_DELTA = 0.007;
const LATITUDE = 11.58291;
const LONGITUDE = 122.753156;

export default function App() {
  const [currentStepCount, setCurrentStepCount] = useState(0);
  const [isPedometerAvailable, setIsPedometerAvailable] = useState("Checking");
  const [timeInterval, setTimeInterval] = useState(0);
  const { mins, secs } = getTime(timeInterval);
  const [latitude, setLatitude] = useState(LATITUDE);
  const [longitude, setLongitude] = useState(LONGITUDE);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [distanceTravelled, setDistanceTravelled] = useState(0);
  const [prevLatLng, setPrevLatLng] = useState({});
  const [coordinates, setCoordinates] = useState(
    new AnimatedRegion({
      latitude: LATITUDE,
      longitude: LONGITUDE,
      latitudeDelta: LATITUDE_DELTA,
      longitudeDelta: LONGITUDE_DELTA,
    })
  );
  const [fromLocation, setFromLocation] = useState("");
  const [toLocation, setToLocation] = useState("");
  const marker = useRef(null).current;

  const fadeMap = useRef(new Animated.Value(0)).current;

  const [onWalk, setOnWalk] = useState(false);

  let _subscription;
  let _dist = currentStepCount / 1300;
  let distanceCovered = _dist.toFixed(2);

  let _cal = distanceCovered * 60;
  let caloriesBurnt = _cal.toFixed(2);

  const _unsubscribe = () => {
    _subscription && _subscription.remove();
    _subscription = null;
  };

  const _subscribe = () => {
    _subscription = Pedometer.watchStepCount((result) => {
      setCurrentStepCount(result.steps);
    });

    Pedometer.isAvailableAsync().then(
      (result) => {
        setIsPedometerAvailable(String(result));
      },
      (error) => {
        setIsPedometerAvailable("isPedometerAvailable:" + error);
      }
    );
  };

  const handleStart = () => {
    _subscribe();
    setOnWalk(true);
    Animated.timing(fadeMap, {
      useNativeDriver: true,
      toValue: 1,
      duration: 1000,
    }).start();
  };

  const handleStop = () => {
    setTimeInterval(0);
    _unsubscribe();
    setOnWalk(false);
    Animated.timing(fadeMap, {
      useNativeDriver: true,
      toValue: 0,
      duration: 0,
    }).start();
  };

  useEffect(() => {
    let interval = null;
    if (onWalk) {
      interval = setInterval(() => {
        setTimeInterval((timeInterval) => timeInterval + 1);
        trackLocation();
      }, 1000);
    } else if (!onWalk && timeInterval !== 0) {
      clearInterval(interval);
    }
    return () => {
      clearInterval(interval);
    };
  }, [onWalk, timeInterval]);

  const trackLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status != "granted") return;

    Location.installWebGeolocationPolyfill();

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        const newCoordinates = {
          latitude,
          longitude,
          latitudeDelta: LATITUDE_DELTA,
          longitudeDelta: LONGITUDE_DELTA,
        };

        if (Platform.OS === "android") {
          if (marker) {
            marker.animateMarkToCoordinate(newCoordinates, 500);
          }
        } else {
          coordinates.timing(newCoordinates).start();
        }

        setLongitude(longitude);
        setLatitude(latitude);
        setRouteCoordinates((routeCoordinates) =>
          routeCoordinates.concat([newCoordinates])
        );
        setDistanceTravelled(
          (distanceTravelled) =>
            distanceTravelled + calcDistance(newCoordinates)
        );
        setPrevLatLng(newCoordinates);
        setCoordinates(newCoordinates);
      },
      (error) => console.log(error),
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 10000,
        distanceFilter: 10,
      }
    );
  };

  const calcDistance = (newLatLng) => {
    return haversine(prevLatLng, newLatLng) || 0;
  };

  const getMapRegion = () => ({
    latitude,
    longitude,
    latitudeDelta: LATITUDE_DELTA,
    longitudeDelta: LONGITUDE_DELTA,
  });

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: "white",
        position: "relative",
        height,
        width,
      }}
    >
      <TouchableOpacity
        onPress={onWalk ? handleStop : handleStart}
        style={{
          width: width * 0.2,
          height: width * 0.2,
          postion: "absolute",
          left: width - 100 + width * -0.05,
          top: height * 0.42 + 50,
          zIndex: 100,
        }}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "#FF7000",
            borderRadius: 100,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <FontAwesome5
            name={onWalk ? "pause" : "play"}
            size={width * 0.05}
            color="white"
          />
        </View>
      </TouchableOpacity>
      <View
        style={{
          backgroundColor: "#540375",
          position: "absolute",
          bottom: height * 0.3,
          left: -width * 0.25,
          width: width * 2,
          height: width * 2,
          borderRadius: width,
          overflow: "hidden",
        }}
      >
        <Polyline coordinates={routeCoordinates} strokeWidth={5} />
        <Animated.View
          style={{ width: "100%", height: "100%", opacity: fadeMap }}
        >
          <MapView
            provider={PROVIDER_GOOGLE}
            showUserLocation
            followUserLocation
            region={{
              latitude,
              longitude,
              latitudeDelta: LATITUDE_DELTA,
              longitudeDelta: LONGITUDE_DELTA,
            }}
            style={{ width: "100%", height: "100%" }}
          >
            <MarkerAnimated
              pinColor="#540375"
              coordinate={coordinates}
              ref={marker}
            >
              <Callout>
                <Text>You are here!</Text>
              </Callout>
            </MarkerAnimated>
          </MapView>
        </Animated.View>
      </View>
      <View
        style={{
          flex: 1,
          width,
          height,
        }}
      >
        <View
          style={{
            flex: 0.5,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            paddingBottom: height * 0.2,
            flexDirection: "column",
          }}
        >
          <Text
            style={{
              color: onWalk ? "black" : "white",
              fontSize: 120,
              fontWeight: "500",
            }}
          >
            {currentStepCount}
          </Text>
          <Text style={{ color: onWalk ? "black" : "white" }}>Steps</Text>
        </View>
        <View
          style={{
            flex: 0.5,
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View
            style={{
              flex: 1,
              width: width / 3,
              height: height * 0.2,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
            }}
          >
            <View
              style={{
                position: "relative",
                width: width * 0.15,
                height: width * 0.15,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                overflow: "hidden",
              }}
            >
              <View
                style={{
                  backgroundColor: "#FF7000",
                  width: width * 0.15,
                  height: width * 0.15,
                  borderRadius: 100,
                  opacity: 0.25,
                  position: "absolute",
                  top: 0,
                  left: 0,
                }}
              ></View>

              <FontAwesome5 name="road" size={width * 0.08} color="#FF7000" />
            </View>
            <Text style={{ fontSize: 20, fontWeight: "bold" }}>
              {distanceTravelled}km
            </Text>
          </View>
          <View
            style={{
              flex: 1,
              width: width / 3,
              height: height * 0.2,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
            }}
          >
            <View
              style={{
                position: "relative",
                width: width * 0.15,
                height: width * 0.15,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                overflow: "hidden",
              }}
            >
              <View
                style={{
                  backgroundColor: "#FF7000",
                  width: width * 0.15,
                  height: width * 0.15,
                  borderRadius: 100,
                  opacity: 0.25,
                  position: "absolute",
                  top: 0,
                  left: 0,
                }}
              ></View>

              <FontAwesome5 name="fire" size={width * 0.08} color="#FF7000" />
            </View>
            <Text style={{ fontSize: 20, fontWeight: "bold" }}>
              {caloriesBurnt}kcal
            </Text>
          </View>
          <View
            style={{
              flex: 1,
              width: width / 3,
              height: height * 0.2,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
            }}
          >
            <View
              style={{
                position: "relative",
                width: width * 0.15,
                height: width * 0.15,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                overflow: "hidden",
              }}
            >
              <View
                style={{
                  backgroundColor: "#FF7000",
                  width: width * 0.15,
                  height: width * 0.15,
                  borderRadius: 100,
                  opacity: 0.25,
                  position: "absolute",
                  top: 0,
                  left: 0,
                }}
              ></View>
              <AntDesign
                name="clockcircle"
                size={width * 0.08}
                color="#FF7000"
              />
            </View>
            <Text style={{ fontSize: 20, fontWeight: "bold" }}>
              {mins}m:{secs}s
            </Text>
          </View>
        </View>
      </View>
      <StatusBar style={onWalk ? "dark" : "light"} />
    </SafeAreaView>
  );
}
