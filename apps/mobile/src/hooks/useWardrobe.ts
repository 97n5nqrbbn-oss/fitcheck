import { useCallback, useEffect, useMemo } from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useWardrobeStore, Garment } from '../store/wardrobeStore';
import { GarmentCategory } from '../types';

const CATEGORIES: GarmentCategory[] = [
  'tops', 'bottoms', 'dresses', 'outerwear', 'shoes', 'accessories', 'activewear', 'other',
];

export function useWardrobe() {
  const {
    garments,
    isLoading,
    isUploading,
    error,
    selectedCategory,
    fetchGarments,
    addGarment,
    updateGarment,
    deleteGarment,
    setSelectedCategory,
    clearError,
  } = useWardrobeStore();

  useEffect(() => {
    fetchGarments();
  }, []);

  const filteredGarments = useMemo(() => {
    if (!selectedCategory) return garments;
    return garments.filter((g) => g.category === selectedCategory);
  }, [garments, selectedCategory]);

  const categoryCounts = useMemo(() => {
    return CATEGORIES.reduce<Record<string, number>>((acc, cat) => {
      acc[cat] = garments.filter((g) => g.category === cat).length;
      return acc;
    }, {});
  }, [garments]);

  const addFromCamera = useCallback(
    async (data: Partial<Garment>) => {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Required', 'Camera access is needed to add garments.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        quality: 0.85,
        allowsEditing: true,
        aspect: [3, 4],
      });
      if (!result.canceled && result.assets[0]) {
        await addGarment(result.assets[0].uri, data);
      }
    },
    [addGarment]
  );

  const addFromGallery = useCallback(
    async (data: Partial<Garment>) => {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Required', 'Photo library access is needed to add garments.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.85,
        allowsEditing: true,
        aspect: [3, 4],
      });
      if (!result.canceled && result.assets[0]) {
        await addGarment(result.assets[0].uri, data);
      }
    },
    [addGarment]
  );

  const removeGarment = useCallback(
    async (id: string) => {
      Alert.alert(
        'Remove Garment',
        'Are you sure you want to remove this item from your wardrobe?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Remove',
            style: 'destructive',
            onPress: () => deleteGarment(id),
          },
        ]
      );
    },
    [deleteGarment]
  );

  return {
    garments: filteredGarments,
    allGarments: garments,
    isLoading,
    isUploading,
    error,
    selectedCategory,
    categories: CATEGORIES,
    categoryCounts,
    setSelectedCategory,
    addFromCamera,
    addFromGallery,
    updateGarment,
    removeGarment,
    refresh: fetchGarments,
    clearError,
  };
}
