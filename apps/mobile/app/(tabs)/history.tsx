import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { outfitApi } from '../../src/lib/api';
import { Ionicons } from '@expo/vector-icons';

interface OutfitEntry {
  id: string;
  imageUrl: string;
  score: number;
  summary: string;
  createdAt: string;
}

export default function HistoryScreen() {
  const [outfits, setOutfits] = useState<OutfitEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    outfitApi.getAll()
      .then(res => setOutfits(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = (id: string) => {
    Alert.alert('Delete Entry', 'Remove this outfit analysis?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          await outfitApi.delete(id);
          setOutfits(prev => prev.filter(o => o.id !== id));
        },
      },
    ]);
  };

  const scoreColor = (score: number) =>
    score >= 80 ? '#4ade80' : score >= 60 ? '#facc15' : '#f87171';

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6c63ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={outfits}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Ionicons name="time-outline" size={60} color="#444" />
            <Text style={styles.emptyText}>No outfit analyses yet</Text>
            <Text style={styles.emptySubText}>Analyze your first outfit in the FitCheck tab</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onLongPress={() => handleDelete(item.id)}>
            <Image source={{ uri: item.imageUrl }} style={styles.image} />
            <View style={styles.info}>
              <View style={styles.scoreRow}>
                <Text style={[styles.score, { color: scoreColor(item.score) }]}>{item.score}</Text>
                <Text style={styles.scoreLabel}>/100</Text>
              </View>
              <Text style={styles.summary} numberOfLines={3}>{item.summary}</Text>
              <Text style={styles.date}>
                {new Date(item.createdAt).toLocaleDateString()}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f0f' },
  center: { flex: 1, backgroundColor: '#0f0f0f', justifyContent: 'center', alignItems: 'center' },
  list: { padding: 16, paddingBottom: 40 },
  card: {
    flexDirection: 'row', backgroundColor: '#1a1a1a', borderRadius: 14,
    marginBottom: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#333',
  },
  image: { width: 100, height: 120 },
  info: { flex: 1, padding: 14, justifyContent: 'space-between' },
  scoreRow: { flexDirection: 'row', alignItems: 'baseline', gap: 2 },
  score: { fontSize: 28, fontWeight: '800' },
  scoreLabel: { color: '#888', fontSize: 13 },
  summary: { color: '#ccc', fontSize: 13, lineHeight: 19, flex: 1 },
  date: { color: '#555', fontSize: 12, marginTop: 8 },
  emptyBox: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 100, gap: 12 },
  emptyText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  emptySubText: { color: '#666', fontSize: 14, textAlign: 'center' },
});
