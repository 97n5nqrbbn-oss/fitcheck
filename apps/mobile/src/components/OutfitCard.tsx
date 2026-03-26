import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { OutfitAnalysis } from '../types';

const { width } = Dimensions.get('window');

interface OutfitCardProps {
  outfit: OutfitAnalysis;
  onPress?: () => void;
  onDelete?: () => void;
  compact?: boolean;
}

export function OutfitCard({ outfit, onPress, onDelete, compact = false }: OutfitCardProps) {
  const scoreColor = outfit.confidenceScore >= 80
    ? '#22c55e'
    : outfit.confidenceScore >= 60
    ? '#f59e0b'
    : '#ef4444';

  return (
    <TouchableOpacity
      style={[styles.card, compact && styles.cardCompact]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <Image
        source={{ uri: outfit.imageUrl }}
        style={[styles.image, compact && styles.imageCompact]}
        resizeMode="cover"
      />
      <View style={styles.overlay}>
        <View style={[styles.scoreBadge, { backgroundColor: scoreColor }]}>
          <Text style={styles.scoreText}>{outfit.confidenceScore}%</Text>
        </View>
      </View>
      <View style={styles.content}>
        <View style={styles.row}>
          <Text style={styles.occasion}>{outfit.occasion}</Text>
          <Text style={styles.season}>{outfit.season}</Text>
        </View>
        {!compact && (
          <>
            <Text style={styles.feedback} numberOfLines={2}>
              {outfit.feedback}
            </Text>
            <View style={styles.tags}>
              {outfit.tags.slice(0, 3).map((tag, i) => (
                <View key={i} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </>
        )}
        <View style={styles.footer}>
          <View style={styles.ratings}>
            <Text style={styles.ratingLabel}>Style</Text>
            <Text style={styles.ratingValue}>{outfit.styleRating}/10</Text>
          </View>
          {onDelete && (
            <TouchableOpacity onPress={onDelete} style={styles.deleteButton}>
              <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  cardCompact: {
    width: width * 0.45,
    marginBottom: 0,
  },
  image: {
    width: '100%',
    height: 240,
  },
  imageCompact: {
    height: 160,
  },
  overlay: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  scoreBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  scoreText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  content: {
    padding: 14,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  occasion: {
    color: '#a78bfa',
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  season: {
    color: '#94a3b8',
    fontSize: 12,
    textTransform: 'capitalize',
  },
  feedback: {
    color: '#e2e8f0',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 10,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10,
  },
  tag: {
    backgroundColor: '#2d1b69',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  tagText: {
    color: '#c4b5fd',
    fontSize: 11,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratings: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingLabel: {
    color: '#94a3b8',
    fontSize: 12,
  },
  ratingValue: {
    color: '#e2e8f0',
    fontSize: 12,
    fontWeight: '600',
  },
  deleteButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: '#7f1d1d',
    borderRadius: 8,
  },
  deleteText: {
    color: '#fca5a5',
    fontSize: 12,
  },
});
