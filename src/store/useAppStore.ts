import { create } from 'zustand';
import type { AppState, SelectionParams, HistoryQuote, TestChecklistItem, ScreenGrade, WorkOrder, WorkOrderStatus, InventoryReservation } from '../types';
import { storage, storageKeys } from '../utils/storage';
import { generateId } from '../utils/formatter';
import { getInventoryByModelAndGrade } from '../data/inventory';

const defaultSelection: SelectionParams = {
  modelId: null,
  screenGrade: null,
  includeCompatibility: true,
  includeInventory: true,
  region: 'all',
  faceIdStatus: 'all',
  originalScreenType: 'all',
  budget: 3000,
  compareGrades: [],
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

const persistSelection = (selection: SelectionParams) => {
  storage.set(storageKeys.SELECTION, selection);
};

export const useAppStore = create<AppState>((set, get) => ({
  selection: defaultSelection,
  pinnedModelIds: [],
  favoriteModelIds: [],
  compareModelIds: [],
  favoriteNoteIds: [],
  historyQuotes: [],
  workOrders: [],
  inventoryReservations: [],
  testChecklist: defaultTestChecklist,

  setModelId: (modelId: string | null) => {
    set((state) => {
      const newSelection = { ...state.selection, modelId };
      persistSelection(newSelection);
      return { selection: newSelection };
    });
  },

  setScreenGrade: (grade: ScreenGrade | null) => {
    set((state) => {
      const newSelection = { ...state.selection, screenGrade: grade };
      persistSelection(newSelection);
      return { selection: newSelection };
    });
  },

  setIncludeCompatibility: (value: boolean) => {
    set((state) => {
      const newSelection = { ...state.selection, includeCompatibility: value };
      persistSelection(newSelection);
      return { selection: newSelection };
    });
  },

  setIncludeInventory: (value: boolean) => {
    set((state) => {
      const newSelection = { ...state.selection, includeInventory: value };
      persistSelection(newSelection);
      return { selection: newSelection };
    });
  },

  setRegion: (region: 'all' | 'china' | 'global') => {
    set((state) => {
      const newSelection = { ...state.selection, region };
      persistSelection(newSelection);
      return { selection: newSelection };
    });
  },

  setFaceIdStatus: (status: 'all' | 'normal' | 'abnormal') => {
    set((state) => {
      const newSelection = { ...state.selection, faceIdStatus: status };
      persistSelection(newSelection);
      return { selection: newSelection };
    });
  },

  setOriginalScreenType: (type: 'all' | 'oled' | 'lcd') => {
    set((state) => {
      const newSelection = { ...state.selection, originalScreenType: type };
      persistSelection(newSelection);
      return { selection: newSelection };
    });
  },

  setBudget: (budget: number) => {
    set((state) => {
      const newSelection = { ...state.selection, budget };
      persistSelection(newSelection);
      return { selection: newSelection };
    });
  },

  toggleCompareGrade: (grade: ScreenGrade) => {
    set((state) => {
      const isComparing = state.selection.compareGrades.includes(grade);
      let newCompareGrades: ScreenGrade[];
      
      if (isComparing) {
        newCompareGrades = state.selection.compareGrades.filter((g) => g !== grade);
      } else {
        if (state.selection.compareGrades.length >= 3) {
          return state;
        }
        newCompareGrades = [...state.selection.compareGrades, grade];
      }
      
      const newSelection = { ...state.selection, compareGrades: newCompareGrades };
      persistSelection(newSelection);
      return { selection: newSelection };
    });
  },

  clearCompareGrades: () => {
    set((state) => {
      const newSelection = { ...state.selection, compareGrades: [] };
      persistSelection(newSelection);
      return { selection: newSelection };
    });
  },

  resetSelection: () => {
    persistSelection(defaultSelection);
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

  toggleFavoriteNote: (noteId: string) => {
    set((state) => {
      const isFavorite = state.favoriteNoteIds.includes(noteId);
      const newFavorites = isFavorite
        ? state.favoriteNoteIds.filter((id) => id !== noteId)
        : [...state.favoriteNoteIds, noteId];
      storage.set(storageKeys.FAVORITE_NOTES, newFavorites);
      return { favoriteNoteIds: newFavorites };
    });
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

  addWorkOrder: (order: Omit<WorkOrder, 'id' | 'createdAt' | 'updatedAt' | 'statusHistory'>) => {
    set((state) => {
      const now = new Date().toISOString();
      const newOrder: WorkOrder = {
        ...order,
        id: generateId(),
        createdAt: now,
        updatedAt: now,
        statusHistory: [{ status: order.status, timestamp: now }],
      };
      const newOrders = [newOrder, ...state.workOrders].slice(0, 100);
      storage.set(storageKeys.WORK_ORDERS, newOrders);
      return { workOrders: newOrders };
    });
  },

  updateWorkOrderStatus: (id: string, status: WorkOrderStatus, remark?: string) => {
    set((state) => {
      const now = new Date().toISOString();
      const newOrders = state.workOrders.map((order) => {
        if (order.id !== id) return order;
        return {
          ...order,
          status,
          updatedAt: now,
          deliveredAt: status === 'delivered' ? now : order.deliveredAt,
          statusHistory: [
            ...order.statusHistory,
            { status, timestamp: now, remark },
          ],
        };
      });
      storage.set(storageKeys.WORK_ORDERS, newOrders);
      return { workOrders: newOrders };
    });
  },

  updateWorkOrder: (id: string, updates: Partial<WorkOrder>) => {
    set((state) => {
      const newOrders = state.workOrders.map((order) =>
        order.id === id ? { ...order, ...updates, updatedAt: new Date().toISOString() } : order
      );
      storage.set(storageKeys.WORK_ORDERS, newOrders);
      return { workOrders: newOrders };
    });
  },

  removeWorkOrder: (id: string) => {
    set((state) => {
      const newOrders = state.workOrders.filter((order) => order.id !== id);
      storage.set(storageKeys.WORK_ORDERS, newOrders);
      return { workOrders: newOrders };
    });
  },

  convertQuoteToWorkOrder: (quoteId: string): WorkOrder | null => {
    const state = get();
    const quote = state.historyQuotes.find((q) => q.id === quoteId);
    if (!quote) return null;

    const now = new Date().toISOString();
    const newOrder: WorkOrder = {
      id: generateId(),
      quoteId: quote.id,
      modelId: quote.modelId,
      modelName: quote.modelName,
      screenGrade: quote.screenGrade,
      gradeName: quote.gradeName,
      screenPrice: quote.screenPrice,
      laborFee: quote.laborFee,
      totalPrice: quote.totalPrice,
      budget: state.selection.budget,
      customerName: quote.customerName,
      customerPhone: quote.customerPhone,
      faultDescription: quote.faultDescription,
      faceIdStatus: quote.faceIdStatus,
      notes: quote.notes,
      status: 'quoted',
      statusHistory: [{ status: 'quoted', timestamp: now, remark: '从报价单转换' }],
      createdAt: now,
      updatedAt: now,
    };

    set((state) => {
      const newOrders = [newOrder, ...state.workOrders].slice(0, 100);
      storage.set(storageKeys.WORK_ORDERS, newOrders);
      return { workOrders: newOrders };
    });

    return newOrder;
  },

  reserveInventory: (workOrderId: string, inventoryId: string, modelId: string, screenGrade: ScreenGrade, quantity: number): boolean => {
    const state = get();
    const available = state.getAvailableQuantity(modelId, screenGrade);
    if (quantity > available) return false;

    const newReservation: InventoryReservation = {
      id: generateId(),
      inventoryId,
      workOrderId,
      modelId,
      screenGrade,
      quantity,
      status: 'reserved',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    set((state) => {
      const newReservations = [newReservation, ...state.inventoryReservations];
      storage.set(storageKeys.INVENTORY_RESERVATIONS, newReservations);
      return { inventoryReservations: newReservations };
    });

    return true;
  },

  releaseInventory: (reservationId: string) => {
    set((state) => {
      const newReservations = state.inventoryReservations.map((r) =>
        r.id === reservationId
          ? { ...r, status: 'released' as const, updatedAt: new Date().toISOString() }
          : r
      );
      storage.set(storageKeys.INVENTORY_RESERVATIONS, newReservations);
      return { inventoryReservations: newReservations };
    });
  },

  deductInventory: (reservationId: string) => {
    set((state) => {
      const newReservations = state.inventoryReservations.map((r) =>
        r.id === reservationId
          ? { ...r, status: 'deducted' as const, updatedAt: new Date().toISOString() }
          : r
      );
      storage.set(storageKeys.INVENTORY_RESERVATIONS, newReservations);
      return { inventoryReservations: newReservations };
    });
  },

  getAvailableQuantity: (modelId: string, screenGrade: ScreenGrade): number => {
    const state = get();
    const inventory = getInventoryByModelAndGrade(modelId, screenGrade);
    if (!inventory) return 0;

    const reservedQuantity = state.inventoryReservations
      .filter((r) => r.modelId === modelId && r.screenGrade === screenGrade && r.status === 'reserved')
      .reduce((sum, r) => sum + r.quantity, 0);

    return Math.max(0, inventory.quantity - reservedQuantity);
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
    const selection = storage.get<SelectionParams>(storageKeys.SELECTION, defaultSelection);
    const pinned = storage.get<string[]>(storageKeys.PINNED_MODELS, []);
    const favorites = storage.get<string[]>(storageKeys.FAVORITE_MODELS, []);
    const compare = storage.get<string[]>(storageKeys.COMPARE_MODELS, []);
    const favoriteNotes = storage.get<string[]>(storageKeys.FAVORITE_NOTES, []);
    const history = storage.get<HistoryQuote[]>(storageKeys.HISTORY_QUOTES, []);
    const workOrders = storage.get<WorkOrder[]>(storageKeys.WORK_ORDERS, []);
    const inventoryReservations = storage.get<InventoryReservation[]>(storageKeys.INVENTORY_RESERVATIONS, []);

    set({
      selection: { ...defaultSelection, ...selection, compareGrades: selection.compareGrades || [] },
      pinnedModelIds: pinned,
      favoriteModelIds: favorites,
      compareModelIds: compare,
      favoriteNoteIds: favoriteNotes,
      historyQuotes: history,
      workOrders,
      inventoryReservations,
    });
  },
}));

export const selectSelection = (state: AppState) => state.selection;
export const selectPinnedModelIds = (state: AppState) => state.pinnedModelIds;
export const selectFavoriteModelIds = (state: AppState) => state.favoriteModelIds;
export const selectCompareModelIds = (state: AppState) => state.compareModelIds;
export const selectFavoriteNoteIds = (state: AppState) => state.favoriteNoteIds;
export const selectHistoryQuotes = (state: AppState) => state.historyQuotes;
export const selectWorkOrders = (state: AppState) => state.workOrders;
export const selectInventoryReservations = (state: AppState) => state.inventoryReservations;
export const selectTestChecklist = (state: AppState) => state.testChecklist;

export const selectIsModelPinned = (modelId: string) => (state: AppState) =>
  state.pinnedModelIds.includes(modelId);
export const selectIsModelFavorite = (modelId: string) => (state: AppState) =>
  state.favoriteModelIds.includes(modelId);
export const selectIsModelComparing = (modelId: string) => (state: AppState) =>
  state.compareModelIds.includes(modelId);
export const selectIsNoteFavorite = (noteId: string) => (state: AppState) =>
  state.favoriteNoteIds.includes(noteId);
export const selectCompareGrades = (state: AppState) =>
  state.selection.compareGrades;
export const selectIsGradeComparing = (grade: ScreenGrade) => (state: AppState) =>
  state.selection.compareGrades.includes(grade);
export const selectCompareGradesCount = (state: AppState) =>
  state.selection.compareGrades.length;

export const selectCompletedTests = (state: AppState) =>
  state.testChecklist.filter((item) => item.checked);
export const selectPassedTests = (state: AppState) =>
  state.testChecklist.filter((item) => item.checked && item.passed === true);
export const selectFailedTests = (state: AppState) =>
  state.testChecklist.filter((item) => item.checked && item.passed === false);
