import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useOutfitStore } from '../store/outfitStore';

export function useOutfitAnalysis() {
  const { analyzeOutfit, isAnalyzing, currentAnalysis, error, clearCurrentAnalysis, clearError } =
    useOutfitStore();
  const [imageUri, setImageUri] = useState<string | null>(null);

  const pickImage = useCallback(async (fromCamera: boolean) => {
    const permission = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        'Permission Required',
        `Please grant ${fromCamera ? 'camera' : 'photo library'} access to analyze your outfit.`
      );
      return;
    }

    const result = fromCamera
      ? await ImagePicker.launchCameraAsync({
          quality: 0.85,
          allowsEditing: true,
          aspect: [3, 4],
        })
      : await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 0.85,
          allowsEditing: true,
          aspect: [3, 4],
        });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
      clearCurrentAnalysis();
    }
  }, [clearCurrentAnalysis]);

  const analyze = useCallback(async () => {
    if (!imageUri) return;
    await analyzeOutfit(imageUri);
  }, [imageUri, analyzeOutfit]);

  const reset = useCallback(() => {
    setImageUri(null);
    clearCurrentAnalysis();
    clearError();
  }, [clearCurrentAnalysis, clearError]);

  return {
    imageUri,
    isAnalyzing,
    analysis: currentAnalysis,
    error,
    pickImage,
    analyze,
    reset,
  };
}
