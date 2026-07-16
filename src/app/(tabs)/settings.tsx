import { devices as initialDevices } from "@/src/data/device";
import { farms } from "@/src/data/farm";
import { useAuth } from "@/src/context/AuthContext";
import { theme } from "@/src/theme/theme";
import type { Device } from "@/src/types/device";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState, type ComponentProps } from "react";
import {
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type IconName = ComponentProps<typeof Ionicons>["name"];

type SettingRowProps = {
  icon: IconName;
  title: string;
  description?: string;
  onPress?: () => void;
  right?: React.ReactNode;
  destructive?: boolean;
};

function SettingRow({ icon, title, description, onPress, right, destructive = false }: SettingRowProps) {
  return (
    <TouchableOpacity
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress}
      onPress={onPress}
      style={styles.row}
    >
      <View style={[styles.rowIcon, destructive && styles.destructiveIcon]}>
        <Ionicons name={icon} size={20} color={destructive ? theme.colors.errorText : theme.colors.primary} />
      </View>
      <View style={styles.rowContent}>
        <Text style={[styles.rowTitle, destructive && styles.destructiveText]}>{title}</Text>
        {description ? <Text style={styles.rowDescription}>{description}</Text> : null}
      </View>
      {right ?? (onPress ? <Ionicons name="chevron-forward" size={20} color="#8ea1ac" /> : null)}
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const { signOut, user } = useAuth();
  const [farm, setFarm] = useState(farms[0]);
  const [devices, setDevices] = useState<Device[]>(initialDevices);
  const [farmModalVisible, setFarmModalVisible] = useState(false);
  const [devicesModalVisible, setDevicesModalVisible] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [saving, setSaving] = useState(false);

  const canManageFarm = ["FARMER", "ADMIN", "SUPER_ADMIN"].includes(user?.role ?? "");

  const saveFarm = () => {
    if (!farm.name.trim() || !farm.location.trim()) {
      Alert.alert("Missing details", "Farm name and location are required.");
      return;
    }

    // This screen is ready for a future PATCH /api/farms/:id call.
    setFarmModalVisible(false);
    Alert.alert("Farm details updated", "Your changes are saved in this session.");
  };

  const removeDevice = (device: Device) => {
    Alert.alert("Remove device", `Remove ${device.serialNumber} from this farm?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => setDevices((current) => current.filter((item) => item.id !== device.id)),
      },
    ]);
  };

  const performSignOut = async () => {
    try {
      setSaving(true);
      await signOut();
      router.replace("/login-screen");
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = () => {
    if (Platform.OS === "web") {
      if (globalThis.confirm("Are you sure you want to log out of your account?")) {
        void performSignOut();
      }
      return;
    }

    Alert.alert("Log out", "Are you sure you want to log out of your account?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log out",
        style: "destructive",
        onPress: () => void performSignOut(),
      },
    ]);
  };

  return (
    <>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Manage your account, farm, and monitoring setup.</Text>

        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.firstName?.[0] ?? "U"}</Text>
          </View>
          <View style={styles.profileDetails}>
            <Text style={styles.profileName}>{user ? `${user.firstName} ${user.lastName}` : "Account"}</Text>
            <Text style={styles.profileEmail}>{user?.email}</Text>
            <Text style={styles.role}>{user?.role?.replace("_", " ")}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Farm management</Text>
        <View style={styles.section}>
          <SettingRow
            icon="business-outline"
            title="Farm details"
            description={`${farm.name} · ${farm.location}`}
            onPress={canManageFarm ? () => setFarmModalVisible(true) : undefined}
            right={canManageFarm ? undefined : <Text style={styles.locked}>Owner only</Text>}
          />
          <SettingRow
            icon="hardware-chip-outline"
            title="Devices"
            description={`${devices.length} device${devices.length === 1 ? "" : "s"} connected`}
            onPress={canManageFarm ? () => setDevicesModalVisible(true) : undefined}
            right={canManageFarm ? undefined : <Text style={styles.locked}>Owner only</Text>}
          />
        </View>

        <Text style={styles.sectionTitle}>Preferences</Text>
        <View style={styles.section}>
          <SettingRow
            icon="notifications-outline"
            title="Alert notifications"
            description="Receive water-quality and device alerts"
            right={<Switch value={notificationsEnabled} onValueChange={setNotificationsEnabled} trackColor={{ true: theme.colors.primary }} />}
          />
          <SettingRow icon="lock-closed-outline" title="Change password" description="Update your account password" onPress={() => router.push("/password-reset")} />
        </View>

        <Text style={styles.sectionTitle}>Support</Text>
        <View style={styles.section}>
          <SettingRow icon="help-circle-outline" title="Help and support" description="Get help using Ayua Aquaprecition" onPress={() => Alert.alert("Help and support", "Support contact details will be available here.")} />
          <SettingRow icon="information-circle-outline" title="About" description="Ayua Aquaprecition v1.0.0" />
        </View>

        <View style={styles.section}>
          <SettingRow icon="log-out-outline" title={saving ? "Logging out..." : "Log out"} onPress={saving ? undefined : handleSignOut} destructive />
        </View>
      </ScrollView>

      <Modal animationType="slide" transparent visible={farmModalVisible} onRequestClose={() => setFarmModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Farm details</Text>
            <Text style={styles.inputLabel}>Farm name</Text>
            <TextInput value={farm.name} onChangeText={(name) => setFarm((current) => ({ ...current, name }))} style={styles.input} placeholder="Farm name" placeholderTextColor="#6a7b85" />
            <Text style={styles.inputLabel}>Location</Text>
            <TextInput value={farm.location} onChangeText={(location) => setFarm((current) => ({ ...current, location }))} style={styles.input} placeholder="City or address" placeholderTextColor="#6a7b85" />
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setFarmModalVisible(false)} style={styles.secondaryButton}><Text style={styles.secondaryButtonText}>Cancel</Text></TouchableOpacity>
              <TouchableOpacity onPress={saveFarm} style={styles.primaryButton}><Text style={styles.primaryButtonText}>Save changes</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal animationType="slide" transparent visible={devicesModalVisible} onRequestClose={() => setDevicesModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Manage devices</Text>
              <TouchableOpacity onPress={() => setDevicesModalVisible(false)}><Ionicons name="close" size={24} color={theme.colors.background} /></TouchableOpacity>
            </View>
            {devices.length ? devices.map((device) => (
              <View key={device.id} style={styles.deviceRow}>
                <View style={styles.deviceStatus}><Ionicons name="hardware-chip-outline" size={20} color={theme.colors.primary} /></View>
                <View style={styles.deviceDetails}>
                  <Text style={styles.deviceName}>{device.serialNumber}</Text>
                  <Text style={styles.deviceMeta}>{device.status} · Battery {device.batteryLevel}%</Text>
                </View>
                <TouchableOpacity onPress={() => removeDevice(device)} accessibilityLabel={`Remove ${device.serialNumber}`}><Ionicons name="trash-outline" size={20} color={theme.colors.errorText} /></TouchableOpacity>
              </View>
            )) : <Text style={styles.emptyDevices}>No devices are connected to this farm.</Text>}
            <TouchableOpacity onPress={() => Alert.alert("Add device", "Device pairing will be connected to the device API next.")} style={styles.addDeviceButton}>
              <Ionicons name="add" size={20} color={theme.colors.surface} /><Text style={styles.addDeviceText}>Connect device</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.md, paddingBottom: 40 },
  title: { color: theme.colors.surface, fontSize: 30, fontWeight: "700" },
  subtitle: { color: theme.colors.text, opacity: 0.8, marginTop: 6, marginBottom: 22 },
  profileCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#07496d", padding: 16, borderRadius: theme.radius.lg, marginBottom: 24 },
  avatar: { width: 54, height: 54, borderRadius: 27, justifyContent: "center", alignItems: "center", backgroundColor: theme.colors.accent2 },
  avatarText: { color: theme.colors.background, fontSize: 22, fontWeight: "700" },
  profileDetails: { marginLeft: 14, flex: 1 },
  profileName: { color: theme.colors.surface, fontSize: 18, fontWeight: "700" },
  profileEmail: { color: theme.colors.text, marginTop: 3 },
  role: { alignSelf: "flex-start", color: theme.colors.accent2, fontSize: 12, fontWeight: "700", marginTop: 6, textTransform: "capitalize" },
  sectionTitle: { color: theme.colors.accent2, fontSize: 13, fontWeight: "700", letterSpacing: 0.6, marginBottom: 8, marginTop: 14, textTransform: "uppercase" },
  section: { backgroundColor: theme.colors.surface, borderRadius: theme.radius.lg, overflow: "hidden" },
  row: { minHeight: 68, flexDirection: "row", alignItems: "center", paddingHorizontal: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#d9e0e4" },
  rowIcon: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", backgroundColor: "#dff2f2", marginRight: 12 },
  destructiveIcon: { backgroundColor: theme.colors.errorBackground },
  rowContent: { flex: 1 },
  rowTitle: { color: theme.colors.background, fontSize: 16, fontWeight: "600" },
  rowDescription: { color: "#61737d", marginTop: 3, fontSize: 13 },
  destructiveText: { color: theme.colors.errorText },
  locked: { color: "#61737d", fontSize: 12 },
  modalBackdrop: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.45)" },
  modalCard: { backgroundColor: theme.colors.surface, padding: 20, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  modalTitle: { color: theme.colors.background, fontSize: 21, fontWeight: "700", marginBottom: 18 },
  inputLabel: { color: theme.colors.background, fontWeight: "600", marginBottom: 6 },
  input: { borderWidth: 1, borderColor: "#c9d4d9", borderRadius: 10, color: theme.colors.background, paddingHorizontal: 12, paddingVertical: 11, marginBottom: 14 },
  modalActions: { flexDirection: "row", gap: 10, justifyContent: "flex-end", marginTop: 6 },
  primaryButton: { backgroundColor: theme.colors.primary, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 10 },
  primaryButtonText: { color: theme.colors.surface, fontWeight: "700" },
  secondaryButton: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 10, backgroundColor: "#e6eef1" },
  secondaryButtonText: { color: theme.colors.background, fontWeight: "700" },
  deviceRow: { flexDirection: "row", alignItems: "center", paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#d9e0e4" },
  deviceStatus: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center", backgroundColor: "#dff2f2", marginRight: 10 },
  deviceDetails: { flex: 1 },
  deviceName: { color: theme.colors.background, fontWeight: "700" },
  deviceMeta: { color: "#61737d", fontSize: 13, marginTop: 2 },
  emptyDevices: { color: "#61737d", paddingVertical: 16, textAlign: "center" },
  addDeviceButton: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 8, backgroundColor: theme.colors.primary, paddingVertical: 13, borderRadius: 10, marginTop: 16 },
  addDeviceText: { color: theme.colors.surface, fontWeight: "700" },
});
