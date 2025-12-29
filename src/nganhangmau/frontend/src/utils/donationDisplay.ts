/**
 * Utility functions for displaying donation information
 * Feature: donation-validation-and-display-fix
 */

import { PhieuHienMauWithRelations } from '@/types/api.types';

/**
 * Get the display number for a donation count
 * 
 * @param donation - The donation record
 * @param fallbackIndex - The index to use if hienlan is invalid (0-based, will be converted to 1-based)
 * @returns The donation count to display (1-based)
 */
export function getDonationCount(
  donation: PhieuHienMauWithRelations,
  fallbackIndex: number
): number {
  // Try to parse hienlan as a number
  const hienlanValue = Number(donation.hienlan);
  
  // If it's a valid positive number, use it
  if (Number.isFinite(hienlanValue) && hienlanValue > 0) {
    return hienlanValue;
  }
  
  // Otherwise, fallback to index + 1 (convert 0-based to 1-based)
  return fallbackIndex + 1;
}

/**
 * Format the donation count for display
 * 
 * @param count - The donation count number
 * @returns Formatted string like "Lần hiến thứ 1"
 */
export function formatDonationCount(count: number): string {
  return `Lần hiến thứ ${count}`;
}
