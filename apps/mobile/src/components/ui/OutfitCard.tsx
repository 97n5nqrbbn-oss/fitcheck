import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Colors } from '../../constants';
import { ConfidenceScore } from './ConfidenceScore';

interface Outfit {
  id: string;
  name: string;
  imageUrl?: string;
  confidenceScore: number;
  occasion?: string;
  createdAt: string;
}

interface OutfitCardProps {
  outfit: Outfit;
  onPress?: (outfit: Outfit) => void;
  compact?: boolean;
}

export const OutfitCard: React.FC<OutfitCardProps> = ({
  outfit,
  onPress,
  compact = false,
}) => {
  return (
    <TouchableOpacity
      style={[styles.container, compact && styles.compact]}
      onPress={() => onPress?.(outfit)}
      activeOpacity={0.85}
    >
      <View style={styles.imageContainer}>
        {outfit.imageUrl ? (
          <Image
            source={{ uri: outfit.imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>👗</Text>
          </View>
        )}
        <View style={styles.scoreBadge}>
          <ConfidenceScore
            score={outfit.confidenceScore}
            size="sm"
            showLabel={false}
          />
        </View>
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {outfit.name}
        </Text>
        {outfit.occasion && (
          <Text style={styles.occasion} numberOfLines={1}>
            {outfit.occasion}
          </Text>
        )}
        <Text style={styles.date}>
          {new Date(outfit.createdAt).toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 180,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: Colors.surface,
    marginRight: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  compact: {
    width: 140,
  },
  imageContainer: {
    height: 200,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    flex: 1,
    backgroundColor: Colors.surfaceHighlight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 48,
  },
  scoreBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: Colors.backgroundPrimary,
    borderRadius: 999,
    padding: 4,
  },
  info: {
    padding: 12,
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  occasion: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
    marginBottom: 4,
  },
  date: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
});

export default OutfitCard;
