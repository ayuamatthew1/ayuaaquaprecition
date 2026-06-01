import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { theme } from "../theme/theme";
interface AlertComponentProps {
  alert: string;
  recommendation: string;
}

export default function AlertComponent({
  alert,
  recommendation,
}: AlertComponentProps) {
  return (
    <View style={styles.alertContainer}>
      <View style={styles.alertCard}>
        <Ionicons style={styles.alertIcon} name="warning" size={30} color={theme.colors.errorText} />
        <Text style={styles.alertTitle}>Alert</Text>
        <Text style={styles.alertText}>{alert}</Text>
      </View>
      <View style={styles.recomCard}>
        <Ionicons style={styles.recomIcon} name="bulb" size={30} color={theme.colors.surface} />
        <Text style={styles.recomTitle}>Action</Text>
        <Text style={styles.recomText}>{recommendation}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  alertContainer: {
    // backgroundColor: theme.colors.secondary,
    padding: 8,
    borderRadius: 16,
    marginBottom: -10,
  },

  alertCard: {
    backgroundColor: theme.colors.errorBackground,
    padding: 20,
    borderRadius: 16,
    // marginBottom: -12,
  },
  alertIcon: {
    position: "absolute",
    top: 13,
    left: 20,
  },
  alertTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: theme.colors.errorText,
    marginBottom: 10,
    marginLeft: 35,
  },

  alertText: {
    color: theme.colors.errorText,
    fontSize: 16,
  },

  recomCard: {
    backgroundColor: theme.colors.successBackground,
    padding: 20,
    // borderRadius: 16,
    position: "relative",
    top: -15,
  },
  recomIcon: {
    position: "absolute",
    top: 13,
    left: 20,
    color: theme.colors.warning,
  },
  recomTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: theme.colors.successText,
    marginBottom: 10,
    marginLeft: 35,
  },
  recomText: {
    color: theme.colors.successText,
    fontSize: 16,
  },

});
