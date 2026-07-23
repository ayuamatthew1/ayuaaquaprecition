import React, { useState } from "react";
import {
  ActivityIndicator,
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
import FormInput from "../FormInput";



interface Props {
  visible: boolean;
  pondId: string;
  onClose: () => void;
  onSave: (fishBatch: {
    pondId: string;
    species: string
    breed: string;
    quantity: number;
    source?: string;
    averageWight?: number;
  }) => void | Promise<void>;
}

export default function AddFishModal({
  visible,
  pondId,
  onClose,
  onSave,
}: Props) {

  const [species, setSpecie] = useState("");
  const [breed, setBreed] = useState("");
  const [source, setSource] = useState("");
  const [quantity, setQuantity] = useState("");
  const [averageWeight, setAverageWeight] = useState("");
  const [saving, setSaving] = useState(false)


  const handleSave = async () => {
    console.log("Creating Batch data with: ", quantity, species, breed, pondId)
    setSaving(true)
    await onSave({
      pondId,
      quantity: Number(quantity),
      source,
      species,
      breed,
      averageWight: Number(averageWeight)
    });

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
                Create Fish Batch
              </Text>

              <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
              >
                <FormInput
                  label="Fish Species *"
                  value={species}
                  placeholder="Species eg. Catfish..."
                  onChangeText={setSpecie}
                />
                <FormInput
                  label="FIsh bread (Optional)"
                  value={breed}
                  placeholder="Breed eg. Clarias gariepinus..."
                  onChangeText={setBreed}
                />
                <FormInput
                  label="Source of fish"
                  value={source}
                  placeholder="Source eg. hatching.."
                  onChangeText={setSource}
                />
                <View style={styles.row}>
                  <View style={{ flex: 1 }}>
                    <FormInput
                      label="FIsh Quantity"
                      value={quantity}
                      placeholder="Quantity eg. 200.."
                      onChangeText={setQuantity}
                      keyboardType="numeric"
                    />
                  </View>

                  <View style={{ flex: 1 }}>
                    <FormInput
                      label="Average Weight"
                      value={averageWeight}
                      placeholder="Average eg. 0.5..)"
                      onChangeText={setAverageWeight}
                      keyboardType="numeric"
                    />
                  </View>
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
                    disabled={saving}
                  >
                    <Text style={styles.saveText}>
                      {saving ? <ActivityIndicator /> : " Create Batch"}
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
    flex: 1,
    flexDirection: "row",
    gap: 4,
    // maxWidth: "90%"
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