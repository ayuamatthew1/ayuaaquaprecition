import React, { useState } from "react";
import {
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import DateTimePicker from "@react-native-community/datetimepicker";
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

interface Props {
  visible: boolean;
  onClose: () => void;
  onSave: (schedule: {
    pond: string;
    feedType: string;
    quantity: number;
    unit: string;
    time: string;
    hour: number;
    minute: number;
    repeatDays: string[];
  }) => void;
}

export default function AddScheduleModal({
  visible,
  onClose,
  onSave,
}: Props) {

  const [feedType, setFeedType] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit] = useState("kg");

  const [selectedDays, setSelectedDays] =
    useState<string[]>([]);

  const [time, setTime] = useState(new Date());

  const [showPicker, setShowPicker] =
    useState(false);

  const toggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(
        selectedDays.filter((d) => d !== day)
      );
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const handleSave = () => {
    const formattedTime = time.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    onSave({
      pond: "Pond 1",

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
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>
            Add Feeding Schedule
          </Text>

          <TextInput
            placeholder="Feed Type"
            value={feedType}
            onChangeText={setFeedType}
            style={styles.input}
          />

          <TextInput
            placeholder="Quantity"
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="numeric"
            style={styles.input}
          />

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
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#00000088",
  },

  container: {
    margin: 20,
    backgroundColor: theme.colors.secondary,
    borderRadius: 20,
    padding: 20,
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