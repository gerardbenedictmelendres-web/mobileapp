export type ViewState = 'login' | 'dashboard' | 'profile';
export type Filter = 'All' | 'Active' | 'Done';
export type Category = 'Work' | 'Personal' | 'Health';
export type Priority = 'Low' | 'Medium' | 'High';
export type CategoryFilter = 'All' | Category;
export type TimePickerTarget = 'new' | 'edit' | null;

export type Task = {
  id: number;
  title: string;
  time: string;
  dueDate: string;
  notes: string;
  done: boolean;
  category: Category;
  priority: Priority;
};

export type Account = {
  name: string;
  email: string;
  password: string;
};