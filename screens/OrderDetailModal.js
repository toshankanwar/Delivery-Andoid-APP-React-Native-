import React, { useContext, useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Alert,
  Image,
  StyleSheet,
  Platform,
} from "react-native";
import axios from "axios";
import { db } from "../firebase";
import { doc, updateDoc } from "firebase/firestore";
import { ThemeContext } from "../context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";

export default function OrderDetailModal({ order, onClose }) {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === "dark";
  const [otp, setOtp] = useState("");
  const [result, setResult] = useState("");

  const customerName = order?.address?.name || "Customer";
  const customerEmail = order?.userEmail || "N/A";
  const profileImage = "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";
  const orderId = order?.id || "";
  const orderIdShort = orderId.slice(orderId.length - 8);

  const itemsStr = order.items?.length > 0
    ? order.items.map(function (i) {
        return (i.name || "Item") + (i.qty ? " ×" + i.qty : "");
      }).join(", ")
    : "N/A";

  const paymentStatus = (order?.paymentStatus || "Pending").toLowerCase();
  const isDelivered = order?.delivered || (order.orderStatus || "").toLowerCase() === "delivered";
  const total =
    typeof order.total === "number"
      ? order.total
      : typeof order.totalAmount === "number"
      ? order.totalAmount
      : 0;

  const sendOtp = async () => {
    setResult("Sending...");
    console.log("📤 Sending OTP to:", customerEmail, "for order:", orderId);
    try {
      const res = await axios.post("https://delivery-app-otp-verifier.onrender.com/send-otp", {
        orderId: orderId,
        email: customerEmail,
      });
      console.log("✅ OTP Send Response:", res.data);
      if (res.data && res.data.success) {
        setResult("OTP sent to customer's email.");
      } else {
        setResult("Failed to send OTP.");
      }
    } catch (err) {
      console.error("❌ Error in send-otp:", err.message);
      if (err.response?.data) {
        console.error("⚠ Backend Error Message:", err.response.data);
      }
      setResult("Error sending OTP.");
    }
  };

  const verifyOtp = async () => {
    setResult("Verifying...");
    console.log("🔍 Verifying OTP for order:", orderId, "Entered OTP:", otp);
    try {
      const res = await axios.post("https://delivery-app-otp-verifier.onrender.com/verify-otp", {    //const res = await axios.post("http://192.168.1.103:5000/verify-otp", { use computers ip address go to terminal and ipconfig
        orderId: orderId,
        otp: otp,
      });
      console.log("✅ OTP Verification Result:", res.data);
      if (res.data.valid) {
        setResult("OTP Verified!");
        console.log("✅ Updating Firestore status...");
        await updateDoc(doc(db, "orders", orderId), {
          delivered: true,
          paymentStatus: "confirmed",
          orderStatus: "delivered",
        });
        console.log("✅ Order marked as delivered. Closing modal...");
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setResult("Invalid or expired OTP.");
      }
    } catch (err) {
      console.error("❌ Error verifying OTP:", err.message);
      if (err.response?.data) {
        console.error("⚠ Backend Verification Error:", err.response.data);
      }
      setResult("Verification error.");
    }
  };

  const styles = getStyles(isDark);

  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.card}>
              <View style={styles.headerRow}>
                <Image source={{ uri: profileImage }} style={styles.avatar} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.name}>{customerName}</Text>
                  <Text style={styles.email}>{customerEmail}</Text>
                </View>
                <View style={styles.idBox}>
                  <Ionicons
                    name="document-text-outline"
                    size={14}
                    color={isDark ? "#fef08a" : "#7c3aed"}
                  />
                  <Text style={styles.orderIdTxt}>#{orderIdShort}</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <Text style={styles.label}>Items: <Text style={styles.value}>{itemsStr}</Text></Text>
              <Text style={styles.label}>Total: <Text style={styles.value}>₹{total.toFixed(2)}</Text></Text>
              <Text style={styles.label}>Payment: <Text style={[styles.value, paymentStatus === "confirmed" ? styles.paid : styles.pending]}>
                {paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1)}
              </Text></Text>
              <Text style={styles.label}>Delivery: <Text style={styles.value}>{isDelivered ? "Delivered" : "Pending"}</Text></Text>

              <View style={styles.divider} />

              <TouchableOpacity style={styles.actionBtn} onPress={sendOtp}>
                <Ionicons name="send" color="#6366f1" size={18} style={{ marginRight: 8 }} />
                <Text style={styles.btnLabel}>Send OTP to Customer</Text>
              </TouchableOpacity>

              <TextInput
                placeholder="Enter OTP"
                value={otp}
                onChangeText={setOtp}
                keyboardType="numeric"
                placeholderTextColor={isDark ? "#aaa" : "#666"}
                style={styles.otpInput}
              />

              <TouchableOpacity style={[styles.actionBtn, { marginBottom: 6 }]} onPress={verifyOtp}>
                <Ionicons name="checkmark-circle-outline" size={20} color="#059669" style={{ marginRight: 8 }} />
                <Text style={[styles.btnLabel, { color: "#059669" }]}>Verify OTP</Text>
              </TouchableOpacity>

              {result ? (
                <View style={{
                  marginTop: 8,
                  padding: 8,
                  borderRadius: 6,
                  backgroundColor: result.includes("error") || result.includes("Failed") ? "#fee2e2" : "#dbeafe"
                }}>
                  <Text style={{
                    color: result.includes("error") || result.includes("Failed") ? "#dc2626" : "#2563eb",
                    fontWeight: "600",
                    textAlign: "center"
                  }}>
                    {result}
                  </Text>
                </View>
              ) : null}

              <View style={styles.divider} />

              {/* ⚠ Removed manual delivery button */}
              {/* It now happens automatically after OTP verification */}

              <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                <Text style={styles.closeBtnTxt}>Close</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

