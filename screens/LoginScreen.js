// screens/LoginScreen.js

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  Button,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  Animated,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import LottieView from 'lottie-react-native';
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // If using vector-icons

export default function LoginScreen() {
  const [email, setEmail] = useState('toshan22102@iiitnr.edu.in');
  const [pass, setPass] = useState('hellohii@12345');
  const [err, setErr] = useState('');
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPassFocused, setIsPassFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Animation entrance for card
  const cardAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(cardAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 7,
      tension: 35,
    }).start();
  }, []);

  const handleLogin = async () => {
    setLoading(true);
    try {
      setErr('');
      await signInWithEmailAndPassword(auth, email, pass);
      // Navigation handled globally
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.wrapper}>
        <AnimatedBakeryDecorations />

        {/* Animated Delivery Boy Lottie */}
        <View style={styles.lottieContainer}>
          <LottieView
            source={require('../assets/Food Delivery Service.json')}
            autoPlay
            loop
            style={{ width: 220, height: 220 }}
          />
        </View>

        <Text style={styles.appTitle}>🍞 Toshan Bakery</Text>

        <Animated.View
          style={[
            styles.card,
            {
              opacity: cardAnim,
              transform: [
                {
                  scale: cardAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.7, 1],
                  }),
                },
                {
                  translateY: cardAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [100, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.heading}>Admin Login</Text>

          {/* Email Input */}
          <View style={[styles.inputWrapper, isEmailFocused && styles.inputFocused]}>
            <TextInput
              placeholder="Email"
              placeholderTextColor="#8895a7"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              onFocus={() => setIsEmailFocused(true)}
              onBlur={() => setIsEmailFocused(false)}
              autoCapitalize="none"
              autoCorrect={false}
              style={styles.input}
              editable={!loading}
            />
          </View>

          {/* Password Input w/ Eye Toggle */}
          <View style={[
            styles.inputWrapper,
            isPassFocused && styles.inputFocused,
            { flexDirection: 'row', alignItems: 'center' }
          ]}>
            <TextInput
              placeholder="Password"
              placeholderTextColor="#8895a7"
              secureTextEntry={!showPassword}
              value={pass}
              onChangeText={setPass}
              onFocus={() => setIsPassFocused(true)}
              onBlur={() => setIsPassFocused(false)}
              style={[styles.input, { flex: 1 }]}
              editable={!loading}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(v => !v)}
              hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
              disabled={loading}
            >
              {/* <Icon name={showPassword ? 'eye-off' : 'eye'} size={22} color="#b75c13" /> */}
              <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>

          {/* Login Button with Loading Animation */}
          <View style={styles.buttonWrapper}>
            {loading ? (
              // Option 1: Lottie loading spinner (add Lottie asset to assets folder, e.g. loading.json)
               <LottieView
                source={require('../assets/Delivery Truck _ Loading _ Exporting.json')}
               autoPlay
              loop
                style={{ width: 102, height: 102, alignSelf: 'center' }}
              />
              // Option 2: OS native spinner
             // <ActivityIndicator size="large" color="#f59e42" style={{ marginVertical: 8 }} />
            ) : (
              <Button title="Login" color="#f59e42" onPress={handleLogin} />
            )}
          </View>

          {err ? <Text style={styles.errorText}>{err}</Text> : null}

          {/* Demo Credentials */}
          <View style={styles.demoBox}>
            <Text style={styles.hintLabel}>Demo Credentials:</Text>
            <Text style={styles.hint}>📧 toshan22102@iiitnr.edu.in</Text>
            <Text style={styles.hint}>🔐 hellohii@12345</Text>
          </View>
        </Animated.View>
      </View>
    </TouchableWithoutFeedback>
  );
}

