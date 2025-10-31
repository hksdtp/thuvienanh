/**
 * Fabrics Screen
 * Màn hình danh sách vải
 */

import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  TextInput,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { fabricsApi } from '../services/fabricsApi'
import { Fabric } from '../types/database'
import { COLORS, SPACING, FONT_SIZES } from '../constants/config'

export default function FabricsScreen() {
  const navigation = useNavigation()
  const [fabrics, setFabrics] = useState<Fabric[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadFabrics()
  }, [])

  const loadFabrics = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fabricsApi.getAll()
      
      if (response.success && response.data) {
        setFabrics(response.data)
      } else {
        setError(response.error || 'Không thể tải danh sách vải')
      }
    } catch (err) {
      console.error('Error loading fabrics:', err)
      setError('Lỗi kết nối đến server')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadFabrics()
      return
    }

    try {
      setLoading(true)
      const response = await fabricsApi.getAll({ search: searchQuery })
      
      if (response.success && response.data) {
        setFabrics(response.data)
      }
    } catch (err) {
      console.error('Error searching fabrics:', err)
    } finally {
      setLoading(false)
    }
  }

  const renderFabricCard = ({ item }: { item: Fabric }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('FabricDetail' as never, { id: item.id } as never)}
    >
      {/* Image placeholder */}
      <View style={styles.imagePlaceholder}>
        <Text style={styles.imagePlaceholderText}>🧵</Text>
      </View>

      {/* Content */}
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.cardCode}>Mã: {item.code}</Text>
        
        <View style={styles.cardDetails}>
          <Text style={styles.cardDetail}>📏 {item.material}</Text>
          <Text style={styles.cardDetail}>🎨 {item.color}</Text>
        </View>

        {item.price_per_meter && (
          <Text style={styles.cardPrice}>
            {item.price_per_meter.toLocaleString('vi-VN')} đ/m
          </Text>
        )}
      </View>
    </TouchableOpacity>
  )

  if (loading && fabrics.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Đang tải...</Text>
      </View>
    )
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>❌ {error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadFabrics}>
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm vải..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>🔍</Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      <FlatList
        data={fabrics}
        renderItem={renderFabricCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshing={loading}
        onRefresh={loadFabrics}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Không có vải nào</Text>
          </View>
        }
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.text.secondary,
  },
  errorText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.error,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: 8,
  },
  retryButtonText: {
    color: COLORS.surface,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  searchInput: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    fontSize: FONT_SIZES.md,
    marginRight: SPACING.sm,
  },
  searchButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonText: {
    fontSize: FONT_SIZES.lg,
  },
  listContent: {
    padding: SPACING.md,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  imagePlaceholder: {
    height: 150,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    fontSize: 60,
  },
  cardContent: {
    padding: SPACING.md,
  },
  cardTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  cardCode: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    marginBottom: SPACING.sm,
  },
  cardDetails: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.sm,
  },
  cardDetail: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
  },
  cardPrice: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.primary,
  },
  emptyContainer: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.secondary,
  },
})

