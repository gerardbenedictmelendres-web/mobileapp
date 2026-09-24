import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Modal, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { colors } from '../styles/colors';
import { styles } from '../styles/styles';
import { Task } from '../types';

interface ProfileScreenProps {
  darkModeEnabled: boolean;
  setDarkModeEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  quietModeEnabled: boolean;
  setQuietModeEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  remindersEnabled: boolean;
  setRemindersEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  compactModeEnabled: boolean;
  setCompactModeEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  prioritySortEnabled: boolean;
  setPrioritySortEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  fullName: string;
  setFullName: React.Dispatch<React.SetStateAction<string>>;
  email: string;
  tasks: Task[];
  completedCount: number;
  setView: React.Dispatch<React.SetStateAction<'login' | 'dashboard' | 'profile'>>;
}

export function ProfileScreen({
  darkModeEnabled, setDarkModeEnabled, quietModeEnabled, setQuietModeEnabled, remindersEnabled, setRemindersEnabled,
  compactModeEnabled, setCompactModeEnabled, prioritySortEnabled, setPrioritySortEnabled,
  fullName, setFullName, email, tasks, completedCount, setView
}: ProfileScreenProps) {
  const [profileImageUri, setProfileImageUri] = useState<string | null>(null);
  const [isProfileEditorOpen, setIsProfileEditorOpen] = useState(false);
  const [editedProfileName, setEditedProfileName] = useState('');

  const displayName = fullName.trim() || email.split('@')[0] || 'Focus member';

  const triggerHaptic = (style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light) => {
    Haptics.impactAsync(style);
  };

  const openProfileEditor = () => {
    triggerHaptic();
    setEditedProfileName(fullName.trim() || displayName);
    setIsProfileEditorOpen(true);
  };

  const saveProfile = () => {
    const name = editedProfileName.trim();
    if (name.length < 2) {
      Alert.alert('Add your name', 'Your profile name needs at least two characters.');
      return;
    }
    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
    setFullName(name);
    setIsProfileEditorOpen(false);
  };

  const changeProfilePhoto = async () => {
    triggerHaptic();
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission required', 'Allow photo access to choose a profile picture.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (!result.canceled) setProfileImageUri(result.assets[0].uri);
  };

  return (
    <View style={[styles.container, darkModeEnabled && styles.darkContainer]}>
      <View pointerEvents="none" style={[styles.backgroundWashTop, darkModeEnabled && styles.darkWashTop]} />
      <View pointerEvents="none" style={[styles.backgroundWashBottom, darkModeEnabled && styles.darkWashBottom]} />
      <View style={styles.profileHeader}>
        <TouchableOpacity onPress={() => { triggerHaptic(); setView('dashboard'); }} style={styles.backButton}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={[styles.profileHeaderTitle, darkModeEnabled && styles.darkText]}>Profile</Text>
        <TouchableOpacity onPress={openProfileEditor} style={styles.editProfileButton}>
          <Text style={styles.editProfileText}>Edit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.profileScroll} showsVerticalScrollIndicator={false}>
        <View style={styles.profileHeroWrap}>
          <View style={styles.profileHeroDepth} />
          <BlurView intensity={82} tint={darkModeEnabled ? 'dark' : 'light'} style={[styles.profileHero, darkModeEnabled && styles.darkGlass]}>
            {profileImageUri ? (
              <Image source={{ uri: profileImageUri }} style={styles.avatarLarge} />
            ) : (
              <View style={styles.avatarLarge}>
                <Text style={styles.avatarText}>{displayName.charAt(0).toUpperCase()}</Text>
              </View>
            )}
            <Text style={[styles.profileName, darkModeEnabled && styles.darkText]}>{displayName}</Text>
            <Text style={[styles.profileEmail, darkModeEnabled && styles.darkMuted]}>{email.trim() || 'No email added'}</Text>
            <View style={styles.memberBadge}>
              <Text style={styles.memberBadgeText}>FOCUS MEMBER</Text>
            </View>
          </BlurView>
        </View>

        <View style={styles.statsRow}>
          <BlurView intensity={72} tint={darkModeEnabled ? 'dark' : 'light'} style={[styles.statCard, darkModeEnabled && styles.darkGlass]}>
            <Text style={styles.statValue}>{tasks.length}</Text>
            <Text style={styles.statLabel}>TODAY</Text>
          </BlurView>
          <BlurView intensity={72} tint={darkModeEnabled ? 'dark' : 'light'} style={[styles.statCard, darkModeEnabled && styles.darkGlass]}>
            <Text style={styles.statValue}>{completedCount}</Text>
            <Text style={styles.statLabel}>DONE</Text>
          </BlurView>
          <BlurView intensity={72} tint={darkModeEnabled ? 'dark' : 'light'} style={[styles.statCard, darkModeEnabled && styles.darkGlass]}>
            <Text style={styles.statValue}>86%</Text>
            <Text style={styles.statLabel}>FOCUS</Text>
          </BlurView>
        </View>

        <Text style={[styles.profileSectionTitle, darkModeEnabled && styles.darkText]}>PREFERENCES</Text>
        <View style={[styles.preferencePanel, darkModeEnabled && styles.darkGlass]}>
          <TouchableOpacity activeOpacity={0.8} onPress={() => { triggerHaptic(); setDarkModeEnabled((enabled) => !enabled); }} style={styles.preferenceRow}>
            <View style={styles.preferenceIcon}>
              <Text style={styles.preferenceIconText}>◷</Text>
            </View>
            <View style={styles.preferenceCopy}>
              <Text style={[styles.preferenceTitle, darkModeEnabled && styles.darkText]}>Dark mode</Text>
              <Text style={[styles.preferenceDetail, darkModeEnabled && styles.darkMuted]}>Use a darker, lower-glare workspace</Text>
            </View>
            <View style={[styles.settingToggle, darkModeEnabled && styles.settingToggleActive]}>
              <View style={[styles.settingKnob, darkModeEnabled && styles.settingKnobActive]} />
            </View>
          </TouchableOpacity>
          <View style={styles.preferenceDivider} />
          <TouchableOpacity activeOpacity={0.8} onPress={() => { triggerHaptic(); setQuietModeEnabled((enabled) => !enabled); }} style={styles.preferenceRow}>
            <View style={styles.preferenceIcon}>
              <Text style={styles.preferenceIconText}>✦</Text>
            </View>
            <View style={styles.preferenceCopy}>
              <Text style={[styles.preferenceTitle, darkModeEnabled && styles.darkText]}>Quiet mode</Text>
              <Text style={[styles.preferenceDetail, darkModeEnabled && styles.darkMuted]}>{quietModeEnabled ? 'Notifications stay calm and focused' : 'Notifications are back on'}</Text>
            </View>
            <View style={[styles.settingToggle, quietModeEnabled && styles.settingToggleActive]}>
              <View style={[styles.settingKnob, quietModeEnabled && styles.settingKnobActive]} />
            </View>
          </TouchableOpacity>
          <View style={styles.preferenceDivider} />
          <TouchableOpacity activeOpacity={0.8} onPress={() => { triggerHaptic(); setRemindersEnabled((enabled) => !enabled); }} style={styles.preferenceRow}>
            <View style={styles.preferenceIcon}>
              <Text style={styles.preferenceIconText}>◌</Text>
            </View>
            <View style={styles.preferenceCopy}>
              <Text style={[styles.preferenceTitle, darkModeEnabled && styles.darkText]}>Task reminders</Text>
              <Text style={[styles.preferenceDetail, darkModeEnabled && styles.darkMuted]}>{remindersEnabled ? 'A gentle nudge before focus time' : 'Reminders are paused'}</Text>
            </View>
            <View style={[styles.settingToggle, remindersEnabled && styles.settingToggleActive]}>
              <View style={[styles.settingKnob, remindersEnabled && styles.settingKnobActive]} />
            </View>
          </TouchableOpacity>
          <View style={styles.preferenceDivider} />
          <TouchableOpacity activeOpacity={0.8} onPress={() => { triggerHaptic(); setCompactModeEnabled((enabled) => !enabled); }} style={styles.preferenceRow}>
            <View style={styles.preferenceIcon}>
              <Text style={styles.preferenceIconText}>▦</Text>
            </View>
            <View style={styles.preferenceCopy}>
              <Text style={[styles.preferenceTitle, darkModeEnabled && styles.darkText]}>Compact task view</Text>
              <Text style={[styles.preferenceDetail, darkModeEnabled && styles.darkMuted]}>{compactModeEnabled ? 'Showing a tighter task list' : 'Showing spacious task rows'}</Text>
            </View>
            <View style={[styles.settingToggle, compactModeEnabled && styles.settingToggleActive]}>
              <View style={[styles.settingKnob, compactModeEnabled && styles.settingKnobActive]} />
            </View>
          </TouchableOpacity>
          <View style={styles.preferenceDivider} />
          <TouchableOpacity activeOpacity={0.8} onPress={() => { triggerHaptic(); setPrioritySortEnabled((enabled) => !enabled); }} style={styles.preferenceRow}>
            <View style={styles.preferenceIcon}>
              <Text style={styles.preferenceIconText}>↕</Text>
            </View>
            <View style={styles.preferenceCopy}>
              <Text style={[styles.preferenceTitle, darkModeEnabled && styles.darkText]}>Auto-sort by priority</Text>
              <Text style={[styles.preferenceDetail, darkModeEnabled && styles.darkMuted]}>{prioritySortEnabled ? 'Important tasks are first' : 'Tasks stay in their created order'}</Text>
            </View>
            <View style={[styles.settingToggle, prioritySortEnabled && styles.settingToggleActive]}>
              <View style={[styles.settingKnob, prioritySortEnabled && styles.settingKnobActive]} />
            </View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity activeOpacity={0.85} onPress={() => { triggerHaptic(Haptics.ImpactFeedbackStyle.Medium); setView('login'); }} style={[styles.logoutButton, darkModeEnabled && styles.darkLogoutButton]}>
          <Text style={styles.logoutText}>Log out</Text>
          <Text style={styles.logoutArrow}>→</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal animationType="slide" transparent visible={isProfileEditorOpen} onRequestClose={() => setIsProfileEditorOpen(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalBackdrop}>
          <BlurView intensity={92} tint={darkModeEnabled ? 'dark' : 'light'} style={[styles.profileEditorCard, darkModeEnabled && styles.darkGlass]}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <View>
                <Text style={[styles.modalEyebrow, darkModeEnabled && styles.darkText]}>YOUR IDENTITY</Text>
                <Text style={[styles.modalTitle, darkModeEnabled && styles.darkText]}>Edit profile</Text>
              </View>
              <TouchableOpacity onPress={() => setIsProfileEditorOpen(false)} style={styles.modalClose}>
                <Text style={styles.modalCloseText}>×</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity activeOpacity={0.85} onPress={changeProfilePhoto} style={styles.profilePhotoPicker}>
              {profileImageUri ? (
                <Image source={{ uri: profileImageUri }} style={styles.avatarEdit} />
              ) : (
                <View style={[styles.avatarEdit, styles.avatarEditFallback]}>
                  <Text style={styles.avatarText}>{displayName.charAt(0).toUpperCase()}</Text>
                </View>
              )}
              <View style={styles.photoEditBadge}>
                <Text style={styles.photoEditBadgeText}>+</Text>
              </View>
              <Text style={styles.changePhotoText}>Change profile picture</Text>
            </TouchableOpacity>

            <Text style={[styles.modalLabel, darkModeEnabled && styles.darkText]}>USERNAME</Text>
            <TextInput
              autoCapitalize="words"
              onChangeText={setEditedProfileName}
              placeholder="Your name"
              placeholderTextColor={colors.muted}
              style={[styles.taskInput, darkModeEnabled && styles.darkInput, darkModeEnabled && styles.darkInputText]}
              value={editedProfileName}
            />

            <TouchableOpacity activeOpacity={0.85} onPress={saveProfile} style={[styles.primaryButton, styles.modalButton]}>
              <Text style={styles.primaryButtonText}>Save profile</Text>
              <Text style={styles.buttonArrow}>→</Text>
            </TouchableOpacity>
          </BlurView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}