/**
 * File Upload Service — Secure file picking + upload.
 * 
 * OWASP:
 * - File size limits enforced client-side (10MB default)
 * - MIME type validation before upload
 * - No file path leakage in error messages
 */

import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { Platform, Alert } from 'react-native';
import api from './api';

// ── Constants ────────────────────────────────────────────────────────────────
const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
const ALLOWED_DOC_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
];

// ── Pick image from camera or gallery ────────────────────────────────────────
export async function pickImage(
  source: 'camera' | 'gallery' = 'gallery'
): Promise<ImagePicker.ImagePickerAsset | null> {
  // Request permissions
  if (source === 'camera') {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Camera access is needed to take photos.');
      return null;
    }
  } else {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Photo library access is needed to select images.');
      return null;
    }
  }

  const result =
    source === 'camera'
      ? await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        })
      : await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          quality: 0.8,
        });

  if (result.canceled || !result.assets?.[0]) return null;

  const asset = result.assets[0];

  // Validate file size
  if (asset.fileSize && asset.fileSize > MAX_FILE_SIZE_BYTES) {
    Alert.alert('File Too Large', `Images must be under ${MAX_FILE_SIZE_MB}MB.`);
    return null;
  }

  return asset;
}

// ── Pick document ────────────────────────────────────────────────────────────
export async function pickDocument(): Promise<DocumentPicker.DocumentPickerAsset | null> {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: [...ALLOWED_DOC_TYPES, ...ALLOWED_IMAGE_TYPES],
      copyToCacheDirectory: true,
    });

    if (result.canceled || !result.assets?.[0]) return null;

    const asset = result.assets[0];

    // Validate file size
    if (asset.size && asset.size > MAX_FILE_SIZE_BYTES) {
      Alert.alert('File Too Large', `Files must be under ${MAX_FILE_SIZE_MB}MB.`);
      return null;
    }

    // Validate MIME type
    if (asset.mimeType && ![...ALLOWED_DOC_TYPES, ...ALLOWED_IMAGE_TYPES].includes(asset.mimeType)) {
      Alert.alert('Invalid File Type', 'Please select a PDF, Word, Excel, PowerPoint, or image file.');
      return null;
    }

    return asset;
  } catch {
    Alert.alert('Error', 'Failed to pick document. Please try again.');
    return null;
  }
}

// ── Upload file to backend ───────────────────────────────────────────────────
export async function uploadFile(
  uri: string,
  filename: string,
  mimeType: string,
  endpoint = '/api/upload'
): Promise<{ url: string; id: string } | null> {
  try {
    const formData = new FormData();
    formData.append('file', {
      uri: Platform.OS === 'ios' ? uri.replace('file://', '') : uri,
      name: sanitizeFilename(filename),
      type: mimeType,
    } as any);

    const { data } = await api.post(endpoint, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 30000, // 30s timeout for uploads
    });

    return data;
  } catch {
    Alert.alert('Upload Failed', 'Could not upload file. Please check your connection and try again.');
    return null;
  }
}

// ── Upload profile avatar ────────────────────────────────────────────────────
export async function uploadAvatar(uri: string): Promise<string | null> {
  const result = await uploadFile(uri, 'avatar.jpg', 'image/jpeg', '/api/auth/avatar');
  return result?.url || null;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Sanitize filename to prevent path traversal (OWASP A01) */
function sanitizeFilename(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9._-]/g, '_')  // Remove special chars
    .replace(/\.\./g, '_')              // Prevent path traversal
    .replace(/^\./, '_')                // No hidden files
    .slice(0, 255);                     // Limit length
}
