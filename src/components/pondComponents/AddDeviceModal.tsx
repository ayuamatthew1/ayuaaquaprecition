import { Picker } from "@react-native-picker/picker";
import React, { useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from "react-native";
import { theme } from "../../theme/theme";

interface Device { id: string, name: string }


interface Props {
  visible: boolean;
  pondId: string;
  devices: Device[]
  onClose: () => void;
  onSave: (pondId: string, deviceId: string) => void | Promise<void>;
}

export default function AddFishModal({
  visible,
  pondId,
  devices,
  onClose,
  onSave,
}: Props) {

  const [deviceId, setDeviceId] = useState('')

  const handleSave = async () => {
    await onSave(pondId, deviceId);

    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.overlay}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.centeredView}>
            <View style={styles.container}>
              <Text style={styles.title}>
                Select A Device
              </Text>

              <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
              >
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={deviceId}
                    onValueChange={(itemValue) =>
                      setDeviceId(itemValue)
                    }
                  >
                    {devices.length === 0 ?
                      <Text>No Available device</Text>
                      : devices.map((item) => (
                        <Picker.Item
                          key={item.id}
                          label={item.name}
                          value={item.id}
                        />
                      ))}
                  </Picker>
                </View>


                <View style={styles.buttons}>
                  <TouchableOpacity
                    onPress={onClose}
                  >
                    <Text style={styles.cancel}>
                      Cancel
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.saveBtn}
                    onPress={handleSave}
                  >
                    <Text style={styles.saveText}>
                      Add
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#00000088",
  },

  centeredView: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },

  container: {
    width: "100%",
    maxHeight: "90%",
    backgroundColor: theme.colors.primary,
    borderRadius: 20,
    padding: 20,
  },

  pickerContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 12,
    borderColor: "#dcdcdc"
  },

  scrollContent: {
    paddingBottom: 10,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    color: theme.colors.surface,
    marginBottom: 20,
  },

  row: {
    flexDirection: "row",
    gap: 8,
  },

  buttons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
  },

  cancel: {
    color: "#F44336",
    fontWeight: "700",
  },

  saveBtn: {
    backgroundColor: theme.colors.secondary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },

  saveText: {
    color: "#fff",
    fontWeight: "700",
  },
});