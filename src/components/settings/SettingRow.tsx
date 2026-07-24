import { theme } from "@/src/theme/theme";
import { Ionicons } from "@expo/vector-icons";
import { ComponentProps } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type IconName = ComponentProps<typeof Ionicons>["name"];

type SettingRowProps = {
  icon: IconName;
  title: string;
  description?: string;
  onPress?: () => void;
  right?: React.ReactNode;
  destructive?: boolean;
};

export default function SettingRow({ icon, title, description, onPress, right, destructive = false }: SettingRowProps) {
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


const styles = StyleSheet.create({
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#dff2f2",
    marginRight: 12
  },
  destructiveText: { color: theme.colors.errorText },
  row: { minHeight: 68, flexDirection: "row", alignItems: "center", paddingHorizontal: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#d9e0e4" },

  destructiveIcon: { backgroundColor: theme.colors.errorBackground },
  rowContent: { flex: 1 },
  rowTitle: { color: theme.colors.background, fontSize: 16, fontWeight: "600" },
  rowDescription: { color: "#61737d", marginTop: 3, fontSize: 13 },
});
