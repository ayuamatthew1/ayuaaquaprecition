// import { registerationRequest } from "@/src/api/auth.api";
import FormInput from "@/src/components/FormInput";
import PasswordInput from "@/src/components/PasswordInput";
import { theme } from "@/src/theme/theme";
import { getApiUrl } from "@/src/lib/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Alert,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { z } from "zod";

const schema = z
  .object({
    firstName: z.string().min(2, "First name is required"),
    lastName: z.string().min(2, "Last name is required"),
    username: z.string().min(3, "Username is required"),
    email: z.string().email("Enter a valid email"),
    phone: z.string().min(7, "Phone number is required"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterForm = z.infer<typeof schema>;

export default function RegisterScreen() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const { control, handleSubmit, reset, formState: { errors }, } = useForm<RegisterForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: "",
      lastName: "",
      username: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(data: RegisterForm) {
    try {
      setLoading(true);

      const response = await fetch(getApiUrl("/api/auth/register"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Something went wrong.");
      }

      const result = await response.json();

      setMessage(result.message || "Account created successfully.");
      Alert.alert(
        "Success",
        result.message || "Account created successfully."
      );

      reset();

      router.replace("/login-screen");
    } catch (error: any) {
      setMessage(error.message || "Something went wrong.");
      console.error("Registration error:", error);
      Alert.alert(
        "Registration Failed",
        error.message || "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAwareScrollView
      bottomOffset={20}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={styles.container}
    >
      <Text style={styles.title}>Create Account</Text>

      <Text style={styles.subtitle}>
        Create your hatchery monitoring account.
      </Text>

      <Controller
        control={control}
        name="firstName"
        render={({ field: { value, onChange } }) => (
          <FormInput
            label="First Name"
            placeholder="John"
            value={value}
            onChangeText={onChange}
            error={errors.firstName?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="lastName"
        render={({ field: { value, onChange } }) => (
          <FormInput
            label="Last Name"
            placeholder="Doe"
            value={value}
            onChangeText={onChange}
            error={errors.lastName?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="username"
        render={({ field: { value, onChange } }) => (
          <FormInput
            label="Username"
            placeholder="johndoe"
            autoCapitalize="none"
            value={value}
            onChangeText={onChange}
            error={errors.username?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="email"
        render={({ field: { value, onChange } }) => (
          <FormInput
            label="Email"
            placeholder="john@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            value={value}
            onChangeText={onChange}
            error={errors.email?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="phone"
        render={({ field: { value, onChange } }) => (
          <FormInput
            label="Phone Number"
            placeholder="08012345678"
            keyboardType="phone-pad"
            value={value}
            onChangeText={onChange}
            error={errors.phone?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="password"
        render={({ field: { value, onChange } }) => (
          <PasswordInput
            label="Password"
            placeholder="********"
            value={value}
            onChangeText={onChange}
            error={errors.password?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="confirmPassword"
        render={({ field: { value, onChange } }) => (
          <PasswordInput
            label="Confirm Password"
            placeholder="********"
            value={value}
            onChangeText={onChange}
            error={errors.confirmPassword?.message}
          />
        )}
      />
      {
        Platform.OS === 'web' && (
          <Text style={{ color: 'red', marginBottom: 10 }}>
            {message ? message : ''}
          </Text>
        )
      }
      <TouchableOpacity
        style={[
          styles.button,
          loading && styles.buttonDisabled,
        ]}
        disabled={loading}
        onPress={handleSubmit(onSubmit)}
      >
        {loading ? (
          <ActivityIndicator color={theme.colors.surface} />
        ) : (
          <Text style={styles.buttonText}>
            Create Account
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.replace("/login-screen")}
      >
        <Text style={styles.link}>
          Already have an account? Login
        </Text>
      </TouchableOpacity>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: theme.colors.background,
  },

  title: {
    fontSize: 32,
    fontWeight: "700",
    color: theme.colors.primary,
  },

  subtitle: {
    marginTop: 8,
    marginBottom: 28,
    fontSize: 15,
    color: "#666",
  },

  button: {
    marginTop: 12,
    backgroundColor: theme.colors.primary,
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: "center",
  },

  buttonDisabled: {
    opacity: 0.7,
  },

  buttonText: {
    color: theme.colors.surface,
    fontSize: 16,
    fontWeight: "700",
  },

  link: {
    textAlign: "center",
    marginTop: 24,
    color: theme.colors.primary,
    fontWeight: "600",
  },
});
