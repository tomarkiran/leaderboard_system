import { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  ScrollView,
} from "react-native";

const API_BASE = "https://leaderboard-system-backend-x3js.onrender.com";

export default function App() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load leaderboard ONCE
  useEffect(() => {
    fetch(`${API_BASE}/leaderboard`)
      .then(res => res.json())
      .then(data => setLeaderboard(data))
      .catch(err => console.error(err));
  }, []);

  // Debounced search 
  useEffect(() => {
    if (searchText.trim() === "") {
      setSearchResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const timer = setTimeout(() => {
      fetch(`${API_BASE}/search?username=${searchText}`)
        .then(res => res.json())
        .then(data => {
          setSearchResults(Array.isArray(data) ? data : []);
          setLoading(false);
        })
        .catch(() => {
          setSearchResults([]);
          setLoading(false);
        });
    }, 400);

    return () => clearTimeout(timer);
  }, [searchText]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🏆 Global Leaderboard</Text>

      <View style={styles.headerRow}>
        <Text style={styles.headerText}>Rank</Text>
        <Text style={styles.headerText}>Username</Text>
        <Text style={styles.headerText}>Rating</Text>
      </View>

      
      <ScrollView style={styles.card}>
        {leaderboard.map((user, index) => (
          <View key={index} style={styles.row}>
            <Text style={styles.cell}>#{user.rank}</Text>
            <Text style={styles.cell}>{user.username}</Text>
            <Text style={styles.cell}>{user.rating}</Text>
          </View>
        ))}
      </ScrollView>

      <TextInput
        placeholder="Search username (e.g. user_9187)"
        style={styles.input}
        value={searchText}
        onChangeText={setSearchText}
      />

      {searchText.trim() !== "" && (
        <View style={styles.searchCard}>
          {loading ? (
            <Text style={styles.loadingText}>Searching...</Text>
          ) : searchResults.length > 0 ? (
            searchResults.map((user, index) => (
              <Text key={index} style={styles.searchText}>
                <Text style={styles.bold}>Global Rank:</Text> {user.Rank} |{" "}
                <Text style={styles.bold}>Username:</Text> {user.Username} |{" "}
                <Text style={styles.bold}>Rating:</Text> {user.Rating}
              </Text>
            ))
          ) : (
            <Text style={styles.noDataText}>Data not exists</Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f5f7fb" },
  title: { fontSize: 26, fontWeight: "700", marginBottom: 15, textAlign: "center" },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "#2d6cdf",
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  headerText: { color: "#fff", fontWeight: "600", width: "33%", textAlign: "center" },
  card: { backgroundColor: "#fff", maxHeight: 300, marginBottom: 20 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  cell: { width: "33%", textAlign: "center", fontSize: 14 },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 6,
    marginBottom: 15,
  },
  searchCard: { backgroundColor: "#eaf4ff", padding: 15, borderRadius: 8 },
  searchText: { fontSize: 14, color: "#1a4fb3" },
  bold: { fontWeight: "700" },
  loadingText: { fontSize: 14, color: "#555", fontStyle: "italic" },
  noDataText: { fontSize: 14, color: "#cc0000", fontStyle: "italic" },
});
