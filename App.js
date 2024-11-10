import React from "react";
import { StyleSheet, StatusBar, View } from "react-native";
import MusicPlayer from "./components/MusicPlayer";
import MusicPlayerCopy from "./components/MusicPlayerCopy";

const App = () => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle={"light-content"} />
      <MusicPlayer />
      {/* <MusicPlayerCopy /> */}
    </View>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
