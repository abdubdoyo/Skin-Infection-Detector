import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { NavigationProp } from '@react-navigation/native';
import { Platform } from 'react-native';

// Define your backend URL in one place for easy updates.
const API_BASE_URL = 'http://192.168.2.13:8000'; // Ensure this is correct

const UploadScreen = ({ navigation }: { navigation: NavigationProp<any> }) => {
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [allergyInput, setAllergyInput] = useState('');
  const router = useRouter();

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImage(result.assets[0].uri);
      setError(null);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      setError('Camera access is required to take photos.');
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImage(result.assets[0].uri);
      setError(null);
    }
  };

  async function uploadImage (imageUri: string) {
    try {
      const filename = imageUri.split('/').pop() || `image-${Date.now()}.jpg`;
      const formData = new FormData();
      if(Platform.OS == 'web'){
        const resp = await fetch(imageUri);
        const blob = await resp.blob();
        const file = new File([blob], filename, { type: blob.type || 'image/jpeg'});
        formData.append('image', file);
      }else{
        formData.append('image', {
        uri: imageUri,
        name: filename,
        type: 'image/jpeg',
      } as any);
      }
      

      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${errorText}`);
      }

      return await response.json();
    } catch (e) {
      console.error('Upload error:', e);
      throw e;
    }
  };

  const getResultAfterDelay = async (statusUrl: string) => {
    const WAIT_TIME_MS = 10000; // 10 seconds

    await new Promise(resolve => setTimeout(resolve, WAIT_TIME_MS));

    try {
      const response = await fetch(`${API_BASE_URL}${statusUrl}`);
      const data = await response.json();

      if (data.status === 'completed') {
        console.log('Analysis complete:', data.prediction);
        return {
          diagnosis: data.prediction,
          confidence: data.confidence,
          full_output: data.full_output,
        };
      } else if (data.status === 'failed') {
        throw new Error(data.error || 'Analysis failed on the server.');
      } else {
        throw new Error(`Task status: ${data.status}. Try again later.`);
      }
    } catch (e) {
      console.error('GET result error:', e);
      throw e;
    }
  };

  const fetchRecommendations = async (skin_disease: string, allergies: string[]) => {
    try {
      const response = await fetch(`${API_BASE_URL}/recommend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skin_disease,
          allergies,
        }),
      });

      const data = await response.json();
      return data;
    } catch (e) {
      console.error('Recommendation fetch error:', e);
      return { error: 'Failed to get recommendations' };
    }
  };

  const handleAnalyzePress = async () => {
    if (!image) {
      setError('Please select an image first.');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const uploadResponse = await uploadImage(image);

      if (!uploadResponse.success || !uploadResponse.status_url) {
        throw new Error('Backend did not return a valid status URL.');
      }

      console.log(`Upload successful. Status URL: ${uploadResponse.status_url}`);

      const result = await getResultAfterDelay(uploadResponse.status_url);
      const allergyList = allergyInput.split(',').map(a => a.trim()).filter(Boolean);
      const recommendations = await fetchRecommendations(result.diagnosis, allergyList);

      console.log('Analysis result:', JSON.stringify(result));
      
      router.push({
        pathname: 'resultsScreen',
        params: {
          result: JSON.stringify(result),
          allergies: allergyInput,
          recommendations: JSON.stringify(recommendations),
        },
      });

    } catch (e: any) {
      setError(e.message || 'An unknown error occurred.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#4F46E5" />
          <Text style={styles.backText}>Back to Home</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Skin Analysis</Text>
          <Text style={styles.subtitle}>
            Upload a photo of your skin condition and get instant AI-powered analysis
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Upload Your Image</Text>
          
          <TouchableOpacity
            style={styles.uploadBox}
            onPress={pickImage}
          >
            {image ? (
              <Image source={{ uri: image }} style={styles.imagePreview} />
            ) : (
              <View style={styles.uploadContent}>
                <Ionicons name="cloud-upload" size={48} color="#4F46E5" />
                <Text style={styles.uploadText}>
                  Tap to select an image
                </Text>
                <Text style={styles.uploadSubtext}>
                  or drag & drop here
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.galleryButton]} 
              onPress={pickImage}
            >
              <Ionicons name="images" size={20} color="white" />
              <Text style={styles.actionButtonText}>Choose from Gallery</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.cameraButton]}
              onPress={takePhoto}
            >
              <Ionicons name="camera" size={20} color="white" />
              <Text style={styles.actionButtonText}>Take Photo</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.supportedFormats}>
            Supported formats: JPG, PNG, WEBP
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Allergy Information</Text>
          <Text style={styles.allergyDescription}>
            Let us know about any allergies to get personalized recommendations
          </Text>
          <TextInput
            style={styles.allergyTextInput}
            value={allergyInput}
            onChangeText={setAllergyInput}
            placeholder="e.g., peanuts, dairy, gluten"
            placeholderTextColor="#94a3b8"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.tipsContainer}>
          <View style={styles.tipsHeader}>
            <Ionicons name="bulb-outline" size={24} color="#F59E0B" />
            <Text style={styles.tipsTitle}>Tips for Best Results</Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle" size={16} color="#10B981" />
            <Text style={styles.tipText}>Use good lighting</Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle" size={16} color="#10B981" />
            <Text style={styles.tipText}>Focus on the affected area</Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle" size={16} color="#10B981" />
            <Text style={styles.tipText}>Avoid shadows and glare</Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle" size={16} color="#10B981" />
            <Text style={styles.tipText}>Include a size reference if possible</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleAnalyzePress}
          style={[styles.analyzeButton, isAnalyzing && styles.disabledButton]}
          disabled={isAnalyzing}
        >
          {isAnalyzing ? (
            <>
              <ActivityIndicator size="small" color="white" />
              <Text style={styles.analyzeButtonText}>Analyzing...</Text>
            </>
          ) : (
            <>
              <Ionicons name="analytics" size={20} color="white" />
              <Text style={styles.analyzeButtonText}>Analyze Image</Text>
            </>
          )}
        </TouchableOpacity>

        {error && (
          <View style={styles.errorBox}>
            <Ionicons name="warning" size={20} color="#DC2626" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: '#F9FAFB',
  },
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 20,
    paddingBottom: 40,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 10,
  },
  backText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#4F46E5',
    fontWeight: '500',
  },
  header: {
    marginBottom: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: '90%',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  uploadBox: {
    width: '100%',
    height: 200,
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    overflow: 'hidden',
  },
  uploadContent: {
    alignItems: 'center',
    padding: 20,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    resizeMode: 'cover',
  },
  uploadText: {
    fontSize: 16,
    color: '#111827',
    marginTop: 12,
    fontWeight: '600',
  },
  uploadSubtext: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flex: 1,
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  galleryButton: {
    backgroundColor: '#4F46E5',
  },
  cameraButton: {
    backgroundColor: '#10B981',
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 8,
  },
  supportedFormats: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  allergyDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  allergyTextInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#F9FAFB',
  },
  tipsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginLeft: 8,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 8,
  },
  analyzeButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  analyzeButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
  disabledButton: {
    backgroundColor: '#A5B4FC',
  },
  errorBox: {
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#DC2626',
    fontWeight: '500',
    marginLeft: 8,
  },
});

export default UploadScreen;