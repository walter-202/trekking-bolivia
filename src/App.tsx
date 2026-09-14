import React from 'react';
import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import TrekkingWebApp from './TrekkingWebApp';

export default function App() {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <TrekkingWebApp
        dom={{
          matchContents: false,
        }}
        style={styles.dom}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#051712',
  },
  dom: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});
