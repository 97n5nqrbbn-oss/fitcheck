import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Garment } from '../types';

interface GarmentCardProps {
  garment: Garment;
  onPress?: () => void;
  onDelete?: () => void;
  selected?: boolean;
}

export function GarmentCard({ garment, onPress, onDelete, selected = false }: GarmentCardProps) {
  return (
    <TouchableOpacity
      style={[styles.card, selected && styles.cardSelected]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <Image
        source={{ uri: garment.imageUrl }}
        style={styles.image}
        resizeMode="cover"
      />
      {selected && (
        <View style={styles.selectedOverlay}>
          <Text style={styles.checkmark}>✓</Text>
        </View>
      )}
      <View style={styles.categoryBadge}>
        <Text style={styles.categoryText}>{garment.category}</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>{garment.name}</Text>
        <View style={styles.meta}>
          <View style={[styles.colorDot, { backgroundColor: garment.color }]} />
          {garment.brand && (
            <Text style={styles.brand} numberOfLines={1}>{garment.brand}</Text>
          )}
        </View>
        <View style={styles.footer}>
          <Text style={styles.worn}>Worn {garment.timesWorn}x</Text>
          {onDelete && (
            <TouchableOpacity onPress={onDelete} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.deleteText}>Remove</Text>
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
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  cardSelected: {
    borderColor: '#a78bfa',
  },
  image: {
    width: '100%',
    height: 140,
  },
  selectedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 140,
    backgroundColor: 'rgba(167, 139, 250, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    fontSize: 32,
    color: '#fff',
    fontWeight: '700',
  },
  categoryBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  categoryText: {
    color: '#e2e8f0',
    fontSize: 10,
    textTransform: 'capitalize',
  },
  content: {
    padding: 10,
  },
  name: {
    color: '#e2e8f0',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  brand: {
    color: '#94a3b8',
    fontSize: 11,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  worn: {
    color: '#64748b',
    fontSize: 11,
  },
  deleteText: {
    color: '#f87171',
    fontSize: 11,
  },
});
