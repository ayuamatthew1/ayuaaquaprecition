import React from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { LineChart } from 'react-native-chart-kit';

export default function AnalyticsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Water Quality Analytics</Text>

      <LineChart
        data={{
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], 
          datasets: [
            {
              data: [7.1, 7.3, 7.0, 7.5, 7.4, 7.2, 7.6],
            },
             ],
        }}
        width={Dimensions.get('window').width - 32}
        height={220}
        yAxisSuffix=" pH"
        chartConfig={{
          backgroundGradientFrom: '#003657',
          backgroundGradientTo: '#004d7a',
          decimalPlaces: 1,
          color: (opacity = 1) => `rgba(255,255,255,${opacity})`,
        }}
         bezier
        style={{
          borderRadius: 16,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f9f9fc',
  },

  title: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 24,
    color: '#003657',
  },
});