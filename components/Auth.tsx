import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  Alert,
  ActivityIndicator,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  Image,
  TouchableOpacity,
  Text,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const passwordRef = useRef<any>(null);

  // Function to Login
  async function signInWithEmail() {
    Keyboard.dismiss();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) Alert.alert('Login Error', error.message);
    setLoading(false);
  }

  // Function to Sign Up
  async function signUpWithEmail() {
    Keyboard.dismiss();
    setLoading(true);
    // 1. Create User in Auth
    const { data: { session }, error } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) {
      Alert.alert('Sign Up Error', error.message);
      setLoading(false);
      return;
    }

    // 2. Create Profile in Database (Linking Auth ID to our 'profiles' table)
    // Note: We only do this if a session was created successfully
    if (session) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: session.user.id,
            email: session.user.email,
            role: 'THERAPIST', // Therapist app
            full_name: 'New Therapist'
          }
        ]);

      if (profileError) {
        console.error('Error creating profile:', profileError);
      } else {
        Alert.alert('Success', 'Account created! You are now logged in.');
      }
    }

    setLoading(false);
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()} accessible={false}>
        <View style={styles.screen}>
          <View style={styles.heroCard}>
            <View style={styles.logoWrap}>
              <Image source={require('../assets/icon.png')} style={styles.logo} resizeMode="contain" />
            </View>
            <View>
              <Text style={styles.title}>Therapist Portal</Text>
              <Text style={styles.subtitle}>Log in to accept jobs and manage sessions</Text>
            </View>
          </View>

          <View style={styles.formCard}>
            <View style={styles.inputRow}>
              <Ionicons name="mail-outline" size={20} color={COLORS.muted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                returnKeyType="next"
                blurOnSubmit={false}
                onSubmitEditing={() => passwordRef.current?.focus()}
                placeholderTextColor={COLORS.muted}
              />
            </View>

            <View style={[styles.inputRow, { marginTop: 14 }]}>
              <Ionicons name="lock-closed-outline" size={20} color={COLORS.muted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                secureTextEntry={true}
                autoCapitalize="none"
                value={password}
                onChangeText={setPassword}
                returnKeyType="done"
                ref={passwordRef}
                blurOnSubmit={true}
                onSubmitEditing={signInWithEmail}
                placeholderTextColor={COLORS.muted}
              />
            </View>

            <TouchableOpacity style={styles.primaryBtn} onPress={signInWithEmail} activeOpacity={0.85} disabled={loading}>
              {loading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.primaryBtnText}>Sign In</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryBtn} onPress={signUpWithEmail} activeOpacity={0.9} disabled={loading}>
              <Text style={styles.secondaryBtnText}>Create Therapist Account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SIZES.padding,
    justifyContent: 'center',
    gap: 16,
  },
  heroCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    ...SHADOWS.medium,
  },
  logoWrap: {
    width: 68,
    height: 68,
    borderRadius: 18,
    backgroundColor: COLORS.goldLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 48,
    height: 48,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  subtitle: {
    marginTop: 4,
    color: COLORS.muted,
  },
  formCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: 18,
    ...SHADOWS.medium,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radius,
    paddingHorizontal: 12,
    height: 52,
    backgroundColor: COLORS.white,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.secondary,
    paddingVertical: 8,
  },
  primaryBtn: {
    marginTop: 16,
    backgroundColor: COLORS.primary,
    height: 52,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.light,
  },
  primaryBtnText: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: '700',
  },
  secondaryBtn: {
    marginTop: 12,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.primary,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '700',
  },
});