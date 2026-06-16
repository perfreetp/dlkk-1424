import { create } from 'zustand';
import type { AppState, SelectionParams, HistoryQuote, TestChecklistItem, ScreenGrade } from '../types';
import { storage, storageKeys } from '../utils/storage';
import { generateId } from '../utils/formatter';

const defaultSelection: SelectionParams = {
  modelId: null,
  screenGrade: null,
  includeCompatibility: true,
  includeInventory: true,
};

const defaultTestChecklist: TestChecklistItem[] = [
  { id: 'display-1', name: '显示亮度正常', category: 'display', checked: false, passed: null },
  { id: 'display-2', name: '无亮点、坏点、色斑', category: 'display', checked: false, passed: null },
  { id: 'display-3', name: '色彩显示准确', category: 'display', checked: false, passed: null },
  { id: 'display-4', name: '原彩显示功能正常', category: 'display', checked: false, passed: null },
  { id: 'touch-1', name: '触摸灵敏度正常', category: 'touch', checked: false, passed: null },
  { id: 'touch-2', name: '无触摸死角', category: 'touch', checked: false, passed: null },
  { id: 'touch-3', name: '3D Touch/触觉反馈正常', category: 'touch', checked: false, passed: null },
  { id: 'face-id-1', name: '面容识别正常', category: 'face-id', checked: false, passed: null },
  { id: 'face-id-2', name: '点阵投影仪工作正常', category: 'face-id', checked: false, passed: null },
  { id: 'face-id-3', name: '泛光感应元件正常', category: 'face-id', checked: false, passed: null },
  { id: 'camera-1', name: '前置摄像头拍照正常', category: 'camera', checked: false, passed: null },
  { id: 'camera-2', name: '后置摄像头拍照正常', category: 'camera', checked: false, passed: null },
  { id: 'camera-3', name: '闪光灯工作正常', category: 'camera', checked: false, passed: null },
  { id: 'sensors-1', name: '光线传感器正常', category: 'sensors', checked: false, passed: null },
  { id: 'sensors-2', name: '距离传感器正常', category: 'sensors', checked: false, passed: null },
  { id: 'sensors-3', name: '震动马达正常', category: 'sensors', checked: false, passed: null },
  { id: 'buttons-1', name: '电源键正常', category: 'buttons', checked: false, passed: null },
  { id: 'buttons-2', name: '音量键正常', category: 'buttons', checked: false, passed: null },
  { id: 'buttons-3', name: '静音开关正常', category: 'buttons', checked: false, passed: null },
  { id: 'buttons-4', name: 'Home键/Touch ID正常', category: 'buttons', checked: false, passed: null },
];

