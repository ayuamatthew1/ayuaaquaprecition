import { UserRole, UserStatus } from "@/prisma/generated/prisma/enums";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

interface AdminUserListProps {
  users: User[];
  loading?: boolean;
  onUpdateUser?: (userId: string, data: any) => Promise<void>;
  onDeleteUser?: (userId: string) => Promise<void>;
}

export const AdminUserList: React.FC<AdminUserListProps> = ({
  users,
  loading = false,
  onUpdateUser,
  onDeleteUser,
}) => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editingRole, setEditingRole] = useState<UserRole | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleRoleChange = async (user: User, newRole: UserRole) => {
    if (!onUpdateUser) return;

    setUpdatingId(user.id);
    try {
      await onUpdateUser(user.id, { role: newRole });
      setEditingRole(null);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleStatusToggle = async (user: User) => {
    if (!onUpdateUser) return;

    setUpdatingId(user.id);
    try {
      const newStatus = user.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
      await onUpdateUser(user.id, { status: newStatus });
    } finally {
      setUpdatingId(null);
    }
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case UserRole.SUPER_ADMIN:
        return "#e74c3c";
      case UserRole.ADMIN:
        return "#e67e22";
      case UserRole.TECHNICIAN:
        return "#3498db";
      case UserRole.FARMER:
        return "#27ae60";
      default:
        return "#95a5a6";
    }
  };

  const getStatusBadgeColor = (status: UserStatus) => {
    switch (status) {
      case "ACTIVE":
        return "#27ae60";
      case "SUSPENDED":
        return "#e74c3c";
      case "PENDING":
        return "#f39c12";
      default:
        return "#95a5a6";
    }
  };

  const renderUserItem = ({ item: user }: { item: User }) => (
    <TouchableOpacity
      style={styles.userItem}
      onPress={() => setSelectedUser(user)}
      disabled={updatingId === user.id}
    >
      <View style={styles.userInfo}>
        <View style={styles.userHeader}>
          <Text style={styles.userName}>
            {user.firstName} {user.lastName}
          </Text>
          <View style={[styles.badge, { backgroundColor: getRoleBadgeColor(user.role) }]}>
            <Text style={styles.badgeText}>{user.role}</Text>
          </View>
        </View>
        <Text style={styles.userEmail}>{user.email}</Text>
        <Text style={styles.userPhone}>{user.phone}</Text>
        <View style={styles.userMeta}>
          <View style={[styles.badge, { backgroundColor: getStatusBadgeColor(user.status) }]}>
            <Text style={styles.badgeText}>{user.status}</Text>
          </View>
          {user.lastLoginAt && (
            <Text style={styles.lastLogin}>
              Last login: {new Date(user.lastLoginAt).toLocaleDateString()}
            </Text>
          )}
        </View>
      </View>
      {updatingId === user.id && <ActivityIndicator />}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={users}
        renderItem={renderUserItem}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
      />

      {/* User Details Modal */}
      <Modal
        visible={selectedUser !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedUser(null)}
      >
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity
                onPress={() => setSelectedUser(null)}
                style={styles.closeButton}
              >
                <MaterialCommunityIcons name="close" size={24} color="#000" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>User Details</Text>
              <View style={{ width: 24 }} />
            </View>

            {selectedUser && (
              <View style={styles.userDetails}>
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Name</Text>
                  <Text style={styles.detailValue}>
                    {selectedUser.firstName} {selectedUser.lastName}
                  </Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Email</Text>
                  <Text style={styles.detailValue}>{selectedUser.email}</Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Phone</Text>
                  <Text style={styles.detailValue}>{selectedUser.phone}</Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Role</Text>
                  <TouchableOpacity
                    style={styles.roleSelector}
                    onPress={() => setEditingRole(editingRole ? null : selectedUser.role)}
                  >
                    <Text
                      style={[
                        styles.detailValue,
                        { color: getRoleBadgeColor(selectedUser.role) },
                      ]}
                    >
                      {selectedUser.role}
                    </Text>
                    <MaterialCommunityIcons
                      name="chevron-down"
                      size={20}
                      color={getRoleBadgeColor(selectedUser.role)}
                    />
                  </TouchableOpacity>

                  {editingRole === selectedUser.role && (
                    <View style={styles.roleOptions}>
                      {Object.values(UserRole).map((role) => (
                        <TouchableOpacity
                          key={role}
                          style={styles.roleOption}
                          onPress={() => handleRoleChange(selectedUser, role)}
                          disabled={updatingId === selectedUser.id}
                        >
                          <Text
                            style={[
                              styles.roleOptionText,
                              { color: getRoleBadgeColor(role) },
                            ]}
                          >
                            {role}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>

                <View style={styles.detailSection}>
                  <View style={styles.statusToggle}>
                    <Text style={styles.detailLabel}>Status</Text>
                    <TouchableOpacity
                      style={[
                        styles.statusButton,
                        {
                          backgroundColor:
                            selectedUser.status === "ACTIVE" ? "#27ae60" : "#e74c3c",
                        },
                      ]}
                      onPress={() => handleStatusToggle(selectedUser)}
                      disabled={updatingId === selectedUser.id}
                    >
                      <Text style={styles.statusButtonText}>{selectedUser.status}</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Joined</Text>
                  <Text style={styles.detailValue}>
                    {new Date(selectedUser.createdAt).toLocaleDateString()}
                  </Text>
                </View>

                {selectedUser.lastLoginAt && (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Last Login</Text>
                    <Text style={styles.detailValue}>
                      {new Date(selectedUser.lastLoginAt).toLocaleString()}
                    </Text>
                  </View>
                )}

                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => {
                    if (onDeleteUser) {
                      onDeleteUser(selectedUser.id);
                      setSelectedUser(null);
                    }
                  }}
                >
                  <MaterialCommunityIcons name="delete" size={20} color="#fff" />
                  <Text style={styles.deleteButtonText}>Delete User</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  userItem: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ecf0f1",
  },
  userInfo: {
    flex: 1,
  },
  userHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  userEmail: {
    fontSize: 12,
    color: "#7f8c8d",
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 12,
    color: "#7f8c8d",
    marginBottom: 6,
  },
  userMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  lastLogin: {
    fontSize: 10,
    color: "#95a5a6",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#ecf0f1",
  },
  closeButton: {
    padding: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  userDetails: {
    padding: 16,
  },
  detailSection: {
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 12,
    color: "#7f8c8d",
    fontWeight: "600",
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    color: "#2c3e50",
    fontWeight: "500",
  },
  roleSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#f8f9fa",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#ecf0f1",
  },
  roleOptions: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#ecf0f1",
    borderRadius: 6,
    overflow: "hidden",
  },
  roleOption: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#ecf0f1",
  },
  roleOptionText: {
    fontSize: 14,
    fontWeight: "500",
  },
  statusToggle: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  statusButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 12,
  },
  deleteButton: {
    flexDirection: "row",
    backgroundColor: "#e74c3c",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  deleteButtonText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 8,
  },
});
