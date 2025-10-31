/**
 * Projects Screen
 * Màn hình danh sách dự án
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
  Image,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { api } from '../services/api'
import { Project, ApiResponse } from '../types/database'
import { COLORS, SPACING, FONT_SIZES } from '../constants/config'

export default function ProjectsScreen() {
  const navigation = useNavigation()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await api.get<ApiResponse<Project[]>>('/api/projects')
      
      if (response.success && response.data) {
        setProjects(response.data)
      } else {
        setError(response.error || 'Không thể tải danh sách dự án')
      }
    } catch (err) {
      console.error('Error loading projects:', err)
      setError('Lỗi kết nối đến server')
    } finally {
      setLoading(false)
    }
  }

  const getProjectTypeLabel = (type?: string) => {
    const types: Record<string, string> = {
      residential: '🏠 Nhà ở',
      commercial: '🏢 Thương mại',
      hospitality: '🏨 Khách sạn',
      office: '🏛️ Văn phòng',
      retail: '🛍️ Bán lẻ',
      other: '📋 Khác',
    }
    return types[type || 'other'] || '📋 Khác'
  }

  const getStatusColor = (status?: string) => {
    const colors: Record<string, string> = {
      planning: '#F59E0B',
      in_progress: '#3B82F6',
      completed: '#10B981',
      on_hold: '#EF4444',
    }
    return colors[status || 'planning'] || '#6B7280'
  }

  const renderProjectCard = ({ item }: { item: Project }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('ProjectDetail' as never, { id: item.id } as never)}
    >
      {/* Cover Image */}
      {item.cover_image_url ? (
        <Image
          source={{ uri: item.cover_image_url }}
          style={styles.coverImage}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Text style={styles.imagePlaceholderText}>🏗️</Text>
        </View>
      )}

      {/* Featured Badge */}
      {item.is_featured && (
        <View style={styles.featuredBadge}>
          <Text style={styles.featuredText}>⭐ Nổi bật</Text>
        </View>
      )}

      {/* Content */}
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {item.name}
        </Text>

        {item.description && (
          <Text style={styles.cardDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}

        <View style={styles.cardDetails}>
          <Text style={styles.projectType}>
            {getProjectTypeLabel(item.project_type)}
          </Text>
          {item.location && (
            <Text style={styles.location} numberOfLines={1}>
              📍 {item.location}
            </Text>
          )}
        </View>

        <View style={styles.cardFooter}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(item.status) },
            ]}
          >
            <Text style={styles.statusText}>
              {item.status === 'completed' ? 'Hoàn thành' : 
               item.status === 'in_progress' ? 'Đang thực hiện' :
               item.status === 'on_hold' ? 'Tạm dừng' : 'Lên kế hoạch'}
            </Text>
          </View>
          <Text style={styles.imageCount}>
            📷 {item.image_count || 0}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  )

  if (loading && projects.length === 0) {
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
        <TouchableOpacity style={styles.retryButton} onPress={loadProjects}>
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={projects}
        renderItem={renderProjectCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshing={loading}
        onRefresh={loadProjects}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Chưa có dự án nào</Text>
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
  coverImage: {
    width: '100%',
    height: 180,
    backgroundColor: COLORS.background,
  },
  imagePlaceholder: {
    width: '100%',
    height: 180,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    fontSize: 60,
  },
  featuredBadge: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    backgroundColor: 'rgba(251, 191, 36, 0.95)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 20,
  },
  featuredText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: '#FFFFFF',
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
  cardDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    marginBottom: SPACING.sm,
    lineHeight: 20,
  },
  cardDetails: {
    marginBottom: SPACING.sm,
  },
  projectType: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  location: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
  },
  statusText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  imageCount: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
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