/** Animated bakery emojis using RN Animated API **/
function AnimatedBakeryDecorations() {
  const bounce1 = useRef(new Animated.Value(0)).current;
  const bounce2 = useRef(new Animated.Value(0)).current;
  const bounce3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = (val, delay = 0) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(val, { toValue: 8, duration: 580, useNativeDriver: true, delay }),
          Animated.timing(val, { toValue: -8, duration: 550, useNativeDriver: true }),
          Animated.timing(val, { toValue: 0, duration: 400, useNativeDriver: true }),
        ]),
      ).start();
    };
    animate(bounce1, 0);
    animate(bounce2, 600);
    animate(bounce3, 350);
  }, []);

  return (
    <>
      <Animated.Text
        style={[
          styles.bakeryEmoji1,
          {
            transform: [
              { rotate: '18deg' },
              { translateY: bounce1 },
              { scale: 1.03 },
            ],
          },
        ]}
      >
        🍞
      </Animated.Text>
      <Animated.Text
        style={[
          styles.bakeryEmoji2,
          {
            transform: [
              { rotate: '-10deg' },
              { translateY: bounce2 },
              { scale: 1.05 },
            ],
          },
        ]}
      >
        🧁
      </Animated.Text>
      <Animated.Text
        style={[
          styles.bakeryEmoji3,
          {
            transform: [
              { rotate: '8deg' },
              { translateY: bounce3 },
              { scale: 0.96 },
            ],
          },
        ]}
      >
        🍰
      </Animated.Text>
    </>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
    backgroundColor: '#f2bb7b',
  },
  lottieContainer: {
    alignItems: 'center',
    marginBottom: -38,
    marginTop: Platform.OS === 'ios' ? 16 : 8,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    borderRadius: 120,
    padding: 4,
    elevation: 3,
    shadowColor: '#fc8803',
    shadowOpacity: 0.18,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
  },
  appTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#b75c13',
    textAlign: 'center',
    letterSpacing: 1,
    marginBottom: 18,
    fontFamily: Platform.OS === 'ios' ? 'AvenirNext-Bold' : 'sans-serif-black',
    textShadowColor: '#fff8e1',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 6,
  },
  card: {
    width: '98%',
    maxWidth: 385,
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.88)', // Glass effect
    borderRadius: 22,
    padding: Platform.OS === 'ios' ? 36 : 24,
    borderWidth: 1,
    borderColor: '#e3a770',
    shadowColor: '#e49e61',
    shadowOpacity: 0.14,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    color: '#f59e42',
    textAlign: 'center',
    marginBottom: 18,
    letterSpacing: 0.5,
    fontFamily: Platform.OS === 'ios' ? 'AvenirNext-DemiBold' : 'sans-serif-medium',
  },
  inputWrapper: {
    backgroundColor: 'rgba(249,237,224,0.48)',
    borderRadius: 12,
    paddingVertical: Platform.OS === 'ios' ? 16 : 12,
    paddingHorizontal: 18,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#b75c13',
    elevation: 1,
  },
  inputFocused: {
    borderColor: '#f59e42',
    backgroundColor: '#fff',
  },
  input: {
    fontSize: 16,
    fontWeight: '500',
    color: '#7c401b',
    fontFamily: Platform.OS === 'ios' ? 'AvenirNext-Regular' : 'sans-serif-condensed',
    letterSpacing: 0.3,
  },
  buttonWrapper: {
    marginTop: 6,
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 2,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    marginTop: 12,
    textAlign: 'center',
    fontWeight: '600',
  },
  demoBox: {
    marginTop: 24,
    backgroundColor: 'rgba(255, 250, 210, 0.65)', // soft yellow
    padding: 15,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#f3bb7b',
    shadowColor: '#f59e42',
    shadowOpacity: 0.10,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 }
  },
  hintLabel: {
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 15,
    marginBottom: 6,
    color: '#b75c13',
    letterSpacing: 0.2,
  },
  hint: {
    textAlign: 'center',
    fontSize: 14,
    color: '#8d5525',
    fontWeight: '600',
  },
  breadFloating: {
    position: 'absolute',
    width: 66,
    height: 66,
    opacity: 0.8,
  },
  bakeryEmoji1: {
    position: 'absolute',
    top: 60,
    left: 30,
    fontSize: 44,
    opacity: 0.88,
    zIndex: 2,
  },
  bakeryEmoji2: {
    position: 'absolute',
    bottom: 70,
    right: 48,
    fontSize: 38,
    opacity: 0.86,
    zIndex: 2,
  },
  bakeryEmoji3: {
    position: 'absolute',
    top: 140,
    right: 60,
    fontSize: 38,
    opacity: 1,
    zIndex: 2,
  },
  eyeIcon: {
    fontSize: 22,
    marginLeft: 7,
    color: '#b75c13',
  },
});
