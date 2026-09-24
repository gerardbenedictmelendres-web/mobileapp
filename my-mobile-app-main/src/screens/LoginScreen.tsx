import { BlurView } from 'expo-blur';
import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { BrandMonogram } from '../components/BrandMonogram';
import { colors } from '../styles/colors';
import { styles } from '../styles/styles';

interface LoginScreenProps {
  darkModeEnabled: boolean;
  isSigningUp: boolean;
  setIsSigningUp: React.Dispatch<React.SetStateAction<boolean>>;
  fullName: string;
  setFullName: React.Dispatch<React.SetStateAction<string>>;
  email: string;
  setEmail: React.Dispatch<React.SetStateAction<string>>;
  password: string;
  setPassword: React.Dispatch<React.SetStateAction<string>>;
  handleAuth: () => void;
}

export function LoginScreen({
  darkModeEnabled, isSigningUp, setIsSigningUp, fullName, setFullName, email, setEmail, password, setPassword, handleAuth
}: LoginScreenProps) {
  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
      <View style={[styles.container, darkModeEnabled && styles.darkContainer]}>
        <View pointerEvents="none" style={[styles.backgroundWashTop, darkModeEnabled && styles.darkWashTop]} />
        <View pointerEvents="none" style={[styles.backgroundWashBottom, darkModeEnabled && styles.darkWashBottom]} />
        <ScrollView contentContainerStyle={styles.loginScroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.loginContent}>
            <View style={styles.loginTopBar}>
              <BrandMonogram />
              <View style={[styles.liveBadge, darkModeEnabled && styles.darkGlass]}>
                <View style={styles.liveDot} />
                <Text style={[styles.liveBadgeText, darkModeEnabled && styles.darkText]}>YOUR SPACE</Text>
              </View>
            </View>
            <View style={styles.loginHeroCopy}>
              <Text style={[styles.eyebrow, darkModeEnabled && styles.darkText]}>{isSigningUp ? 'CREATE YOUR SPACE' : 'WELCOME BACK'}</Text>
              <Text style={[styles.title, darkModeEnabled && styles.darkText]}>{isSigningUp ? <>Start with{`\n`}what matters.</> : <>Make space for{`\n`}what matters.</>}</Text>
              <Text style={[styles.subtitle, darkModeEnabled && styles.darkMuted]}>{isSigningUp ? 'A calmer way to plan your day.' : 'Your day, thoughtfully organized.'}</Text>
            </View>

            <View style={styles.loginPanelWrap}>
              <View pointerEvents="none" style={styles.loginPanelDepth} />
              <BlurView intensity={84} tint={darkModeEnabled ? 'dark' : 'light'} style={[styles.loginPanel, darkModeEnabled && styles.darkGlass]}>
                <View style={styles.form}>
                  {isSigningUp && (
                    <BlurView intensity={78} tint={darkModeEnabled ? 'dark' : 'light'} style={[styles.inputCard, darkModeEnabled && styles.darkInput]}>
                      <Text style={styles.inputLabel}>FULL NAME</Text>
                      <TextInput
                        autoCapitalize="words"
                        onChangeText={setFullName}
                        placeholder="Your name"
                        placeholderTextColor={colors.muted}
                        style={[styles.input, darkModeEnabled && styles.darkInputText]}
                        value={fullName}
                      />
                    </BlurView>
                  )}
                  <BlurView intensity={78} tint={darkModeEnabled ? 'dark' : 'light'} style={[styles.inputCard, darkModeEnabled && styles.darkInput]}>
                    <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
                    <TextInput
                      autoCapitalize="none"
                      keyboardType="email-address"
                      onChangeText={setEmail}
                      placeholder="you@example.com"
                      placeholderTextColor={colors.muted}
                      style={[styles.input, darkModeEnabled && styles.darkInputText]}
                      value={email}
                    />
                  </BlurView>
                  <BlurView intensity={78} tint={darkModeEnabled ? 'dark' : 'light'} style={[styles.inputCard, darkModeEnabled && styles.darkInput]}>
                    <Text style={styles.inputLabel}>PASSWORD</Text>
                    <TextInput
                      onChangeText={setPassword}
                      placeholder="Enter your password"
                      placeholderTextColor={colors.muted}
                      secureTextEntry
                      style={[styles.input, darkModeEnabled && styles.darkInputText]}
                      value={password}
                    />
                  </BlurView>
                </View>

                <TouchableOpacity activeOpacity={0.85} onPress={handleAuth} style={styles.primaryButton}>
                  <Text style={styles.primaryButtonText}>{isSigningUp ? 'Create account' : 'Log In'}</Text>
                  <Text style={styles.buttonArrow}>→</Text>
                </TouchableOpacity>
                <TouchableOpacity activeOpacity={0.8} onPress={() => setIsSigningUp((current) => !current)} style={styles.signupButton}>
                  <Text style={[styles.signupPrompt, darkModeEnabled && styles.darkMuted]}>{isSigningUp ? 'Already have an account?' : 'New here?'}</Text>
                  <Text style={[styles.signupLink, darkModeEnabled && styles.darkText]}>{isSigningUp ? 'Log in' : 'Sign up'}</Text>
                </TouchableOpacity>
              </BlurView>
            </View>
          </View>

          <View style={styles.loginFooter}>
            <Text style={[styles.appName, darkModeEnabled && styles.darkText]}>Un-Lazy</Text>
            <Text style={[styles.appTagline, darkModeEnabled && styles.darkMuted]}>Organized chaos for the chronically late.</Text>
            <Text style={[styles.copyright, darkModeEnabled && styles.darkMuted]}>© 2026 Un-Lazy</Text>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}