import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Colors } from '../../constants';

interface Garment {
  id: string;
  name: string;
  category: string;
  imageUrl?: string;
  color?: string;
  brand?: string;
}

interface GarmentCardProps {
  garment: Garment;
  onPress?: (garment: Garment) => void;
  onLongPress?: (garment: Garment) => void;
  selected?: boolean;
  size?: 'sm' | 'md';
}

export const GarmentCard: React.FC<GarmentCardProps> = ({
  garment,
  onPress,
  onLongPress,
  selected = false,
  size = 'md',
}) => {
  const isSmall = size === 'sm';
  const cardSize = isSmall ? 120 : 160;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { width: cardSize },
        selected && styles.selected,
      ]}
      onPress={() => onPress?.(garment)}
      onLongPress={() => onLongPress?.(garment)}
      activeOpacity={0.8}
    >
      <View style={[styles.imageContainer, { height: cardSize }]}>
        {garment.imageUrl ? (
          <Image
            source={{ uri: garment.imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>
              {garment.category[0]?.toUpperCase()}
            </Text>
          </View>
        )}
        {selected && (
          <View style={styles.selectedOverlay}>
            <Text style={styles.checkmark}>✓</Text>
          </View>
        )}
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {garment.name}
        </Text>
        <Text style={styles.category} numberOfLines={1}>
          {garment.category}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: Colors.surface,
    marginRight: 12,
    marginBottom: 12,
  },
  imageContainer: {
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
    fontSize: 32,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  selected: {
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  selectedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    fontSize: 32,
    color: Colors.white,
    fontWeight: '700',
  },
  info: {
    padding: 8,
  },
  name: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  category: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});

export default GarmentCard;
