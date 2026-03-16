'use client';

import { create } from 'zustand';
import { Story } from '@/types';

interface StoryState {
  stories: Story[];
  currentIndex: number;
  isPaused: boolean;
  isFinished: boolean;

  // Actions
  setStories: (stories: Story[]) => void;
  goToNext: () => void;
  goToPrev: () => void;
  goToIndex: (index: number) => void;
  pause: () => void;
  resume: () => void;
  finish: () => void;
  reset: () => void;
}

export const useStoryStore = create<StoryState>((set, get) => ({
  stories: [],
  currentIndex: 0,
  isPaused: false,
  isFinished: false,

  setStories: (stories) => set({ stories, currentIndex: 0, isFinished: false }),

  goToNext: () => {
    const { currentIndex, stories } = get();
    if (currentIndex < stories.length - 1) {
      set({ currentIndex: currentIndex + 1, isPaused: false });
    } else {
      set({ isFinished: true });
    }
  },

  goToPrev: () => {
    const { currentIndex } = get();
    if (currentIndex > 0) {
      set({ currentIndex: currentIndex - 1, isPaused: false });
    }
  },

  goToIndex: (index) => {
    const { stories } = get();
    if (index >= 0 && index < stories.length) {
      set({ currentIndex: index, isPaused: false, isFinished: false });
    }
  },

  pause: () => set({ isPaused: true }),
  resume: () => set({ isPaused: false }),

  finish: () => set({ isFinished: true }),

  reset: () => set({ currentIndex: 0, isFinished: false, isPaused: false }),
}));