// 🎨 getStyles function (unchanged)
const getStyles = (isDark) =>
  StyleSheet.create({
    overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", alignItems: "center" },
    card: { backgroundColor: isDark ? "#1e293b" : "#ffffff", borderRadius: 18, padding: 22, width: "90%" },
    headerRow: { flexDirection: "row", alignItems: "center" },
    avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 10 },
    name: { fontSize: 18, fontWeight: "bold", color: isDark ? "#f8fafc" : "#1e293b" },
    email: { fontSize: 13, color: isDark ? "#cbd5e1" : "#64748b" },
    idBox: {
      flexDirection: "row",
      alignItems: "center",
      marginLeft: "auto",
      backgroundColor: isDark ? "#334155" : "#f1f5f9",
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 8,
    },
    orderIdTxt: { marginLeft: 4, fontSize: 12, color: isDark ? "#fde68a" : "#7c3aed", fontWeight: "600" },
    divider: { height: 1, backgroundColor: isDark ? "#334155" : "#e2e8f0", marginVertical: 12 },
    label: { fontSize: 15, fontWeight: "600", color: isDark ? "#cbd5e1" : "#1e293b", marginBottom: 4 },
    value: { fontWeight: "400", color: isDark ? "#fefce8" : "#1e293b" },
    paid: { color: "#16a34a" },
    pending: { color: "#f97316" },
    actionBtn: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: isDark ? "#334155" : "#f9fafb",
      borderRadius: 10,
      paddingVertical: 10,
      paddingHorizontal: 14,
      borderWidth: 1,
      borderColor: isDark ? "#475569" : "#cbd5e1",
      marginTop: 8,
      justifyContent: "center",
    },
    btnLabel: { fontSize: 15, fontWeight: "600" },
    otpInput: {
      borderWidth: 1,
      borderColor: isDark ? "#6366f1" : "#d1d5db",
      marginVertical: 10,
      padding: Platform.OS === "ios" ? 10 : 8,
      borderRadius: 8,
      fontSize: 16,
      color: isDark ? "#f1f5f9" : "#1e293b",
      fontWeight: "600",
      backgroundColor: isDark ? "#1e293b" : "#f9fafb",
      textAlign: "center",
      letterSpacing: 1.5,
    },
    closeBtn: { marginTop: 16, alignSelf: "center" },
    closeBtnTxt: { fontSize: 16, fontWeight: "700", color: isDark ? "#e2e8f0" : "#334155" },
  });