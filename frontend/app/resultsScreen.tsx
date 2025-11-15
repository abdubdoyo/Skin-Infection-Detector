import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// Define your backend URL in one place for easy updates.
const API_BASE_URL = 'http://192.168.2.13:8000'; // Ensure this is correct

export default function ResultsScreen() {
  const { result, allergies } = useLocalSearchParams(); // Get result and allergies from navigation params
  const router = useRouter();

  const [recommendationData, setRecommendationData] = useState(null);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const [recommendationError, setRecommendationError] = useState(null);

  // Safely parse the initial image analysis result to get skinCondition
  let parsedImageAnalysisResult = null;
  if (typeof result === 'string') {
    try {
      parsedImageAnalysisResult = JSON.parse(decodeURIComponent(result));
    } catch (e) {
      console.error("Failed to parse image analysis result JSON:", e);
    }
  } else if (Array.isArray(result) && result.length > 0 && typeof result[0] === 'string') {
    try {
      parsedImageAnalysisResult = JSON.parse(decodeURIComponent(result[0]));
    } catch (e) {
      console.error("Failed to parse image analysis result JSON from array:", e);
    }
  }

  // Extract skin condition from the image analysis result
  // This will be the dynamic skin disease used for AI prompting

  const skinConditionFromImage =
  typeof parsedImageAnalysisResult?.diagnosis === 'string'
    ? parsedImageAnalysisResult.diagnosis
    : parsedImageAnalysisResult?.diagnosis?.predicted_class || 'Unknown';

  // Parse allergies from the navigation parameter
  const parsedAllergies = allergies
    ? (typeof allergies === 'string' ? allergies.split(',').map(a => a.trim()).filter(a => a) : [])
    : [];

  // Function to fetch recommendations from the backend
  const fetchRecommendations = async () => {
    setIsLoadingRecommendations(true);
    setRecommendationError(null);
    setRecommendationData(null);

    try {
      const response = await fetch(`${API_BASE_URL}/recommend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          skin_disease: skinConditionFromImage, // Using the dynamically extracted skin condition
          allergies: parsedAllergies,           // Using the user-provided allergies
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to get recommendations: ${errorText}`);
      }

      const data = await response.json();
      setRecommendationData(data);
    } catch (e) {
      console.error('Error fetching recommendations:', e);
      setRecommendationError(e.message || 'An error occurred while fetching recommendations.');
    } finally {
      setIsLoadingRecommendations(false);
    }
  };

  // Automatically fetch recommendations when the component mounts or skinConditionFromImage/allergies change
  useEffect(() => {
    // Only fetch if not already loading and no data is present, and we have a skin condition
    if (skinConditionFromImage && !recommendationData && !isLoadingRecommendations) {
      fetchRecommendations();
    }
  }, [skinConditionFromImage, allergies]); // Re-run fetch if skin condition or allergies change

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Ionicons name="arrow-back" size={20} color="#1e293b" />
        <Text style={styles.backText}>Back to Upload</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Skin Recommendations</Text>

      {/* Tab-like display for dynamically detected skin disease and user-provided allergies */}
      <View style={styles.infoTab}>
        <Text style={styles.infoTabText}>
          <Text style={styles.boldText}>Condition:</Text> {skinConditionFromImage}
        </Text>
        <Text style={styles.infoTabText}>
          <Text style={styles.boldText}>Allergies:</Text> {parsedAllergies.length > 0 ? parsedAllergies.join(', ') : 'None'}
        </Text>
      </View>

      {/* AI-Prompted Recommendations */}
      {recommendationError ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{recommendationError}</Text>
          <Text style={styles.errorText}>Please try again or check your backend connection.</Text>
        </View>
      ) : recommendationData ? (
        <>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Diet & Supplement Recommendations for {recommendationData.condition || skinConditionFromImage}</Text>
          </View>

          {/* Healthy Foods Section */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Healthy Foods</Text>
            {recommendationData.healthy_foods?.length > 0 ? (
              recommendationData.healthy_foods.map((food, index) => (
                <View key={index} style={styles.itemContainer}>
                  <Text style={styles.listItemName}>• {food.name}</Text>
                  {food.nutrients && <Text style={styles.listItemDetail}><Text style={styles.boldText}>Nutrients:</Text> {food.nutrients}</Text>}
                  {food.benefit && <Text style={styles.listItemDetail}><Text style={styles.boldText}>Benefit:</Text> {food.benefit}</Text>}
                </View>
              ))
            ) : (
              <Text style={styles.noDataText}>No specific healthy food recommendations at this time.</Text>
            )}
          </View>

          {/* Foods to Avoid Section */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Foods to Avoid</Text>
            {recommendationData.foods_to_avoid?.length > 0 ? (
              recommendationData.foods_to_avoid.map((food, index) => (
                <Text key={index} style={styles.listItem}>• {food}</Text>
              ))
            ) : (
              <Text style={styles.noDataText}>No specific foods to avoid listed at this time.</Text>
            )}
          </View>

          {/* Supplements Section */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Recommended Supplements</Text>
            {recommendationData.supplements?.length > 0 ? (
              recommendationData.supplements.map((supplement, index) => (
                <View key={index} style={styles.itemContainer}>
                  <Text style={styles.listItemName}>• {supplement.name}</Text>
                  {supplement.dosage && <Text style={styles.listItemDetail}><Text style={styles.boldText}>Dosage:</Text> {supplement.dosage}</Text>}
                  {supplement.benefit && <Text style={styles.listItemDetail}><Text style={styles.boldText}>Benefit:</Text> {supplement.benefit}</Text>}
                </View>
              ))
            ) : (
              <Text style={styles.noDataText}>No specific supplement recommendations at this time.</Text>
            )}
          </View>
        </>
      ) : (
        <View style={styles.loadingContainer}>
          {isLoadingRecommendations ? (
            <>
              <ActivityIndicator size="large" color="#3b82f6" />
              <Text style={styles.loadingText}>Fetching recommendations...</Text>
            </>
          ) : (
            <Text style={styles.noDataText}>No recommendations available. Please ensure an image was analyzed and a skin condition was detected.</Text>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#f8fafc',
    minHeight: '100%',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 12,
  },
  backText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '500',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 24,
    textAlign: 'center',
  },
  infoTab: {
    backgroundColor: '#e0f2fe',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#90cdf4',
    alignItems: 'center',
  },
  infoTabText: {
    fontSize: 16,
    color: '#1e40af',
    marginBottom: 5,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 10,
  },
  summaryText: {
    fontSize: 16,
    color: '#334155',
    lineHeight: 24,
    marginBottom: 8,
  },
  boldText: {
    fontWeight: 'bold',
  },
  listItem: {
    fontSize: 16,
    color: '#334155',
    marginBottom: 8,
    lineHeight: 24,
    marginLeft: 5,
  },
  itemContainer: {
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  listItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 5,
  },
  listItemDetail: {
    fontSize: 14,
    color: '#334155',
    marginLeft: 15,
    lineHeight: 20,
  },
  noDataText: {
    fontSize: 16,
    color: '#64748b',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 10,
  },
  rawResultText: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#555',
    backgroundColor: '#f1f5f9',
    padding: 10,
    borderRadius: 8,
    maxHeight: 200,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#334155',
  },
  errorContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#fee2e2',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#dc2626',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
});
import { Stack } from 'expo-router';
