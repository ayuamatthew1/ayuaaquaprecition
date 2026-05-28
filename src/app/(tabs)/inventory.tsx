import React from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const fishData = [
  {
    id: '1',
    species: 'Catfish',
    quantity: 1200,
  },
  {
    id: '2',
    species: 'Tilapia',
    quantity: 800,
  },
];

export default function InventoryScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Fish Inventory</Text>

      <FlatList
        data={fishData}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.species}>{item.species}</Text>
            <Text style={styles.quantity}>
              {item.quantity} Fish
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f9f9fc',
  },

  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 20,
    color: '#003657',
  },

  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
  },

  species: {
    fontSize: 20,
    fontWeight: '700',
  },

  quantity: {
    marginTop: 8,
    fontSize: 16,
    color: '#555',
  },
});