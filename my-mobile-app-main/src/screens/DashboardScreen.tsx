import DateTimePicker from '@react-native-community/datetimepicker';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Keyboard, KeyboardAvoidingView, LayoutAnimation, Modal, Platform, RefreshControl, ScrollView, Text, TextInput, TouchableOpacity, UIManager, View } from 'react-native';
import { BrandMonogram } from '../components/BrandMonogram';
import { colors } from '../styles/colors';
import { styles } from '../styles/styles';
import { Category, CategoryFilter, Filter, Priority, Task, TimePickerTarget } from '../types';
import { formatDate, formatTime, getDueDateContext, parseDate, parseTime } from '../utils/dateUtils';

type DateTimePickerEvent = { type: string; nativeEvent: any };

if (Platform.OS === 'android') {
  (UIManager as any).setLayoutAnimationEnabledExperimental?.(true);
}

interface DashboardScreenProps {
  darkModeEnabled: boolean;
  compactModeEnabled: boolean;
  quietModeEnabled: boolean;
  remindersEnabled: boolean;
  prioritySortEnabled: boolean;
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  filter: Filter;
  setFilter: React.Dispatch<React.SetStateAction<Filter>>;
  categoryFilter: CategoryFilter;
  setCategoryFilter: React.Dispatch<React.SetStateAction<CategoryFilter>>;
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  displayName: string;
  setView: React.Dispatch<React.SetStateAction<'login' | 'dashboard' | 'profile'>>;
}

