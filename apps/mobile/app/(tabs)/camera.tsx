import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { Colors } from '../../../constants';
import { Button, LoadingOverlay, ConfidenceScore, Card } from '../../../src/components';

export default function CameraScreen() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  const handlePickImage = async () => {
    // Image picker logic - requires expo-image-picker
    Alert.alert(
      'Add Photo',
      'Choose how to add your outfit photo',
      [
        { text: 'Camera', onPress: () => console.log('Camera') },
        { text: 'Gallery', onPress: () => console.log('Gallery') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleAnalyze = async () => {
    if (!selectedImage) {
      Alert.alert('No Photo', 'Please select a photo first');
      return;
    }
    setIsAnalyzing(true);
    try {
      // TODO: Call outfit analysis API
      await new Promise(resolve => setTimeout(resolve, 2000));
      setAnalysisResult({
        confidenceScore: 82,
        feedback: [
          { type: 'positive', text: 'Great color coordination!' },
          { type: 'positive', text: 'Proportions are well-balanced.' },
          { type: 'suggestion', text: 'Try adding a statement accessory.' },
        ],
        occasion: 'Casual',
        style: 'Smart Casual',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to analyze outfit. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setSelectedImage(null);
    setAnalysisResult(null);
  };

  return (
    <View style={styles.container}>
      <LoadingOverlay
        visible={isAnalyzing}
        message="Analyzing your outfit..."
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {!analysisResult ? (
          <>
            <View style={styles.header}>
              <Text style={styles.title}>FitCheck</Text>
              <Text style={styles.subtitle}>AI-powered outfit analysis</Text>
            </View>

            <TouchableOpacity
              style={styles.imagePickerArea}
              onPress={handlePickImage}
              activeOpacity={0.8}
            >
              {selectedImage ? (
                <Image
                  source={{ uri: selectedImage }}
                  style={styles.previewImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Text style={styles.cameraIcon}>📸</Text>
                  <Text style={styles.imagePickerText}>Tap to add your outfit photo</Text>
                  <Text style={styles.imagePickerSubtext}>Camera or Gallery</Text>
                </View>
              )}
            </TouchableOpacity>

            {selectedImage && (
              <View style={styles.actions}>
                <Button
                  title="Change Photo"
                  onPress={handlePickImage}
                  variant="outline"
                  style={styles.actionButton}
                />
                <Button
                  title="Analyze Outfit ✨"
                  onPress={handleAnalyze}
                  variant="primary"
                  style={styles.actionButton}
                />
              </View>
            )}

            {!selectedImage && (
              <View style={styles.tipContainer}>
                <Text style={styles.tipTitle}>Tips for best results:</Text>
                <Text style={styles.tip}>• Good lighting is key</Text>
                <Text style={styles.tip}>• Full body photo works best</Text>
                <Text style={styles.tip}>• Neutral background preferred</Text>
              </View>
            )}
          </>
        ) : (
          <>
            <View style={styles.resultHeader}>
              <ConfidenceScore
                score={analysisResult.confidenceScore}
                size="lg"
                animated
              />
              <Text style={styles.resultTitle}>Your FitCheck Score</Text>
              <Text style={styles.resultSubtitle}>{analysisResult.occasion} • {analysisResult.style}</Text>
            </View>

            <Card style={styles.feedbackCard}>
              <Text style={styles.feedbackTitle}>AI Feedback</Text>
              {analysisResult.feedback.map((item: any, i: number) => (
                <View key={i} style={styles.feedbackItem}>
                  <Text style={styles.feedbackIcon}>
                    {item.type === 'positive' ? '✅' : '💡'}
                  </Text>
                  <Text style={styles.feedbackText}>{item.text}</Text>
                </View>
              ))}
            </Card>

            <View style={styles.resultActions}>
              <Button
                title="Save to Wardrobe"
                onPress={() => router.push('/(tabs)/wardrobe')}
                variant="primary"
                size="lg"
                style={styles.saveButton}
              />
              <Button
                title="Try Another Outfit"
                onPress={handleReset}
                variant="outline"
                size="md"
              />
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 48,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  imagePickerArea: {
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  imagePlaceholder: {
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
  },
  cameraIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  imagePickerText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  imagePickerSubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  previewImage: {
    width: '100%',
    height: 400,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
  },
  tipContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
  },
  tipTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  tip: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
    lineHeight: 20,
  },
  resultHeader: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 16,
  },
  resultTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 16,
    marginBottom: 4,
  },
  resultSubtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  feedbackCard: {
    marginBottom: 24,
  },
  feedbackTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  feedbackItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 10,
  },
  feedbackIcon: {
    fontSize: 16,
    marginTop: 1,
  },
  feedbackText: {
    flex: 1,
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  resultActions: {
    gap: 12,
  },
  saveButton: {
    marginBottom: 4,
  },
});
