/**
 * FabricCard Component
 * Card component để hiển thị fabric
 */

import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native'
import { Fabric } from '../types/database'
import { COLORS, SPACING, FONT_SIZES } from '../constants/config'

interface FabricCardProps {
  fabric: Fabric
  onPress?: () => void
}

export default function FabricCard({ fabric, onPress }: FabricCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      {/* Image */}
      {fabric.primary_image_url ? (
        <Image
          source={{ uri: fabric.primary_image_url }}
          style={styles.image}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Text style={styles.imagePlaceholderText}>🧵</Text>
        </View>
      )}

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>
          {fabric.name}
        </Text>
        
        <Text style={styles.code}>Mã: {fabric.code}</Text>

        <View style={styles.details}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>📏</Text>
            <Text style={styles.detailText}>{fabric.material}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>🎨</Text>
            <Text style={styles.detailText}>{fabric.color}</Text>
          </View>
        </View>

        {fabric.price_per_meter && (
          <Text style={styles.price}>
            {fabric.price_per_meter.toLocaleString('vi-VN')} đ/m
          </Text>
        )}

        {/* Stock status */}
        {fabric.stock_quantity !== undefined && (
          <View style={[
            styles.stockBadge,
            fabric.stock_quantity > 0 ? styles.inStock : styles.outOfStock
          ]}>
            <Text style={styles.stockText}>
              {fabric.stock_quantity > 0 ? '✓ Còn hàng' : '✗ Hết hàng'}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
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
  image: {
    width: '100%',
    height: 150,
    backgroundColor: COLORS.background,
  },
  imagePlaceholder: {
    width: '100%',
    height: 150,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    fontSize: 60,
  },
  content: {
    padding: SPACING.md,
  },
  name: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  code: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    marginBottom: SPACING.sm,
  },
  details: {
    marginBottom: SPACING.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  detailLabel: {
    fontSize: FONT_SIZES.md,
    marginRight: SPACING.xs,
  },
  detailText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
  },
  price: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  stockBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
  },
  inStock: {
    backgroundColor: '#D1FAE5',
  },
  outOfStock: {
    backgroundColor: '#FEE2E2',
  },
  stockText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
  },
})

