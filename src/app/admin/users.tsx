import { UserRole } from "@/prisma/generated/prisma/enums";
import { AdminUserList } from "@/src/components/adminComponents/AdminUserList";
import { useAuth } from "@/src/context/AuthContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function AdminUsersScreen() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | null>(null);

  const { authenticatedFetch } = useAuth()

  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        ...(roleFilter && { role: roleFilter }),
      });

      const response = await authenticatedFetch(`/api/admin/users?${params}`);

      if (!response.ok) throw new Error("Failed to fetch users");

      const json = await response.json();
      if (json.success && json.data) {
        setUsers(json.data.users);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };


  useEffect(() => {
    fetchUsers();
  }, [page, roleFilter]);

  const handleUpdateUser = async (userId: string, data: any) => {
    try {
      const response = await authenticatedFetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Failed to update user");

      // Refresh the list
      fetchUsers();
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const response = await authenticatedFetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete user");

      // Refresh the list
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchUsers();
  };

  const filteredUsers = users.filter(
    (user) =>
      user.firstName.toLowerCase().includes(filter.toLowerCase()) ||
      user.lastName.toLowerCase().includes(filter.toLowerCase()) ||
      user.email.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <View>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Users Management</Text>
          <Text style={styles.subtitle}>Manage user roles and status</Text>
        </View>

        <View style={styles.filters}>
          <View style={styles.searchBox}>
            <MaterialCommunityIcons name="magnify" size={20} color="#7f8c8d" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search users..."
              value={filter}
              onChangeText={setFilter}
              placeholderTextColor="#bdc3c7"
            />
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.roleFilters}>
            <TouchableOpacity
              style={[
                styles.roleFilter,
                !roleFilter && styles.roleFilterActive,
              ]}
              onPress={() => setRoleFilter(null)}
            >
              <Text
                style={[
                  styles.roleFilterText,
                  !roleFilter && styles.roleFilterTextActive,
                ]}
              >
                All
              </Text>
            </TouchableOpacity>
            {Object.values(UserRole).map((role) => (
              <TouchableOpacity
                key={role}
                style={[
                  styles.roleFilter,
                  roleFilter === role && styles.roleFilterActive,
                ]}
                onPress={() => setRoleFilter(role)}
              >
                <Text
                  style={[
                    styles.roleFilterText,
                    roleFilter === role && styles.roleFilterTextActive,
                  ]}
                >
                  {role}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <ScrollView
          style={styles.content}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#3498db" />
            </View>
          ) : (
            <View style={styles.listContainer}>
              <AdminUserList
                users={filteredUsers}
                loading={loading}
                onUpdateUser={handleUpdateUser}
                onDeleteUser={handleDeleteUser}
              />
              {filteredUsers.length === 0 && (
                <View style={styles.emptyContainer}>
                  <MaterialCommunityIcons name="account" size={48} color="#bdc3c7" />
                  <Text style={styles.emptyText}>No users found</Text>
                </View>
              )}
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#ecf0f1",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: "#7f8c8d",
  },
  filters: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#ecf0f1",
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#ecf0f1",
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    color: "#2c3e50",
    fontSize: 14,
  },
  roleFilters: {
    marginTop: 8,
  },
  roleFilter: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#ecf0f1",
    marginRight: 8,
  },
  roleFilterActive: {
    backgroundColor: "#3498db",
    borderColor: "#3498db",
  },
  roleFilterText: {
    color: "#7f8c8d",
    fontSize: 12,
    fontWeight: "600",
  },
  roleFilterTextActive: {
    color: "#fff",
  },
  content: {
    flex: 1,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 300,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 300,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    color: "#7f8c8d",
  },
});
