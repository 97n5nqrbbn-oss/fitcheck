import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { wardrobeApi } from '../../src/lib/api';

interface Garment {
  id: string;
  imageUrl: string;
  category: string;
  color: string;
  tags: string[];
  notes?: string;
  createdAt: string;
}

export default function WardrobeScreen() {
  const [garments, setGarments] = useState<Garment[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchGarments = useCallback(async () => {
    try {
      const res = await wardrobeApi.getAll();
      setGarments(res.data);
    } catch (err) {
      console.error('Failed to fetch wardrobe', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchGarments(); }, []);

  const handleAddGarment = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission required', 'Please grant photo library access');
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({ quality: 0.8 });
    if (res.canceled || !res.assets[0]) return;

    setUploading(true);
    try {
      await wardrobeApi.upload(res.assets[0].uri);
      fetchGarments();
    } catch (err: any) {
      Alert.alert('Upload Failed', err.response?.data?.error || 'Could not upload garment');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Remove Garment', 'Remove this item from your wardrobe?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove', style: 'destructive',
        onPress: async () => {
          await wardrobeApi.delete(id);
          setGarments(prev => prev.filter(g => g.id !== id));
        },
      },
    ]);
  };

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
        data={garments}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchGarments(); }} tintColor="#6c63ff" />
        }
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Ionicons name="shirt-outline" size={60} color="#444" />
            <Text style={styles.emptyText}>Your wardrobe is empty</Text>
            <Text style={styles.emptySubText}>Add your first garment to get started</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onLongPress={() => handleDelete(item.id)}>
            <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
            <View style={styles.cardInfo}>
              <Text style={styles.cardCategory}>{item.category || 'Item'}</Text>
              <Text style={styles.cardColor}>{item.color || ''}</Text>
            </View>
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity style={styles.fab} onPress={handleAddGarment} disabled={uploading}>
        {uploading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Ionicons name="add" size={28} color="#fff" />
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f0f' },
  center: { flex: 1, backgroundColor: '#0f0f0f', justifyContent: 'center', alignItems: 'center' },
  list: { padding: 12, paddingBottom: 100 },
  card: {
    flex: 1, margin: 6, borderRadius: 12, overflow: 'hidden',
    backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: '#333',
  },
  cardImage: { width: '100%', aspectRatio: 0.8 },
  cardInfo: { padding: 10 },
  cardCategory: { color: '#fff', fontWeight: '600', fontSize: 13 },
  cardColor: { color: '#888', fontSize: 12, marginTop: 2 },
  emptyBox: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 100, gap: 12 },
  emptyText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  emptySubText: { color: '#666', fontSize: 14 },
  fab: {
    position: 'absolute', bottom: 24, right: 24,
    backgroundColor: '#6c63ff', borderRadius: 30,
    width: 60, height: 60, alignItems: 'center', justifyContent: 'center',
    shadowColor: '#6c63ff', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 8,
    elevation: 8,
  },
});
