// screens/OrdersScreen.js

import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
  useContext,
} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  RefreshControl,
  StyleSheet,
  Image,
  Alert,
  Keyboard,
} from 'react-native';
import { db } from '../firebase';
import { signOut, auth } from '../firebase';
import {
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import OrderDetailModal from './OrderDetailModal';
import { ThemeContext } from '../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export default function OrdersScreen() {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const navigation = useNavigation();
  const user = auth.currentUser;

  const [orders, setOrders] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const today = new Date().toISOString().slice(0, 10);
  const typingTimeout = useRef(null);
  const [searchReady, setSearchReady] = useState(false);

  const fetchOrders = useCallback(
    async (search = '') => {
      setLoading(true);
      try {
        const colRef = collection(db, 'orders');
        const q = query(colRef, where('deliveryDate', '==', today));
        const snap = await getDocs(q);
        const lowerSearch = search.toLowerCase();
        const arr = [];

        snap.forEach((d) => {
          const o = { id: d.id, ...d.data() };

          if ((o.orderStatus || '').toLowerCase() === 'delivered') return;

          const customerName =
            (o.address?.name || o.userEmail || '').toLowerCase();
          const items = o.items || [];

          if (search.trim()) {
            const customerMatch = customerName.includes(lowerSearch);
            const itemsMatch = items.some((i) =>
              (i.name || '').toLowerCase().includes(lowerSearch)
            );
            if (customerMatch || itemsMatch) arr.push(o);
          } else {
            arr.push(o);
          }
        });

        const sorted = arr.sort((a, b) => b.timestamp - a.timestamp || 0);
        setOrders(sorted);
      } catch (err) {
        console.error('Error fetching orders:', err);
      }
      setLoading(false);
    },
    [today]
  );

  useEffect(() => {
    if (!searchReady) return;
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      fetchOrders(searchText);
    }, 500);
    return () => clearTimeout(typingTimeout.current);
  }, [searchText, fetchOrders, searchReady]);

  useEffect(() => {
    fetchOrders('');
  }, [fetchOrders]);

  const onRefresh = () => fetchOrders(searchText);

  const styles = getStyles(isDark);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logoText}>Toshan Bakery</Text>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Image
            source={{
              uri: user?.photoURL || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
            }}
            style={styles.avatar}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      {/* Search Bar */}
      <View style={styles.searchBox}>
        <Ionicons
          name="search"
          size={20}
          color={isDark ? '#cbd5e1' : '#334155'}
          style={{ marginRight: 8 }}
        />
        <TextInput
          placeholder="Search orders or items..."
          placeholderTextColor={isDark ? '#aaa' : '#666'}
          value={searchText}
          onChangeText={(val) => {
            setSearchText(val);
            setSearchReady(true);
          }}
          onFocus={() => setSearchReady(true)}
          style={styles.searchInput}
          autoCapitalize="none"
          returnKeyType="search"
        />
        {searchText !== '' && (
          <TouchableOpacity onPress={() => setSearchText('')}>
            <Ionicons name="close" size={18} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      {/* Order List */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={onRefresh} colors={['#3b82f6']} />
        }
        keyboardShouldPersistTaps="handled"
      >
        {orders.length === 0 && !loading && (
          <Text style={styles.noOrdersText}>No orders for today.</Text>
        )}

        {orders.map((order) => {
          const customer = order.address?.name || order.userEmail || 'Unknown';
          const total = typeof order.total === 'number' ? order.total.toFixed(2) : '0.00';
          const firstItem = order.items?.[0]?.name || 'No items';
          const status = (order.paymentStatus || 'Pending').toLowerCase();
          const method = order.paymentMethod || 'Unknown';

          return (
            <TouchableOpacity
              key={order.id}
              onPress={() => setSelected(order)}
              style={styles.card}
            >
              <View style={styles.orderHeader}>
                <Text style={styles.customerName}>{customer}</Text>
                <Text style={styles.amount}>₹{total}</Text>
              </View>

              <View style={styles.subRow}>
                <Text style={styles.firstItem}>Item: {firstItem}</Text>
                <View style={[styles.badge, method === 'COD' ? styles.cod : styles.upi]}>
                  <Text style={styles.badgeText}>{method}</Text>
                </View>
              </View>

              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Status:</Text>
                <Text
                  style={[
                    styles.statusText,
                    status === 'confirmed' ? styles.statusConfirmed : styles.statusPending,
                  ]}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}

        {selected && <OrderDetailModal order={selected} onClose={() => setSelected(null)} />}
      </ScrollView>
    </View>
  );
}

const getStyles = (isDark) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#0f172a' : '#f9fafb',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: 48,
      paddingBottom: 12,
      paddingHorizontal: 16,
      backgroundColor: isDark ? '#1e293b' : '#ffffff',
    },
    logoText: {
      fontSize: 20,
      fontWeight: '700',
      color: isDark ? '#ffffff' : '#3b82f6',
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
    },
    divider: {
      height: 1,
      backgroundColor: isDark ? '#334155' : '#e2e8f0',
      marginHorizontal: 16,
    },
    searchBox: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? '#334155' : '#f1f5f9',
      borderRadius: 25,
      margin: 16,
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    searchInput: {
      flex: 1,
      fontSize: 16,
      color: isDark ? '#f1f5f9' : '#1e293b',
    },
    scrollContent: {
      paddingHorizontal: 16,
      paddingBottom: 80,
    },
    noOrdersText: {
      textAlign: 'center',
      color: '#64748b',
      marginTop: 40,
      fontSize: 16,
      fontStyle: 'italic',
    },
    card: {
      backgroundColor: isDark ? '#1e293b' : '#ffffff',
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      elevation: 2,
      shadowColor: '#000',
      shadowOpacity: 0.05,
      shadowRadius: 4,
    },
    orderHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 6,
    },
    customerName: {
      fontSize: 17,
      fontWeight: '700',
      color: isDark ? '#f8fafc' : '#1e293b',
    },
    amount: {
      fontSize: 17,
      fontWeight: '700',
      color: '#16a34a',
    },
    subRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    firstItem: {
      fontSize: 14,
      color: isDark ? '#e2e8f0' : '#475569',
    },
    badge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
    },
    cod: {
      backgroundColor: '#f59e0b',
    },
    upi: {
      backgroundColor: '#10b981',
    },
    badgeText: {
      color: '#ffffff',
      fontWeight: '600',
      fontSize: 12,
    },
    statusRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    statusLabel: {
      fontSize: 14,
      marginRight: 6,
      fontWeight: '500',
      color: isDark ? '#cbd5e1' : '#64748b',
    },
    statusText: {
      fontSize: 14,
      fontWeight: '700',
    },
    statusConfirmed: {
      color: '#16a34a',
    },
    statusPending: {
      color: '#f97316',
    },
  });