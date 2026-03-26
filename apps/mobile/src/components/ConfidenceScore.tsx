import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Animated,
  StyleSheet,
} from 'react-native';

interface ConfidenceScoreProps {
  score: number;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
  animated?: boolean;
}

export function ConfidenceScore({
  score,
  size = 'medium',
  showLabel = true,
  animated = true,
}: ConfidenceScoreProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animated) {
      Animated.timing(animatedValue, {
        toValue: score / 100,
        duration: 1000,
        useNativeDriver: false,
      }).start();
    } else {
      animatedValue.setValue(score / 100);
    }
  }, [score, animated]);

  const getColor = (s: number) => {
    if (s >= 80) return '#22c55e';
    if (s >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const getLabel = (s: number) => {
    if (s >= 90) return 'Exceptional';
    if (s >= 80) return 'Confident';
    if (s >= 70) return 'Good';
    if (s >= 60) return 'Decent';
    if (s >= 40) return 'Needs Work';
    return 'Rethink This';
  };

  const color = getColor(score);
  const dimensions = {
    small: { size: 60, strokeWidth: 5, fontSize: 14 },
    medium: { size: 100, strokeWidth: 8, fontSize: 22 },
    large: { size: 140, strokeWidth: 10, fontSize: 30 },
  }[size];

  const barWidth = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.circle,
          {
            width: dimensions.size,
            height: dimensions.size,
            borderRadius: dimensions.size / 2,
            borderWidth: dimensions.strokeWidth,
            borderColor: color,
          },
        ]}
      >
        <Text style={[styles.scoreText, { fontSize: dimensions.fontSize, color }]}>
          {score}
        </Text>
        <Text style={styles.percentText}>%</Text>
      </View>
      {showLabel && (
        <View style={styles.labelContainer}>
          <Text style={[styles.label, { color }]}>{getLabel(score)}</Text>
          <View style={styles.barBackground}>
            <Animated.View
              style={[
                styles.barFill,
                { width: barWidth, backgroundColor: color },
              ]}
            />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  circle: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  scoreText: {
    fontWeight: '700',
    lineHeight: undefined,
  },
  percentText: {
    color: '#94a3b8',
    fontSize: 10,
    marginTop: -4,
  },
  labelContainer: {
    marginTop: 12,
    alignItems: 'center',
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  barBackground: {
    width: '100%',
    height: 6,
    backgroundColor: '#1e293b',
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
});