export const useAppStore = create<AppState>((set, get) => ({
  selection: defaultSelection,
  pinnedModelIds: [],
  favoriteModelIds: [],
  compareModelIds: [],
  historyQuotes: [],
  testChecklist: defaultTestChecklist,

  setModelId: (modelId: string | null) => {
    set((state) => ({
      selection: { ...state.selection, modelId },
    }));
  },

  setScreenGrade: (grade: ScreenGrade | null) => {
    set((state) => ({
      selection: { ...state.selection, screenGrade: grade },
    }));
  },

  setIncludeCompatibility: (value: boolean) => {
    set((state) => ({
      selection: { ...state.selection, includeCompatibility: value },
    }));
  },

  setIncludeInventory: (value: boolean) => {
    set((state) => ({
      selection: { ...state.selection, includeInventory: value },
    }));
  },

  resetSelection: () => {
    set({ selection: defaultSelection });
  },

  togglePinnedModel: (modelId: string) => {
    set((state) => {
      const isPinned = state.pinnedModelIds.includes(modelId);
      const newPinned = isPinned
        ? state.pinnedModelIds.filter((id) => id !== modelId)
        : [...state.pinnedModelIds, modelId];
      storage.set(storageKeys.PINNED_MODELS, newPinned);
      return { pinnedModelIds: newPinned };
    });
  },

  toggleFavoriteModel: (modelId: string) => {
    set((state) => {
      const isFavorite = state.favoriteModelIds.includes(modelId);
      const newFavorites = isFavorite
        ? state.favoriteModelIds.filter((id) => id !== modelId)
        : [...state.favoriteModelIds, modelId];
      storage.set(storageKeys.FAVORITE_MODELS, newFavorites);
      return { favoriteModelIds: newFavorites };
    });
  },

  toggleCompareModel: (modelId: string) => {
    set((state) => {
      const isComparing = state.compareModelIds.includes(modelId);
      const newCompare = isComparing
        ? state.compareModelIds.filter((id) => id !== modelId)
        : state.compareModelIds.length < 4
          ? [...state.compareModelIds, modelId]
          : state.compareModelIds;
      storage.set(storageKeys.COMPARE_MODELS, newCompare);
      return { compareModelIds: newCompare };
    });
  },

  clearCompareModels: () => {
    set({ compareModelIds: [] });
    storage.remove(storageKeys.COMPARE_MODELS);
  },

  addHistoryQuote: (quote: Omit<HistoryQuote, 'id' | 'createdAt'>) => {
    set((state) => {
      const newQuote: HistoryQuote = {
        ...quote,
        id: generateId(),
        createdAt: new Date().toISOString(),
      };
      const newHistory = [newQuote, ...state.historyQuotes].slice(0, 50);
      storage.set(storageKeys.HISTORY_QUOTES, newHistory);
      return { historyQuotes: newHistory };
    });
  },

  removeHistoryQuote: (id: string) => {
    set((state) => {
      const newHistory = state.historyQuotes.filter((quote) => quote.id !== id);
      storage.set(storageKeys.HISTORY_QUOTES, newHistory);
      return { historyQuotes: newHistory };
    });
  },

  clearHistoryQuotes: () => {
    set({ historyQuotes: [] });
    storage.remove(storageKeys.HISTORY_QUOTES);
  },

  updateTestChecklist: (id: string, updates: Partial<Omit<TestChecklistItem, 'id' | 'category'>>) => {
    set((state) => ({
      testChecklist: state.testChecklist.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      ),
    }));
  },

  resetTestChecklist: () => {
    set({ testChecklist: defaultTestChecklist });
  },

  initializeFromStorage: () => {
    const pinned = storage.get<string[]>(storageKeys.PINNED_MODELS, []);
    const favorites = storage.get<string[]>(storageKeys.FAVORITE_MODELS, []);
    const compare = storage.get<string[]>(storageKeys.COMPARE_MODELS, []);
    const history = storage.get<HistoryQuote[]>(storageKeys.HISTORY_QUOTES, []);

    set({
      pinnedModelIds: pinned,
      favoriteModelIds: favorites,
      compareModelIds: compare,
      historyQuotes: history,
    });
  },
}));

export const selectSelection = (state: AppState) => state.selection;
export const selectPinnedModelIds = (state: AppState) => state.pinnedModelIds;
export const selectFavoriteModelIds = (state: AppState) => state.favoriteModelIds;
export const selectCompareModelIds = (state: AppState) => state.compareModelIds;
export const selectHistoryQuotes = (state: AppState) => state.historyQuotes;
export const selectTestChecklist = (state: AppState) => state.testChecklist;

export const selectIsModelPinned = (modelId: string) => (state: AppState) =>
  state.pinnedModelIds.includes(modelId);
export const selectIsModelFavorite = (modelId: string) => (state: AppState) =>
  state.favoriteModelIds.includes(modelId);
export const selectIsModelComparing = (modelId: string) => (state: AppState) =>
  state.compareModelIds.includes(modelId);

export const selectCompletedTests = (state: AppState) =>
  state.testChecklist.filter((item) => item.checked);
export const selectPassedTests = (state: AppState) =>
  state.testChecklist.filter((item) => item.checked && item.passed === true);
export const selectFailedTests = (state: AppState) =>
  state.testChecklist.filter((item) => item.checked && item.passed === false);
