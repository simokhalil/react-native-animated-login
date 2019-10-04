import React, { Component } from 'react';
import { View, Text, StyleSheet, Dimensions, TextInput, KeyboardAvoidingView } from 'react-native';

import Svg, { Image, Circle, ClipPath } from 'react-native-svg';
import { Accelerometer } from 'expo-sensors';
import Animated, { Easing } from 'react-native-reanimated';
import { TapGestureHandler, State } from 'react-native-gesture-handler';
const { width, height } = Dimensions.get('screen');

const {
  Value,
  event,
  block,
  cond,
  eq,
  set,
  Clock,
  startClock,
  stopClock,
  debug,
  timing,
  clockRunning,
  interpolate,
  Extrapolate,
  concat
} = Animated;

function runTiming(clock, value, dest) {
  const state = {
    finished: new Value(0),
    position: new Value(0),
    time: new Value(0),
    frameTime: new Value(0),
  };

  const config = {
    duration: 500,
    toValue: new Value(0),
    easing: Easing.inOut(Easing.ease)
  };

  return block([
    cond(clockRunning(clock), 0, [
      set(state.finished, 0),
      set(state.time, 0),
      set(state.position, value),
      set(state.frameTime, 0),
      set(config.toValue, dest),
      startClock(clock)
    ]),
    timing(clock, state, config),
    cond(state.finished, debug('stop clock', stopClock(clock))),
    state.position
  ]);
}
class MusicApp extends Component {
  constructor() {
    super();

    this.state = {
      accelerometerData: { x: 0, y: 0, z: 0 },
    };

    this.buttonOpacity = new Value(1);

    this.onStateChange = event([
      {
        nativeEvent: ({ state }) =>
          block([
            cond(
              eq(state, State.END),
              set(this.buttonOpacity, runTiming(new Clock(), 1, 0))
            )
          ])
      }
    ]);

    this.onCloseState = event([
      {
        nativeEvent: ({ state }) =>
          block([
            cond(
              eq(state, State.END),
              set(this.buttonOpacity, runTiming(new Clock(), 0, 1))
            )
          ])
      }
    ]);

    this.buttonY = interpolate(this.buttonOpacity, {
      inputRange: [0, 1],
      outputRange: [100, 0],
      extrapolate: Extrapolate.CLAMP
    });

    this.bgY = interpolate(this.buttonOpacity, {
      inputRange: [0, 1],
      outputRange: [-height / 3 - 50, 0],
      extrapolate: Extrapolate.CLAMP
    });

    this.textInputZIndex = interpolate(this.buttonOpacity, {
      inputRange: [0, 1],
      outputRange: [1, -1],
      extrapolate: Extrapolate.CLAMP
    });

    this.textInputY = interpolate(this.buttonOpacity, {
      inputRange: [0, 1],
      outputRange: [0, 100],
      extrapolate: Extrapolate.CLAMP
    });

    this.textInputOpacity = interpolate(this.buttonOpacity, {
      inputRange: [0, 1],
      outputRange: [1, 0],
      extrapolate: Extrapolate.CLAMP
    });

    this.rotateCross = interpolate(this.buttonOpacity, {
      inputRange: [0, 1],
      outputRange: [180, 360],
      extrapolate: Extrapolate.CLAMP
    });

    this.screenWidth = width;
    this.screenHeight = height;
    this.boxWidth = this.screenWidth / 10.0
  }

  componentWillUnmount() {
    this._unsubscribeFromAccelerometer();
  }

  componentDidMount() {
    this._subscribeToAccelerometer();
  }

  _subscribeToAccelerometer = () => {
    this._accelerometerSubscription = Accelerometer.addListener(accelerometerData => this.setState({ accelerometerData })
    );
  };

  _unsubscribeFromAccelerometer = () => {
    this._accelerometerSubscription && this._acceleroMeterSubscription.remove();
    this._accelerometerSubscription = null;
  };

  render() {
    return (
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="height">
        <Animated.ScrollView
          contentContainerStyle={{
            flex: 1,
            backgroundColor: 'white',
            justifyContent: 'flex-end'
          }}
        >
          <Animated.View
            style={{
              ...StyleSheet.absoluteFill,
              transform: [{ translateY: this.bgY }],
            }}
          >
            <Svg height={height + 100} width={width * 2}
              style={{
                position: 'absolute',
                top: -50 + height * (this.state.accelerometerData.y / 20 + 2.0) / 2.0 - (height),
                left: this.screenWidth * (this.state.accelerometerData.x / 5 + 2.0) / 2.0 - (this.screenWidth * 1.5),
              }}
            >
              <ClipPath id="clip">
                <Circle r={height + 100} cx={width} />
              </ClipPath>
              <Image
                href={require('../assets/bg2.jpg')}
                width={width * 2}
                height={height + 100}
                preserveAspectRatio="xMidYMid slice"
                clipPath="url(#clip)"
              />
            </Svg>
          </Animated.View>

          <View style={{ height: height / 3, justifyContent: 'center' }}>
            <TapGestureHandler onHandlerStateChange={this.onStateChange}>
              <Animated.View
                style={{
                  ...styles.button,
                  opacity: this.buttonOpacity,
                  transform: [{ translateY: this.buttonY }, { perspective: 45 }]
                }}
              >
                <Text style={{ fontSize: 20, fontWeight: 'bold' }}>SIGN IN</Text>
              </Animated.View>
            </TapGestureHandler>

            <Animated.View
              style={{
                zIndex: this.textInputZIndex,
                opacity: this.textInputOpacity,
                transform: [{ translateY: this.textInputY }],
                height: height / 3,
                ...StyleSheet.absoluteFill,
                top: null,
                justifyContent: 'center',
              }}>

              <TapGestureHandler onHandlerStateChange={this.onCloseState}>
                <Animated.View style={styles.closeButton}>
                  <Animated.Text style={{ fontSize: 15, transform: [{ rotate: concat(this.rotateCross, 'deg') }] }}>
                    X
                  </Animated.Text>
                </Animated.View>
              </TapGestureHandler>

              <TextInput
                placeholder="EMAIL"
                style={styles.textInput}
                placeholderTextColor="black"
              />
              <TextInput
                placeholder="PASSWORD"
                style={styles.textInput}
                placeholderTextColor="black"
              />

              <Animated.View style={styles.button}>
                <Text style={{ fontSize: 20, fontWeight: 'bold'}}>SIGN IN</Text>
              </Animated.View>
            </Animated.View>
          </View>
        </Animated.ScrollView>
      </KeyboardAvoidingView>
    );
  }
}
export default MusicApp;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  button: {
    backgroundColor: 'white',
    height: 70,
    marginHorizontal: 20,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 5,
    shadowOffset: { width: 2, height: 2 },
    shadowColor: 'black',
    shadowOpacity: 0.2,
  },
  closeButton: {
    height: 40,
    width: 40,
    backgroundColor: 'white',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: -20,
    left: width / 2 - 20,
    shadowOffset: { width: 2, height: 2 },
    shadowColor: 'black',
    shadowOpacity: 0.2,
  },
  textInput: {
    height: 50,
    borderRadius: 25,
    borderWidth: 0.5,
    marginHorizontal: 20,
    paddingLeft: 10,
    marginVertical: 5,
    borderColor: 'rgba(0, 0, 0, 0.2)',
  }
});
