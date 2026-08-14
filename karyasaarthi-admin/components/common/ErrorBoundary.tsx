/**
 * Error Boundary — Catches unhandled JS errors in the component tree.
 * Shows a user-friendly error screen instead of crashing.
 * 
 * OWASP: Never exposes stack traces or internal error details to the user.
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, radius } from '@/utils/theme';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      // OWASP: Generic user-facing message, never expose stack trace
      errorMessage: 'Something went wrong. Please try again.',
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to your error reporting service (Sentry, Crashlytics, etc.)
    // NEVER log the full stack trace to the user
    console.error('[ErrorBoundary]', error.message);
  }

  handleRetry = () => {
    this.setState({ hasError: false, errorMessage: '' });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <View style={styles.container}>
          <View style={styles.iconCircle}>
            <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
          </View>
          <Text style={styles.title}>Oops!</Text>
          <Text style={styles.message}>{this.state.errorMessage}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={this.handleRetry}>
            <Ionicons name="refresh" size={20} color={colors.white} />
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl, backgroundColor: colors.background },
  iconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.errorContainer, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg },
  title: { ...typography.headlineLg, color: colors.onSurface, marginBottom: spacing.sm },
  message: { ...typography.bodyMd, color: colors.onSurfaceVariant, textAlign: 'center', marginBottom: spacing.xl },
  retryBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.primary, paddingVertical: 12, paddingHorizontal: 24, borderRadius: radius.full },
  retryText: { ...typography.labelLg, color: colors.white },
});
