import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  uri?: string | null;
  name?: string;
  size?: AvatarSize;
  onPress?: () => void;
  showBadge?: boolean;
  badgeColor?: string;
}

const sizeMap: Record<AvatarSize, number> = {
  xs: 28,
  sm: 36,
  md: 48,
  lg: 72,
  xl: 100,
};

function getInitials(name?: string): string {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function getAvatarColor(name?: string): string {
  const colors = ['#7c3aed', '#6d28d9', '#4f46e5', '#0891b2', '#0d9488', '#059669'];
  if (!name) return colors[0];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
}

export function Avatar({
  uri,
  name,
  size = 'md',
  onPress,
  showBadge = false,
  badgeColor = '#22c55e',
}: AvatarProps) {
  const dimension = sizeMap[size];
  const fontSize = Math.round(dimension * 0.38);
  const badgeSize = Math.round(dimension * 0.25);

  const content = (
    <View
      style={[
        styles.container,
        { width: dimension, height: dimension, borderRadius: dimension / 2 },
      ]}
    >
      {uri ? (
        <Image
          source={{ uri }}
          style={[
            styles.image,
            { width: dimension, height: dimension, borderRadius: dimension / 2 },
          ]}
          resizeMode="cover"
        />
      ) : (
        <View
          style={[
            styles.fallback,
            {
              width: dimension,
              height: dimension,
              borderRadius: dimension / 2,
              backgroundColor: getAvatarColor(name),
            },
          ]}
        >
          <Text style={[styles.initials, { fontSize }]}>{getInitials(name)}</Text>
        </View>
      )}
      {showBadge && (
        <View
          style={[
            styles.badge,
            {
              width: badgeSize,
              height: badgeSize,
              borderRadius: badgeSize / 2,
              backgroundColor: badgeColor,
              bottom: 0,
              right: 0,
            },
          ]}
        />
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'visible',
  },
  image: {},
  fallback: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    color: '#fff',
    fontWeight: '700',
  },
  badge: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: '#0f172a',
  },
});
