import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { outfitApi } from '../../src/lib/api';

interface AnalysisResult {
  score: number;
  summary: string;
  strengths: string[];
  improvements: string[];
  occasion: string;
  styleNotes: string;
}

export default function AnalyzeScreen() {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const pickImage = async (fromCamera: boolean) => {
    const perm = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!perm.granted) {
      Alert.alert('Permission required', 'Please grant permission to continue');
      return;
    }

    const res = fromCamera
      ? await ImagePicker.launchCameraAsync({ quality: 0.8, base64: false })
      : await ImagePicker.launchImageLibraryAsync({ quality: 0.8, base64: false });

    if (!res.canceled && res.assets[0]) {
      setImage(res.assets[0].uri);
      setResult(null);
    }
  };

  const analyzeOutfit = async () => {
    if (!image) return;
    setLoading(true);
    try {
      const res = await outfitApi.analyze(image);
      setResult(res.data.analysis);
    } catch (err: any) {
      Alert.alert('Analysis Failed', err.response?.data?.error || 'Could not analyze outfit');
    } finally {
      setLoading(false);
    }
  };

  const ScoreBadge = ({ score }: { score: number }) => {
    const color = score >= 80 ? '#4ade80' : score >= 60 ? '#facc15' : '#f87171';
    return (
      <View style={[styles.scoreBadge, { borderColor: color }]}>
        <Text style={[styles.scoreNum, { color }]}>{score}</Text>
        <Text style={styles.scoreLabel}>/100</Text>
      </View>
    );
  };

  return (
    <LinearGradient colors={['#0f0f0f', '#111']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {!image ? (
          <View style={styles.placeholder}>
            <Ionicons name="shirt-outline" size={80} color="#444" />
            <Text style={styles.placeholderText}>Upload your outfit to get an AI style analysis</Text>
          </View>
        ) : (
          <Image source={{ uri: image }} style={styles.preview} />
        )}

        <View style={styles.btnRow}>
          <TouchableOpacity style={styles.pickBtn} onPress={() => pickImage(true)}>
            <Ionicons name="camera" size={20} color="#fff" />
            <Text style={styles.pickBtnText}>Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.pickBtn} onPress={() => pickImage(false)}>
            <Ionicons name="images" size={20} color="#fff" />
            <Text style={styles.pickBtnText}>Gallery</Text>
          </TouchableOpacity>
        </View>

        {image && !loading && !result && (
          <TouchableOpacity style={styles.analyzeBtn} onPress={analyzeOutfit}>
            <Text style={styles.analyzeBtnText}>Analyze My Fit</Text>
          </TouchableOpacity>
        )}

        {loading && (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#6c63ff" />
            <Text style={styles.loadingText}>Perplexity AI is rating your fit...</Text>
          </View>
        )}

        {result && (
          <View style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <Text style={styles.resultTitle}>Fit Analysis</Text>
              <ScoreBadge score={result.score} />
            </View>

            <Text style={styles.summary}>{result.summary}</Text>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Occasion</Text>
              <Text style={styles.sectionText}>{result.occasion}</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Strengths</Text>
              {result.strengths.map((s, i) => (
                <View key={i} style={styles.bullet}>
                  <Text style={styles.bulletDot}>+</Text>
                  <Text style={styles.bulletText}>{s}</Text>
                </View>
              ))}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Improvements</Text>
              {result.improvements.map((s, i) => (
                <View key={i} style={styles.bullet}>
                  <Text style={[styles.bulletDot, { color: '#f87171' }]}>~</Text>
                  <Text style={styles.bulletText}>{s}</Text>
                </View>
              ))}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Style Notes</Text>
              <Text style={styles.sectionText}>{result.styleNotes}</Text>
            </View>

            <TouchableOpacity style={styles.retryBtn} onPress={() => { setImage(null); setResult(null); }}>
              <Text style={styles.retryText}>Analyze Another Outfit</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 20, paddingBottom: 40 },
  placeholder: { alignItems: 'center', paddingVertical: 60, gap: 16 },
  placeholderText: { color: '#666', fontSize: 16, textAlign: 'center', maxWidth: 280 },
  preview: { width: '100%', height: 320, borderRadius: 16, marginBottom: 16 },
  btnRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  pickBtn: {
    flex: 1, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#1e1e1e', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#333',
  },
  pickBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  analyzeBtn: {
    backgroundColor: '#6c63ff', borderRadius: 14, padding: 18, alignItems: 'center', marginTop: 4,
  },
  analyzeBtnText: { color: '#fff', fontSize: 18, fontWeight: '800' },
  loadingBox: { alignItems: 'center', paddingVertical: 40, gap: 16 },
  loadingText: { color: '#888', fontSize: 15 },
  resultCard: {
    backgroundColor: '#1a1a1a', borderRadius: 16, padding: 20, marginTop: 16,
    borderWidth: 1, borderColor: '#333',
  },
  resultHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  resultTitle: { color: '#fff', fontSize: 20, fontWeight: '800' },
  scoreBadge: { borderWidth: 2, borderRadius: 50, width: 70, height: 70, alignItems: 'center', justifyContent: 'center' },
  scoreNum: { fontSize: 22, fontWeight: '800' },
  scoreLabel: { color: '#888', fontSize: 11 },
  summary: { color: '#ccc', fontSize: 15, lineHeight: 22, marginBottom: 16 },
  section: { marginBottom: 16 },
  sectionTitle: { color: '#6c63ff', fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  sectionText: { color: '#ccc', fontSize: 15, lineHeight: 22 },
  bullet: { flexDirection: 'row', gap: 10, marginBottom: 6 },
  bulletDot: { color: '#4ade80', fontSize: 16, fontWeight: '800' },
  bulletText: { color: '#ccc', fontSize: 15, flex: 1 },
  retryBtn: {
    backgroundColor: '#222', borderRadius: 12, padding: 14, alignItems: 'center',
    marginTop: 8, borderWidth: 1, borderColor: '#444',
  },
  retryText: { color: '#6c63ff', fontSize: 15, fontWeight: '600' },
});
