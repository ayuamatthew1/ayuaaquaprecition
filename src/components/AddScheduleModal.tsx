import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import React, { useEffect, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { theme } from "../theme/theme";

const DAYS = [
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
  "Sun",
];

interface PondOption {
  id: string;
  name: string;
}

interface Props {
  visible: boolean;
  ponds: PondOption[];
  onClose: () => void;
  onSave: (schedule: {
    pondId: string;
    feedType: string;
    quantity: number;
    unit: string;
    time: string;
    hour: number;
    minute: number;
    repeatDays: string[];
  }) => void | Promise<void>;
}

export default function AddScheduleModal({
  visible,
  ponds,
  onClose,
  onSave,
}: Props) {

  const [feedType, setFeedType] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("kg");
  const [pondId, setPondId] = useState(ponds[0]?.id || "");
  const [selectedDays, setSelectedDays] =
    useState<string[]>([]);

  const [time, setTime] = useState(new Date());

  const [showPicker, setShowPicker] =
    useState(false);

  useEffect(() => {
    if (ponds.length > 0 && !ponds.some((pond) => pond.id === pondId)) {
      setPondId(ponds[0].id);
    }
  }, [pondId, ponds]);

  const toggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(
        selectedDays.filter((d) => d !== day)
      );
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const handleSave = async () => {
    const formattedTime = time.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    await onSave({
      pondId,
      feedType,
      quantity: Number(quantity),
      unit,
      time: formattedTime,
      hour: time.getHours(),
      minute: time.getMinutes(),
      repeatDays: selectedDays,
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
                Add Feeding Schedule
              </Text>

              <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
              >
                <TextInput
                  placeholder="Feed Type"
                  value={feedType}
                  onChangeText={() => setFeedType}
                  style={styles.input}
                />

                <Text style={styles.sectionTitle}>
                  Select Pond
                </Text>

                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={pondId}
                    onValueChange={(itemValue) =>
                      setPondId(itemValue)
                    }
                  >
                    {ponds.map((item) => (
                      <Picker.Item
                        key={item.id}
                        label={item.name}
                        value={item.id}
                      />
                    ))}
                  </Picker>
                </View>

                <View >
                  <TextInput
                    placeholder="Quantity"
                    value={quantity}
                    onChangeText={setQuantity}
                    keyboardType="numeric"
                    style={styles.input}
                  />

                  <Text style={styles.sectionTitle}>
                    Select Unit
                  </Text>

                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={unit}
                      onValueChange={(itemValue) =>
                        setUnit(itemValue)
                      }
                    >
                      <Picker.Item
                        label={'kilograms'}
                        value={'kg'}
                      />
                      <Picker.Item
                        label={'grams'}
                        value={'g'}
                      />
                    </Picker>
                  </View>

                </View>

                <TouchableOpacity
                  style={styles.timeButton}
                  onPress={() => setShowPicker(true)}
                >
                  <Text style={styles.timeText}>
                    Feeding Time:
                    {" "}
                    {time.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                </TouchableOpacity>

                {showPicker && (
                  <DateTimePicker
                    value={time}
                    mode="time"
                    is24Hour={false}
                    display={
                      Platform.OS === "ios"
                        ? "spinner"
                        : "default"
                    }
                    onChange={(event, selected) => {
                      setShowPicker(false);

                      if (selected) {
                        setTime(selected);
                      }
                    }}
                  />
                )}

                <Text style={styles.sectionTitle}>
                  Repeat Days
                </Text>

                <View style={styles.daysContainer}>
                  {DAYS.map((day) => (
                    <TouchableOpacity
                      key={day}
                      style={[
                        styles.dayChip,
                        selectedDays.includes(day) &&
                        styles.selectedDay,
                      ]}
                      onPress={() => toggleDay(day)}
                    >
                      <Text
                        style={{
                          color:
                            selectedDays.includes(day)
                              ? "#fff"
                              : theme.colors.surface,
                        }}
                      >
                        {day}
                      </Text>
                    </TouchableOpacity>
                  ))}
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
                      Save Schedule
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
    backgroundColor: theme.colors.secondary,
    borderRadius: 20,
    padding: 20,
  },

  scrollContent: {
    paddingBottom: 20,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    color: theme.colors.surface,
    marginBottom: 20,
  },

  input: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },

  timeButton: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
  },

  timeText: {
    fontWeight: "600",
  },

  sectionTitle: {
    color: theme.colors.surface,
    fontWeight: "700",
    marginBottom: 10,
  },

  pickerContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 12,
  },

  daysContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  dayChip: {
    borderWidth: 1,
    borderColor: theme.colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },

  selectedDay: {
    backgroundColor: theme.colors.primary,
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
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },

  saveText: {
    color: "#fff",
    fontWeight: "700",
  },
});