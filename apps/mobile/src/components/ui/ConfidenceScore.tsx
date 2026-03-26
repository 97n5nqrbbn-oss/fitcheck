import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Colors } from '../../constants';

interface ConfidenceScoreProps {
  score: number; // 0-100
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  animated?: boolean;
}

const getScoreColor = (score: number): string => {
  if (score >= 80) return Colors.scoreExcellent;
  if (score >= 60) return Colors.scoreGood;
  if (score >= 40) return Colors.scoreDecent;
  return Colors.scorePoor;
};

const getScoreLabel = (score: number): string => {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Decent';
  return 'Needs Work';
};

export const ConfidenceScore: React.FC<ConfidenceScoreProps> = ({
  score,
  size = 'md',
  showLabel = true,
  animated = true,
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animated) {
      Animated.timing(animatedValue, {
        toValue: score,
        duration: 1000,
        useNativeDriver: false,
      }).start();
    } else {
      animatedValue.setValue(score);
    }
  }, [score]);

  const sizeConfig = {
    sm: { container: 60, text: 16, label: 10 },
    md: { container: 100, text: 28, label: 12 },
    lg: { container: 140, text: 40, label: 14 },
  };

  const config = sizeConfig[size];
  const scoreColor = getScoreColor(score);
  const label = getScoreLabel(score);

  const strokeWidth = size === 'sm' ? 5 : size === 'md' ? 8 : 10;
  const radius = (config.container - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <View style={[styles.container, { width: config.container, height: config.container }]}>
      <View style={styles.scoreWrapper}>
        <Text style={[styles.scoreText, { fontSize: config.text, color: scoreColor }]}>
          {score}
        </Text>
        {showLabel && (
          <Text style={[styles.labelText, { fontSize: config.label, color: scoreColor }]}>
            {label}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    borderWidth: 4,
    borderColor: Colors.border,
  },
  scoreWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreText: {
    fontWeight: '800',
    letterSpacing: -1,
  },
  labelText: {
    fontWeight: '600',
    marginTop: 2,
  },
});

export default ConfidenceScore;
