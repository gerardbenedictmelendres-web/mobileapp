import { Task } from '../types';

export const initialTasks: Task[] = [
  { id: 1, title: 'Review project brief', time: '9:00 AM', dueDate: 'Sep 30, 2026', notes: 'Check the latest client goals before the review.', done: true, category: 'Work', priority: 'High' },
  { id: 2, title: 'Send design feedback', time: '11:30 AM', dueDate: 'Oct 02, 2026', notes: '', done: true, category: 'Work', priority: 'Medium' },
  { id: 3, title: 'Prepare client presentation', time: '2:00 PM', dueDate: 'Oct 05, 2026', notes: 'Keep the final presentation under ten slides.', done: true, category: 'Work', priority: 'High' },
  { id: 4, title: 'Book a team check-in', time: '4:30 PM', dueDate: '', notes: '', done: false, category: 'Work', priority: 'Medium' },
  { id: 5, title: "Plan tomorrow's priorities", time: '6:00 PM', dueDate: '', notes: '', done: false, category: 'Personal', priority: 'Low' },
  { id: 6, title: 'Update sprint notes', time: '7:30 PM', dueDate: '', notes: '', done: false, category: 'Work', priority: 'Medium' },
  { id: 7, title: 'Read through next steps', time: '8:00 PM', dueDate: '', notes: '', done: false, category: 'Health', priority: 'Low' },
];