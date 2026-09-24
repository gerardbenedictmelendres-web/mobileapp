import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Alert } from 'react-native';
import { initialTasks } from '../data/initialTasks';
import { DashboardScreen } from '../screens/DashboardScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { Account, CategoryFilter, Filter, Task, ViewState } from '../types';

export default function Index() {
  const [view, setView] = useState<ViewState>('login');
  const [isSigningUp, setIsSigningUp] = useState(false);
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [registeredAccount, setRegisteredAccount] = useState<Account | null>(null);
  
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [filter, setFilter] = useState<Filter>('All');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [quietModeEnabled, setQuietModeEnabled] = useState(true);
  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [compactModeEnabled, setCompactModeEnabled] = useState(false);
  const [prioritySortEnabled, setPrioritySortEnabled] = useState(false);

  const displayName = fullName.trim() || email.split('@')[0] || 'Focus member';
  const completedCount = tasks.filter((task) => task.done).length;

  const handleAuth = () => {
    const normalizedEmail = email.trim();
    const normalizedName = fullName.trim();

    if (isSigningUp && normalizedName.length < 2) {
      Alert.alert('Add your name', 'Enter at least two characters so your profile can be personalized.');
      return;
    }
    if (!normalizedEmail.includes('@')) {
      Alert.alert('Check your email', 'Enter a valid email address to continue.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Password is too short', 'Use at least six characters for your password.');
      return;
    }

    if (isSigningUp) {
      setRegisteredAccount({ name: normalizedName, email: normalizedEmail, password });
      setIsSigningUp(false);
      setPassword('');
      Alert.alert('Account created', 'Your Un-Lazy space is ready. Log in to continue.');
      setView('login');
      return;
    }

    if (!registeredAccount) {
      Alert.alert('Create an account first', 'Use Sign up to create your Un-Lazy account before logging in.');
      return;
    }

    if (normalizedEmail.toLowerCase() !== registeredAccount.email.toLowerCase() || password !== registeredAccount.password) {
      Alert.alert('Login failed', 'The email or password does not match your account.');
      return;
    }

    setFullName(registeredAccount.name);
    setView('dashboard');
  };

  if (view === 'login') {
    return (
      <>
        <StatusBar style={darkModeEnabled ? 'light' : 'dark'} />
        <LoginScreen
          darkModeEnabled={darkModeEnabled}
          isSigningUp={isSigningUp}
          setIsSigningUp={setIsSigningUp}
          fullName={fullName}
          setFullName={setFullName}
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          handleAuth={handleAuth}
        />
      </>
    );
  }

  if (view === 'profile') {
    return (
      <>
        <StatusBar style={darkModeEnabled ? 'light' : 'dark'} />
        <ProfileScreen
          darkModeEnabled={darkModeEnabled}
          setDarkModeEnabled={setDarkModeEnabled}
          quietModeEnabled={quietModeEnabled}
          setQuietModeEnabled={setQuietModeEnabled}
          remindersEnabled={remindersEnabled}
          setRemindersEnabled={setRemindersEnabled}
          compactModeEnabled={compactModeEnabled}
          setCompactModeEnabled={setCompactModeEnabled}
          prioritySortEnabled={prioritySortEnabled}
          setPrioritySortEnabled={setPrioritySortEnabled}
          fullName={fullName}
          setFullName={setFullName}
          email={email}
          tasks={tasks}
          completedCount={completedCount}
          setView={setView}
        />
      </>
    );
  }

  return (
    <>
      <StatusBar style={darkModeEnabled ? 'light' : 'dark'} />
      <DashboardScreen
        darkModeEnabled={darkModeEnabled}
        compactModeEnabled={compactModeEnabled}
        quietModeEnabled={quietModeEnabled}
        remindersEnabled={remindersEnabled}
        prioritySortEnabled={prioritySortEnabled}
        tasks={tasks}
        setTasks={setTasks}
        filter={filter}
        setFilter={setFilter}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        displayName={displayName}
        setView={setView}
      />
    </>
  );
}