// screens/LoginScreen.js

import React, { useState } from 'react';
import {
  View,
  TextInput,
  Button,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
} from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

export default function LoginScreen() {
  const [email, setEmail] = useState('toshan22102@iiitnr.edu.in');
  const [pass, setPass] = useState('hellohii@12345');
  const [err, setErr] = useState('');
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPassFocused, setIsPassFocused] = useState(false);

  const handleLogin = async () => {
    try {
      setErr('');
      await signInWithEmailAndPassword(auth, email, pass);
      // 👇 Navigation is handled by App.js via onAuthStateChanged
    } catch (e) {
      setErr(e.message);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.wrapper}>
        <Text style={styles.appTitle}>🍞 Toshan Bakery</Text>

        <View style={styles.card}>
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
            />
          </View>

          {/* Password Input */}
          <View style={[styles.inputWrapper, isPassFocused && styles.inputFocused]}>
            <TextInput
              placeholder="Password"
              placeholderTextColor="#8895a7"
              secureTextEntry
              value={pass}
              onChangeText={setPass}
              onFocus={() => setIsPassFocused(true)}
              onBlur={() => setIsPassFocused(false)}
              style={styles.input}
            />
          </View>

          {/* Login Btn */}
          <View style={styles.buttonWrapper}>
            <Button title="Login" color="#2563eb" onPress={handleLogin} />
          </View>

          {err ? <Text style={styles.errorText}>{err}</Text> : null}

          {/* Demo Credentials */}
          <View style={styles.demoBox}>
            <Text style={styles.hintLabel}>Demo Credentials:</Text>
            <Text style={styles.hint}>📧 toshan22102@iiitnr.edu.in</Text>
            <Text style={styles.hint}>🔐 hellohii@12345</Text>
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 30,
    backgroundColor: '#f1f5f9',
  },
  appTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#334155',
    textAlign: 'center',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  heading: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 30,
  },
  inputWrapper: {
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
    paddingHorizontal: 14,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#d1d5db',
  },
  inputFocused: {
    borderColor: '#2563eb',
    backgroundColor: '#fff',
  },
  input: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
  },
  buttonWrapper: {
    marginTop: 4,
    borderRadius: 10,
    overflow: 'hidden',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    marginTop: 12,
    textAlign: 'center',
  },
  demoBox: {
    marginTop: 24,
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  hintLabel: {
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 6,
    color: '#64748b',
  },
  hint: {
    textAlign: 'center',
    fontSize: 13,
    color: '#475569',
  },
});