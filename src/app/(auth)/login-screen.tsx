import { Images } from "@/src/constants/images";
import { useAuth } from "@/src/context/AuthContext";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { theme } from "../../theme/theme";

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleLogin = async () => {
    try {
      setLoading(true);
      setMessage("");
      await signIn(identifier, password);
      router.replace("/");

    } catch (error: any) {
      if (Platform.OS === "web") {
        setMessage(error.message ?? "Invalid email or password.");
      } else {
        Alert.alert(
          "Login Failed",
          error.message ?? "Invalid email or password."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Image source={Images.logo} style={styles.logo} />
      <Text style={styles.title}>Welcome Back</Text>

      <TextInput
        placeholder="Email | Phone"
        style={styles.input}
        value={identifier}
        onChangeText={setIdentifier}
      />

      <TextInput
        placeholder="Password"
        style={styles.input}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {message ? <Text style={styles.message}>{message}</Text> : null}
      <TouchableOpacity
        onPress={handleLogin}
        style={styles.button}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Login</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/register")}>
        <Text style={styles.registerButtonText}>
          Don&apos;t have an account? Register
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: theme.colors.background,
  },

  title: {
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 24,
    color: theme.colors.primary,
  },

  input: {
    backgroundColor: theme.colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#ddd",
  },

  button: {
    backgroundColor: theme.colors.primary,
    padding: 18,
    borderRadius: 14,
    alignItems: "center",
  },

  buttonText: {
    color: theme.colors.surface,
    fontSize: 16,
    fontWeight: "700",
  },

  registerButtonText: {
    color: theme.colors.primary,
    margin: 10,
    fontSize: 16,
  },

  logo: {
    width: 100,
    height: 100,
    alignSelf: "center",
    marginBottom: 20,
    borderRadius: 20,
  },
  message: {
    color: theme.colors.errorText,
    textAlign: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.colors.errorText,
    padding: 8,
    borderRadius: 8,
  },
});
