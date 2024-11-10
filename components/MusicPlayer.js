import React, { useRef, useState, useEffect } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Dimensions,
  View,
  TouchableOpacity,
  Image,
  Text,
  Animated,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Slider from "@react-native-community/slider";
import songs from "../model/data";
import TrackPlayer, {
  Capability,
  Event,
  RepeatMode,
  State,
  useProgress,
  useTrackPlayerEvents,
} from "react-native-track-player";

const { width } = Dimensions.get("window");

const setupPlayer = async () => {
  const isSetup = await TrackPlayer.isServiceRunning();
  if (isSetup) return;

  await TrackPlayer.setupPlayer();
  await TrackPlayer.add(songs);
  await TrackPlayer.setRepeatMode(RepeatMode.Off);
};

const MusicPlayer = () => {
  const { position, duration } = useProgress();
  const scrollX = useRef(new Animated.Value(0)).current;
  const [songIndex, setSongIndex] = useState(0);
  const [expectedState, setExpectedState] = useState(State.Paused); // Track expected play/pause state
  const [repeatMode, setRepeatMode] = useState("off");
  const songSlider = useRef(null);

  const repeatIcon = () => {
    if (repeatMode == "off") {
      return "repeat-off";
    }
    if (repeatMode == "track") {
      return "repeat-once";
    }
    if (repeatMode == "repeat") {
      return "repeat";
    }
  };

  const changeRepeatMode = () => {
    if (repeatMode == "off") {
      TrackPlayer.setRepeatMode(RepeatMode.Track);
      setRepeatMode("track");
    }
    if (repeatMode == "track") {
      TrackPlayer.setRepeatMode(RepeatMode.Queue);
      setRepeatMode("repeat");
    }
    if (repeatMode == "repeat") {
      TrackPlayer.setRepeatMode(RepeatMode.Off);
      setRepeatMode("off");
    }
  };

  const skipTo = async (trackId) => {
    await TrackPlayer.skip(trackId);
  };

  useEffect(() => {
    const initPlayer = async () => {
      await setupPlayer();
      await TrackPlayer.play();
      setExpectedState(State.Playing); // Start in playing mode
    };
    initPlayer();

    scrollX.addListener(({ value }) => {
      const index = Math.round(value / width);
      skipTo(index);
      setSongIndex(index);
    });

    return () => {
      scrollX.removeAllListeners();
    };
  }, []);

  useTrackPlayerEvents([Event.PlaybackActiveTrackChanged], async (event) => {
    if (
      event.type === Event.PlaybackActiveTrackChanged &&
      event.nextTrack != null
    ) {
      const trackIndex = await TrackPlayer.getActiveTrackIndex();
      setSongIndex(trackIndex);
    }
  });

  const togglePlayback = async () => {
    const state = await TrackPlayer.getState();
    if (state === State.Paused || state === State.Ready) {
      setExpectedState(State.Playing); // Assume play
      await TrackPlayer.play();
    } else if (state === State.Playing) {
      setExpectedState(State.Paused); // Assume pause
      await TrackPlayer.pause();
    }
  };

  const skipToNext = () => {
    songSlider.current.scrollToOffset({
      offset: (songIndex + 1) * width,
    });
  };

  const skipToPrevious = () => {
    songSlider.current.scrollToOffset({
      offset: (songIndex - 1) * width,
    });
  };

  const renderSongs = ({ index, item }) => (
    <Animated.View
      style={{ width: width, justifyContent: "center", alignItems: "center" }}
    >
      <View style={styles.artworkWrapper}>
        <Image source={item.image} style={styles.artworkImg} />
      </View>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.maincontainer}>
        <View style={{ width: width }}>
          <Animated.FlatList
            ref={songSlider}
            data={songs}
            renderItem={renderSongs}
            keyExtractor={(item) => item.id}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            scrollEventThrottle={16}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: true }
            )}
          />
        </View>
        <View>
          <Text style={styles.title}>{songs[songIndex].title}</Text>
          <Text style={styles.artist}>{songs[songIndex].artist}</Text>
        </View>
        <View>
          <Slider
            style={styles.progressContainer}
            value={position}
            minimumValue={0}
            maximumValue={duration}
            thumbTintColor="#FFD369"
            minimumTrackTintColor="#FFD369"
            maximumTrackTintColor="#FFF"
            onSlidingComplete={async (value) => {
              await TrackPlayer.seekTo(value);
            }}
          />
        </View>
        <View style={styles.progressLabelContainer}>
          <Text style={styles.progressLabelText}>
            {Math.floor(position / 60)}:
            {Math.floor(position % 60)
              .toString()
              .padStart(2, "0")}
          </Text>
          <Text style={styles.progressLabelText}>
            {Math.floor(duration / 60)}:
            {Math.floor(duration % 60)
              .toString()
              .padStart(2, "0")}
          </Text>
        </View>
        <View style={styles.musicControls}>
          <TouchableOpacity onPress={skipToPrevious}>
            <Ionicons
              name="play-skip-back-outline"
              size={35}
              color="#FFD369"
              style={{ marginTop: 10 }}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={togglePlayback}>
            <Ionicons
              name={expectedState === State.Playing ? "pause" : "play"}
              size={50}
              color="#FFD369"
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={skipToNext}>
            <Ionicons
              name="play-skip-forward-outline"
              size={35}
              color="#FFD369"
              style={{ marginTop: 10 }}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.bottomContainer}>
        <View style={styles.bottomControls}>
          <TouchableOpacity onPress={() => {}}>
            <Ionicons name="heart-outline" size={30} color="#777777" />
          </TouchableOpacity>
          <TouchableOpacity onPress={changeRepeatMode}>
            <MaterialCommunityIcons
              name={`${repeatIcon()}`}
              size={30}
              color={repeatMode !== "off" ? "#FFD369" : "#777777"}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => {}}>
            <Ionicons name="share-outline" size={30} color="#777777" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => {}}>
            <Ionicons name="ellipsis-horizontal" size={30} color="#777777" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default MusicPlayer;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#222831",
  },
  artworkWrapper: {
    width: 350,
    height: 340,
    marginBottom: 25,
    shadowColor: "#000",
    shadowOffset: {
      width: 5,
      height: 5,
    },
    shadowOpacity: 0.5,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    color: "#EEEEEE",
  },
  artist: {
    fontSize: 16,
    fontWeight: "200",
    textAlign: "center",
    color: "#EEEEEE",
  },
  progressContainer: {
    width: 350,
    height: 40,
    marginTop: 25,
    flexDirection: "row",
  },
  progressLabelContainer: {
    width: 340,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  progressLabelText: {
    color: "#fff",
  },
  musicControls: {
    flexDirection: "row",
    width: "60%",
    justifyContent: "space-between",
    marginTop: 15,
  },
  artworkImg: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
  maincontainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  bottomContainer: {
    borderTopColor: "#393E46",
    borderTopWidth: 1,
    width: width,
    alignItems: "center",
    paddingVertical: 15,
  },
  bottomControls: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "80%",
  },
});
