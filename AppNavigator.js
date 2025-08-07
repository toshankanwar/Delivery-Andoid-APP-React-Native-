// AppNavigator.js
import React, { useContext } from 'react';
import { createDrawerNavigator, DrawerContentScrollView } from '@react-navigation/drawer';
import OrdersScreen from './screens/OrdersScreen';
import { ThemeContext } from './context/ThemeContext';
import {
  View,
  Text,
  Switch,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from './firebase';

const Drawer = createDrawerNavigator();

const CustomDrawerContent = ({ navigation }) => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  const user = auth.currentUser;
  const displayName = user?.displayName || 'Admin';
  const email = user?.email || 'admin@example.com';
  const photoURL = user?.photoURL || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png';

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut(auth);
            // onAuthStateChanged in App.js handles redirect
          } catch (err) {
            console.error('Error logging out:', err);
          }
        },
      },
    ]);
  };

  return (
    <DrawerContentScrollView
      contentContainerStyle={[
        styles.drawer,
        isDark && styles.drawerDark,
      ]}
    >
      <Text style={[styles.appLogo, isDark && { color: '#f1f5f9' }]}>
        🍞 Toshan Bakery
      </Text>

      <View style={styles.profileBlock}>
        <Image source={{ uri: photoURL }} style={styles.avatar} />
        <View>
          <Text style={[styles.profileName, isDark && { color: '#f1f5f9' }]}>
            {displayName}
          </Text>
          <Text style={[styles.profileEmail, isDark && { color: '#cbd5e1' }]}>
            {email}
          </Text>
        </View>
      </View>

      <View style={styles.row}>
        <Text style={[styles.drawerText, isDark && { color: '#e2e8f0' }]}>
          Dark Theme
        </Text>
        <Switch
          value={isDark}
          onValueChange={toggleTheme}
          thumbColor={isDark ? '#3b82f6' : '#fbbf24'}
          trackColor={{ false: '#d1d5db', true: '#475569' }}
        />
      </View>

      <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </DrawerContentScrollView>
  );
};

export default function AppNavigator() {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: false,
        drawerType: 'front', // 🔐 ensures drawer overlays the content entirely
        swipeEnabled: true,
        drawerStyle: {
          backgroundColor: '#f9fafb', // Base light color
          width: '75%',
        },
        sceneContainerStyle: {
          backgroundColor: '#000000', // Prevent see-through issue
        },
      }}
      drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
      <Drawer.Screen name="Orders" component={OrdersScreen} />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  drawer: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 24,
    backgroundColor: '#f9fafb',
  },
  drawerDark: {
    backgroundColor: '#1f2937',
  },
  appLogo: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 30,
  },
  profileBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    gap: 12,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    marginRight: 12,
    borderWidth: 1.5,
    borderColor: '#94a3b8',
  },
  profileName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
  },
  profileEmail: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  drawerText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#334155',
  },
  logoutBtn: {
    backgroundColor: '#ef4444',
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 16,
  },
  logoutText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 15,
  },
});