export function DashboardScreen({
  darkModeEnabled, compactModeEnabled, quietModeEnabled, remindersEnabled, prioritySortEnabled,
  tasks, setTasks, filter, setFilter, categoryFilter, setCategoryFilter,
  searchQuery, setSearchQuery, displayName, setView
}: DashboardScreenProps) {
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskNotes, setNewTaskNotes] = useState('');
  const [newTaskTime, setNewTaskTime] = useState('9:00 PM');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState<Category>('Work');
  const [newTaskPriority, setNewTaskPriority] = useState<Priority>('Medium');
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [editedTaskTitle, setEditedTaskTitle] = useState('');
  const [editedTaskNotes, setEditedTaskNotes] = useState('');
  const [editedTaskTime, setEditedTaskTime] = useState('');
  const [editedTaskDueDate, setEditedTaskDueDate] = useState('');
  const [timePickerTarget, setTimePickerTarget] = useState<TimePickerTarget>(null);
  const [datePickerTarget, setDatePickerTarget] = useState<'new-date' | 'edit-date' | null>(null);
  const [timePickerDate, setTimePickerDate] = useState(new Date());
  const [datePickerDate, setDatePickerDate] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  
  const [deletedTask, setDeletedTask] = useState<Task | null>(null);
  const [toastVisible, setToastVisible] = useState(false);

  const currentHour = new Date().getHours();
  let greeting = 'Good evening';
  if (currentHour < 12) greeting = 'Good morning';
  else if (currentHour < 18) greeting = 'Good afternoon';
  const todayDateString = new Date().toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' }).toUpperCase();

  const completedCount = tasks.filter((task) => task.done).length;
  const progress = tasks.length === 0 ? 0 : (completedCount / tasks.length) * 100;

  const filteredTasks = tasks.filter((task) => {
    const matchesFilter = filter === 'Done' ? task.done : filter === 'Active' ? !task.done : true;
    const matchesCategory = categoryFilter === 'All' || task.category === categoryFilter;
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const matchesSearch = !normalizedQuery || `${task.title} ${task.category}`.toLowerCase().includes(normalizedQuery);
    return matchesFilter && matchesCategory && matchesSearch;
  });
  
  const visibleTasks = prioritySortEnabled
    ? [...filteredTasks].sort((firstTask, secondTask) => {
        const priorityRank = { High: 0, Medium: 1, Low: 2 };
        return priorityRank[firstTask.priority] - priorityRank[secondTask.priority];
      })
    : filteredTasks;

  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [filter, categoryFilter, searchQuery]);

  const triggerHaptic = (style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light) => {
    Haptics.impactAsync(style);
  };

  const animateList = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  };

  const toggleTask = (id: number) => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
    animateList();
    setTasks((currentTasks) =>
      currentTasks.map((task) => (task.id === id ? { ...task, done: !task.done } : task)),
    );
  };

  const openTaskDetails = (task: Task) => {
    triggerHaptic();
    setSelectedTaskId(task.id);
    setEditedTaskTitle(task.title);
    setEditedTaskTime(task.time);
    setEditedTaskDueDate(task.dueDate || '');
    setEditedTaskNotes(task.notes);
  };

  const closeTaskDetails = () => {
    setSelectedTaskId(null);
    setEditedTaskTitle('');
    setEditedTaskTime('');
    setEditedTaskDueDate('');
    setEditedTaskNotes('');
  };

  const saveTaskTitle = () => {
    const title = editedTaskTitle.trim();
    const time = editedTaskTime.trim();
    if (!title || !time || selectedTaskId === null) return;
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === selectedTaskId
          ? { ...task, title, time, dueDate: editedTaskDueDate.trim(), notes: editedTaskNotes.trim() }
          : task,
      ),
    );
    closeTaskDetails();
  };

  const removeTask = (id: number) => {
    const taskToSave = tasks.find(t => t.id === id);
    if (!taskToSave) return;
    
    animateList();
    setTasks((currentTasks) => currentTasks.filter((task) => task.id !== id));
    setDeletedTask(taskToSave);
    setToastVisible(true);

    setTimeout(() => {
      setToastVisible(false);
      setDeletedTask(null);
    }, 3000);
  };

  const undoDelete = () => {
    if (deletedTask) {
      triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
      animateList();
      setTasks((prev) => [deletedTask, ...prev]);
      setToastVisible(false);
      setDeletedTask(null);
    }
  };

  const confirmDeleteTask = (id: number) => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert('Delete task?', 'This task and its notes will be removed.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', onPress: () => removeTask(id), style: 'destructive' },
    ]);
  };

  const deleteSelectedTask = () => {
    if (selectedTaskId !== null) {
      confirmDeleteTask(selectedTaskId);
      closeTaskDetails();
    }
  };

  const clearCompletedTasks = () => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
    animateList();
    setTasks((currentTasks) => currentTasks.filter((task) => !task.done));
    setFilter('All');
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 700);
  };

  const openTimePicker = (target: Exclude<TimePickerTarget, null>, value: string) => {
    setTimePickerDate(parseTime(value));
    setTimePickerTarget(target);
  };

  const openDatePicker = (target: 'new-date' | 'edit-date', value: string) => {
    setDatePickerDate(parseDate(value));
    setDatePickerTarget(target);
  };

  const handleTimeChange = (event: DateTimePickerEvent, date?: Date) => {
    if (event.type === 'dismissed') {
      setTimePickerTarget(null);
      return;
    }
    if (!date) return;
    const formattedTime = formatTime(date);
    if (timePickerTarget === 'new') setNewTaskTime(formattedTime);
    if (timePickerTarget === 'edit') setEditedTaskTime(formattedTime);
    if (Platform.OS === 'android') setTimePickerTarget(null);
  };

  const handleDateChange = (event: DateTimePickerEvent, date?: Date) => {
    if (event.type === 'dismissed') {
      setDatePickerTarget(null);
      return;
    }
    if (!date) return;
    const formattedDate = formatDate(date);
    if (datePickerTarget === 'new-date') setNewTaskDueDate(formattedDate);
    if (datePickerTarget === 'edit-date') setEditedTaskDueDate(formattedDate);
    if (Platform.OS === 'android') setDatePickerTarget(null);
  };

  const addTask = () => {
    const title = newTaskTitle.trim();
    if (!title) return;
    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
    animateList();

    setTasks((currentTasks) => [
      {
        id: Math.max(...currentTasks.map((task) => task.id), 0) + 1,
        title,
        time: newTaskTime.trim() || '9:00 PM',
        dueDate: newTaskDueDate.trim(),
        notes: newTaskNotes.trim(),
        done: false,
        category: newTaskCategory,
        priority: newTaskPriority,
      },
      ...currentTasks,
    ]);
    setNewTaskTitle('');
    setNewTaskNotes('');
    setNewTaskTime('9:00 PM');
    setNewTaskDueDate('');
    setNewTaskCategory('Work');
    setNewTaskPriority('Medium');
    setIsAddTaskOpen(false);
  };

  return (
    <View style={styles.flex}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <View style={[styles.container, darkModeEnabled && styles.darkContainer]}>
          <View pointerEvents="none" style={styles.backgroundWashTop} />
          <View pointerEvents="none" style={styles.backgroundWashBottom} />
          <View style={styles.dashboardHeader}>
            <View>
              <View style={styles.homeBrandWrap}>
                <BrandMonogram compact />
                <Text style={[styles.homeBrand, darkModeEnabled && styles.darkText]}>Un-Lazy</Text>
              </View>
              <Text style={[styles.eyebrow, darkModeEnabled && styles.darkText]}>{todayDateString}</Text>
              <Text style={[styles.dashboardTitle, darkModeEnabled && styles.darkText]}>{greeting}, {displayName.split(' ')[0]}</Text>
            </View>
            <TouchableOpacity onPress={() => { triggerHaptic(); setView('profile'); }} style={styles.profileButton}>
              <Text style={styles.profileInitial}>{displayName.charAt(0).toUpperCase()}</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={styles.dashboardScroll}
            keyboardDismissMode="on-drag"
            keyboardShouldPersistTaps="handled"
            refreshControl={
              <RefreshControl
                colors={[darkModeEnabled ? '#FFF7F8' : colors.burgundy]}
                onRefresh={handleRefresh}
                refreshing={refreshing}
                tintColor={darkModeEnabled ? '#FFF7F8' : colors.burgundy}
              />
            }
            showsVerticalScrollIndicator={false}
          >
            <BlurView intensity={78} tint={darkModeEnabled ? 'dark' : 'light'} style={[styles.progressCard, darkModeEnabled && styles.darkGlass]}>
              <View style={styles.progressCopy}>
                <Text style={[styles.progressLabel, darkModeEnabled && styles.darkText]}>
                  TODAY'S PROGRESS {prioritySortEnabled ? '· SORTED' : ''} {compactModeEnabled ? '· COMPACT' : ''}
                </Text>
                <Text style={[styles.progressValue, darkModeEnabled && styles.darkText]}>{completedCount} of {tasks.length} done today</Text>
                <Text style={[styles.progressHint, darkModeEnabled && styles.darkMuted]}>
                  {quietModeEnabled ? 'Quiet mode active. ' : 'Notifications active. '}
                  {remindersEnabled ? 'Reminders on.' : 'Reminders off.'}
                </Text>
              </View>
              <View style={styles.progressRing}>
                <Text style={styles.progressPercent}>{Math.round(progress)}%</Text>
              </View>
            </BlurView>

            <BlurView intensity={72} tint={darkModeEnabled ? 'dark' : 'light'} style={[styles.searchCard, darkModeEnabled && styles.darkGlass]}>
              <Text style={styles.searchIcon}>⌕</Text>
              <TextInput
                autoCapitalize="none"
                blurOnSubmit
                onChangeText={setSearchQuery}
                onSubmitEditing={Keyboard.dismiss}
                placeholder="Search your tasks"
                placeholderTextColor={colors.muted}
                style={[styles.searchInput, darkModeEnabled && styles.darkInputText]}
                value={searchQuery}
              />
            </BlurView>

            <View style={styles.filterHeader}>
              <Text style={[styles.sectionTitle, darkModeEnabled && styles.darkText]}>YOUR FOCUS</Text>
              <TouchableOpacity activeOpacity={0.85} onPress={() => { triggerHaptic(); setIsAddTaskOpen(true); }} style={styles.addTaskButton}>
                <Text style={styles.addTaskPlus}>+</Text>
                <Text style={styles.addTaskText}>Add task</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.filterRow}>
              {(['All', 'Active', 'Done'] as Filter[]).map((option) => (
                <TouchableOpacity
                  activeOpacity={0.8}
                  key={option}
                  onPress={() => { triggerHaptic(); animateList(); setFilter(option); }}
                  style={[styles.filterPill, filter === option && styles.filterPillActive]}
                >
                  <Text style={[styles.filterText, darkModeEnabled && styles.darkMuted, filter === option && styles.filterTextActive]}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <ScrollView horizontal contentContainerStyle={styles.categoryRow} showsHorizontalScrollIndicator={false}>
              {(['All', 'Work', 'Personal', 'Health'] as CategoryFilter[]).map((category) => (
                <TouchableOpacity
                  activeOpacity={0.8}
                  key={category}
                  onPress={() => { triggerHaptic(); animateList(); setCategoryFilter(category); }}
                  style={[styles.categoryPill, categoryFilter === category && styles.categoryPillActive]}
                >
                  <Text style={[styles.categoryText, darkModeEnabled && styles.darkMuted, categoryFilter === category && styles.categoryTextActive]}>{category}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {completedCount > 0 && (
              <TouchableOpacity activeOpacity={0.75} onPress={clearCompletedTasks} style={styles.clearCompletedButton}>
                <Text style={[styles.clearCompletedText, darkModeEnabled && styles.darkText]}>Clear completed · {completedCount}</Text>
              </TouchableOpacity>
            )}

            {visibleTasks.length === 0 ? (
              <View style={[styles.emptyState, darkModeEnabled && styles.darkGlass]}>
                <Text style={[styles.emptyStateTitle, darkModeEnabled && styles.darkText]}>Your space is clear.</Text>
                <Text style={[styles.emptyStateText, darkModeEnabled && styles.darkMuted]}>Add your first task and turn organized chaos into momentum.</Text>
                <TouchableOpacity activeOpacity={0.85} onPress={() => setIsAddTaskOpen(true)} style={[styles.primaryButton, { marginTop: 24 }]}>
                  <Text style={styles.primaryButtonText}>Add your first task</Text>
                  <Text style={styles.buttonArrow}>→</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.taskList}>
                <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }}>
                  {visibleTasks.map((task) => {
                    const dueDateContext = getDueDateContext(task.dueDate);
                    return (
                      <View key={task.id} style={[styles.taskRow, compactModeEnabled && styles.taskRowCompact, { marginBottom: 12 }]}>
                        <BlurView intensity={68} tint={darkModeEnabled ? 'dark' : 'light'} pointerEvents="none" style={[styles.taskGlass, darkModeEnabled && styles.darkGlass]} />
                        <TouchableOpacity accessibilityLabel={`Mark ${task.title} ${task.done ? 'active' : 'done'}`} activeOpacity={0.75} onPress={() => toggleTask(task.id)} style={[styles.checkbox, task.done && styles.checkboxDone]}>
                          {task.done && <Text style={styles.checkmark}>✓</Text>}
                        </TouchableOpacity>
                        <TouchableOpacity accessibilityRole="button" activeOpacity={0.75} onPress={() => openTaskDetails(task)} style={[styles.taskBody, compactModeEnabled && styles.taskBodyCompact]}>
                          <View style={styles.taskCopy}>
                            <Text style={[styles.taskTitle, darkModeEnabled && styles.darkText, task.done && styles.taskTitleDone]}>{task.title}</Text>
                            <View style={styles.taskMeta}>
                              <View style={[styles.priorityDot, task.priority === 'High' ? styles.priorityHigh : task.priority === 'Medium' ? styles.priorityMedium : styles.priorityLow]} />
                              <Text style={[styles.taskDetail, darkModeEnabled && styles.darkMuted]}>{`Today, ${task.time} · ${task.category}`}</Text>
                              {task.notes.length > 0 && <Text style={styles.noteIndicator}>▤</Text>}
                            </View>
                            {dueDateContext ? (
                              <View style={[styles.taskBadge, darkModeEnabled && styles.taskBadgeDark, dueDateContext.urgent && !task.done && styles.taskBadgeUrgent]}>
                                <Text style={[styles.taskBadgeText, darkModeEnabled && styles.darkText, dueDateContext.urgent && !task.done && styles.taskBadgeUrgentText]}>
                                  {dueDateContext.text}
                                </Text>
                              </View>
                            ) : null}
                          </View>
                          <Text style={styles.taskChevron}>›</Text>
                        </TouchableOpacity>
                        <TouchableOpacity accessibilityLabel={`Delete ${task.title}`} activeOpacity={0.75} onPress={() => confirmDeleteTask(task.id)} style={styles.taskDeleteButton}>
                          <Text style={styles.taskDeleteText}>×</Text>
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </Animated.View>
              </View>
            )}
          </ScrollView>

          {/* ADD TASK MODAL */}
          <Modal animationType="slide" transparent visible={isAddTaskOpen} onRequestClose={() => setIsAddTaskOpen(false)}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalBackdrop}>
              <BlurView intensity={92} tint={darkModeEnabled ? 'dark' : 'light'} style={[styles.modalCard, darkModeEnabled && styles.darkGlass]}>
                <ScrollView contentContainerStyle={styles.modalScroll} keyboardDismissMode="on-drag" keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} style={styles.modalScrollView}>
                  <View style={styles.modalHandle} />
                  <View style={styles.modalHeader}>
                    <View>
                      <Text style={[styles.modalEyebrow, darkModeEnabled && styles.darkText]}>NEW FOCUS</Text>
                      <Text style={[styles.modalTitle, darkModeEnabled && styles.darkText]}>Add a task</Text>
                    </View>
                    <TouchableOpacity onPress={() => setIsAddTaskOpen(false)} style={styles.modalClose}>
                      <Text style={styles.modalCloseText}>×</Text>
                    </TouchableOpacity>
                  </View>

                  <TextInput
                    autoFocus
                    onChangeText={setNewTaskTitle}
                    placeholder="What needs your attention?"
                    placeholderTextColor={colors.muted}
                    style={[styles.taskInput, darkModeEnabled && styles.darkInput, darkModeEnabled && styles.darkInputText]}
                    value={newTaskTitle}
                  />

                  <TextInput
                    multiline
                    onChangeText={setNewTaskNotes}
                    placeholder="Add a note or comment"
                    placeholderTextColor={colors.muted}
                    style={[styles.taskInput, styles.notesInput, darkModeEnabled && styles.darkInput, darkModeEnabled && styles.darkInputText]}
                    textAlignVertical="top"
                    value={newTaskNotes}
                  />

                  <TouchableOpacity activeOpacity={0.8} onPress={() => openTimePicker('new', newTaskTime)} style={[styles.timeSelect, darkModeEnabled && styles.darkInput]}>
                    <Text style={[styles.clockIcon, darkModeEnabled && styles.darkText]}>◷</Text>
                    <View style={styles.timeSelectCopy}>
                      <Text style={[styles.timeSelectLabel, darkModeEnabled && styles.darkMuted]}>TIME</Text>
                      <Text style={[styles.timeSelectValue, darkModeEnabled && styles.darkText]}>{newTaskTime}</Text>
                    </View>
                    <Text style={[styles.timeSelectArrow, darkModeEnabled && styles.darkText]}>⌄</Text>
                  </TouchableOpacity>
                  {timePickerTarget === 'new' && (
                    <View style={[styles.nativeTimePanel, darkModeEnabled && styles.darkTimePanel]}>
                      <Text style={styles.nativeTimeHint}>Choose a time</Text>
                      <DateTimePicker accentColor={colors.burgundy} display={Platform.OS === 'ios' ? 'spinner' : 'default'} mode="time" onChange={handleTimeChange} textColor={darkModeEnabled ? '#F8EEF0' : '#24171B'} themeVariant={darkModeEnabled ? 'dark' : 'light'} value={timePickerDate} />
                    </View>
                  )}

                  <TouchableOpacity activeOpacity={0.8} onPress={() => openDatePicker('new-date', newTaskDueDate || new Date().toLocaleDateString())} style={[styles.timeSelect, darkModeEnabled && styles.darkInput]}>
                    <Text style={[styles.clockIcon, darkModeEnabled && styles.darkText]}>◫</Text>
                    <View style={styles.timeSelectCopy}>
                      <Text style={[styles.timeSelectLabel, darkModeEnabled && styles.darkMuted]}>DUE DATE</Text>
                      <Text style={[styles.timeSelectValue, darkModeEnabled && styles.darkText]}>{newTaskDueDate || 'No due date'}</Text>
                    </View>
                    <Text style={[styles.timeSelectArrow, darkModeEnabled && styles.darkText]}>⌄</Text>
                  </TouchableOpacity>
                  {datePickerTarget === 'new-date' && (
                    <View style={[styles.nativeTimePanel, darkModeEnabled && styles.darkTimePanel]}>
                      <Text style={styles.nativeTimeHint}>Choose a date</Text>
                      <DateTimePicker accentColor={colors.burgundy} display={Platform.OS === 'ios' ? 'spinner' : 'default'} mode="date" onChange={handleDateChange} textColor={darkModeEnabled ? '#F8EEF0' : '#24171B'} themeVariant={darkModeEnabled ? 'dark' : 'light'} value={datePickerDate} />
                    </View>
                  )}

                  <Text style={[styles.modalLabel, darkModeEnabled && styles.darkText]}>CATEGORY</Text>
                  <View style={styles.optionRow}>
                    {(['Work', 'Personal', 'Health'] as Category[]).map((category) => (
                      <TouchableOpacity key={category} onPress={() => { triggerHaptic(); setNewTaskCategory(category); }} style={[styles.optionPill, darkModeEnabled && styles.darkOptionPill, newTaskCategory === category && styles.optionPillActive]}>
                        <Text style={[styles.optionText, darkModeEnabled && styles.darkMuted, newTaskCategory === category && styles.optionTextActive]}>{category}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Text style={[styles.modalLabel, darkModeEnabled && styles.darkText]}>PRIORITY</Text>
                  <View style={styles.optionRow}>
                    {(['Low', 'Medium', 'High'] as Priority[]).map((priority) => (
                      <TouchableOpacity key={priority} onPress={() => { triggerHaptic(); setNewTaskPriority(priority); }} style={[styles.optionPill, darkModeEnabled && styles.darkOptionPill, newTaskPriority === priority && styles.optionPillActive]}>
                        <View style={[styles.priorityDot, priority === 'High' ? styles.priorityHigh : priority === 'Medium' ? styles.priorityMedium : styles.priorityLow]} />
                        <Text style={[styles.optionText, darkModeEnabled && styles.darkMuted, newTaskPriority === priority && styles.optionTextActive]}>{priority}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <TouchableOpacity activeOpacity={0.85} disabled={!newTaskTitle.trim()} onPress={addTask} style={[styles.primaryButton, styles.modalButton, !newTaskTitle.trim() && styles.primaryButtonDisabled]}>
                    <Text style={styles.primaryButtonText}>Create task</Text>
                    <Text style={styles.buttonArrow}>→</Text>
                  </TouchableOpacity>
                </ScrollView>
              </BlurView>
            </KeyboardAvoidingView>
          </Modal>

          {/* EDIT TASK MODAL */}
          <Modal animationType="slide" transparent visible={selectedTaskId !== null} onRequestClose={closeTaskDetails}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalBackdrop}>
              <BlurView intensity={92} tint={darkModeEnabled ? 'dark' : 'light'} style={[styles.modalCard, darkModeEnabled && styles.darkGlass]}>
                <ScrollView contentContainerStyle={styles.modalScroll} keyboardDismissMode="on-drag" keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} style={styles.modalScrollView}>
                  <View style={styles.modalHandle} />
                  <View style={styles.modalHeader}>
                    <View>
                      <Text style={[styles.modalEyebrow, darkModeEnabled && styles.darkText]}>TASK DETAILS</Text>
                      <Text style={[styles.modalTitle, darkModeEnabled && styles.darkText]}>Shape your focus</Text>
                    </View>
                    <TouchableOpacity onPress={closeTaskDetails} style={styles.modalClose}>
                      <Text style={styles.modalCloseText}>×</Text>
                    </TouchableOpacity>
                  </View>
                  {selectedTaskId !== null && (() => {
                    const selectedTask = tasks.find((task) => task.id === selectedTaskId);
                    if (!selectedTask) return null;
                    return (
                      <View>
                        <TextInput
                          autoFocus
                          onChangeText={setEditedTaskTitle}
                          placeholder="Task title"
                          placeholderTextColor={colors.muted}
                          style={[styles.taskInput, darkModeEnabled && styles.darkInput, darkModeEnabled && styles.darkInputText]}
                          value={editedTaskTitle}
                        />
                        <TextInput
                          multiline
                          onChangeText={setEditedTaskNotes}
                          placeholder="Add a note or comment"
                          placeholderTextColor={colors.muted}
                          style={[styles.taskInput, styles.notesInput, darkModeEnabled && styles.darkInput, darkModeEnabled && styles.darkInputText]}
                          textAlignVertical="top"
                          value={editedTaskNotes}
                        />
                        
                        <TouchableOpacity activeOpacity={0.8} onPress={() => openTimePicker('edit', editedTaskTime)} style={[styles.timeSelect, darkModeEnabled && styles.darkInput]}>
                          <Text style={[styles.clockIcon, darkModeEnabled && styles.darkText]}>◷</Text>
                          <View style={styles.timeSelectCopy}>
                            <Text style={[styles.timeSelectLabel, darkModeEnabled && styles.darkMuted]}>TIME</Text>
                            <Text style={[styles.timeSelectValue, darkModeEnabled && styles.darkText]}>{editedTaskTime}</Text>
                          </View>
                          <Text style={[styles.timeSelectArrow, darkModeEnabled && styles.darkText]}>⌄</Text>
                        </TouchableOpacity>
                        {timePickerTarget === 'edit' && (
                          <View style={[styles.nativeTimePanel, darkModeEnabled && styles.darkTimePanel]}>
                            <Text style={styles.nativeTimeHint}>Choose a time</Text>
                            <DateTimePicker accentColor={colors.burgundy} display={Platform.OS === 'ios' ? 'spinner' : 'default'} mode="time" onChange={handleTimeChange} textColor={darkModeEnabled ? '#F8EEF0' : '#24171B'} themeVariant={darkModeEnabled ? 'dark' : 'light'} value={timePickerDate} />
                          </View>
                        )}

                        <TouchableOpacity activeOpacity={0.8} onPress={() => openDatePicker('edit-date', editedTaskDueDate || new Date().toLocaleDateString())} style={[styles.timeSelect, darkModeEnabled && styles.darkInput]}>
                          <Text style={[styles.clockIcon, darkModeEnabled && styles.darkText]}>◫</Text>
                          <View style={styles.timeSelectCopy}>
                            <Text style={[styles.timeSelectLabel, darkModeEnabled && styles.darkMuted]}>DUE DATE</Text>
                            <Text style={[styles.timeSelectValue, darkModeEnabled && styles.darkText]}>{editedTaskDueDate || 'No due date'}</Text>
                          </View>
                          <Text style={[styles.timeSelectArrow, darkModeEnabled && styles.darkText]}>⌄</Text>
                        </TouchableOpacity>
                        {datePickerTarget === 'edit-date' && (
                          <View style={[styles.nativeTimePanel, darkModeEnabled && styles.darkTimePanel]}>
                            <Text style={styles.nativeTimeHint}>Choose a date</Text>
                            <DateTimePicker accentColor={colors.burgundy} display={Platform.OS === 'ios' ? 'spinner' : 'default'} mode="date" onChange={handleDateChange} textColor={darkModeEnabled ? '#F8EEF0' : '#24171B'} themeVariant={darkModeEnabled ? 'dark' : 'light'} value={datePickerDate} />
                          </View>
                        )}
                        
                        <View style={styles.detailSummary}>
                          <View style={styles.detailSummaryItem}>
                            <Text style={[styles.modalLabel, darkModeEnabled && styles.darkText]}>CATEGORY</Text>
                            <Text style={[styles.detailValue, darkModeEnabled && styles.darkText]}>{selectedTask.category}</Text>
                          </View>
                          <View style={styles.detailSummaryItem}>
                            <Text style={[styles.modalLabel, darkModeEnabled && styles.darkText]}>PRIORITY</Text>
                            <View style={styles.detailPriority}>
                              <View style={[styles.priorityDot, selectedTask.priority === 'High' ? styles.priorityHigh : selectedTask.priority === 'Medium' ? styles.priorityMedium : styles.priorityLow]} />
                              <Text style={[styles.detailValue, darkModeEnabled && styles.darkText]}>{selectedTask.priority}</Text>
                            </View>
                          </View>
                        </View>
                        
                        <TouchableOpacity activeOpacity={0.85} onPress={saveTaskTitle} style={[styles.primaryButton, styles.modalButton]}>
                          <Text style={styles.primaryButtonText}>Save changes</Text>
                          <Text style={styles.buttonArrow}>→</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity activeOpacity={0.8} onPress={() => { toggleTask(selectedTask.id); closeTaskDetails(); }} style={[styles.secondaryAction, darkModeEnabled && styles.darkSecondaryAction]}>
                          <Text style={styles.secondaryActionText}>{selectedTask.done ? 'Mark as active' : 'Mark as done'}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity activeOpacity={0.8} onPress={deleteSelectedTask} style={styles.deleteAction}>
                          <Text style={styles.deleteActionText}>Delete task</Text>
                        </TouchableOpacity>
                      </View>
                    );
                  })()}
                </ScrollView>
              </BlurView>
            </KeyboardAvoidingView>
          </Modal>
        </View>
      </KeyboardAvoidingView>

      {toastVisible && deletedTask && (
        <View style={styles.toastContainer}>
          <Text style={styles.toastText}>Task deleted.</Text>
          <TouchableOpacity onPress={undoDelete} style={styles.toastButton}>
            <Text style={styles.toastButtonText}>Undo</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}