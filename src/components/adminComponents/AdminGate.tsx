import { UserRole } from "@/prisma/generated/prisma/enums";
import { useAuth } from "@/src/context/AuthContext";
import { theme } from "@/src/theme/theme";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";

interface AdminGateProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
  fallback?: React.ReactNode;
}

/**
 * AdminGate - Restricts access to admin screens based on user role
 * SUPER_ADMIN and ADMIN can access admin dashboard
 * TECHNICIAN can access limited tech features
 * FARMER cannot access admin features
 */
export const AdminGate: React.FC<AdminGateProps> = ({
  children,
  requiredRoles = [UserRole.SUPER_ADMIN, UserRole.ADMIN],
  fallback,
}) => {
  const router = useRouter();

  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <View style={
        {
          flex: 1,
          justifyContent: "center",
          alignItems: "center"
        }
      }>
        <ActivityIndicator color={theme.colors.surface} />
      </View>
    );
  }

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.replace("/(auth)/login-screen");
    }
  }, [isAuthenticated, user]);

  if (!isAuthenticated || !user) {
    return (
      <View style={
        {
          flex: 1,
          justifyContent: "center",
          alignItems: "center"
        }
      }>
        <Text>Please log in</Text>
      </View>
    );
  }

  const hasAccess = requiredRoles.includes(user.role as UserRole);

  if (!hasAccess) {
    return (
      fallback || (
        <ScrollView style={{ flex: 1, backgroundColor: "#f8f9fa" }}>
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingTop: 100 }}>
            <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 10 }}>
              Access Denied
            </Text>
            <Text style={
              {
                fontSize: 14, color: "#666", textAlign: "center", paddingHorizontal: 20
              }}>
              Your role ({user.role}) does not have access to this feature.
            </Text>
          </View>
        </ScrollView>
      )
    );
  }

  return <>{children}</>;
};

/**
 * Hook to check if user has admin access
 */
export const useAdminAccess = (requiredRoles: UserRole[] = [UserRole.SUPER_ADMIN, UserRole.ADMIN]) => {

  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return {
      hasAccess: false,
      user: null,
      isLoading: true,
    };
  }

  const hasAccess = isAuthenticated && user && requiredRoles.includes(user.role as UserRole);

  return {
    hasAccess,
    user: user || null,
    isLoading: false,
  };
};

/**
 * Hook to check specific admin role
 */
export const useIsAdmin = () => {
  const { user } = useAuth();
  return user?.role === UserRole.ADMIN;
};

export const useIsSuperAdmin = () => {
  const { user } = useAuth();
  return user?.role === UserRole.SUPER_ADMIN;
};

export const useIsTechnician = () => {
  const { user } = useAuth();
  return user?.role === UserRole.TECHNICIAN;
};
