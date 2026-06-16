export type IphoneModel = {
  id: string;
  name: string;
  releaseYear: number;
  screenType: 'lcd' | 'oled' | 'ltpo';
  hasFaceId: boolean;
  region: 'global' | 'china';
};

export type ScreenGrade = 'original' | 'refurbished' | 'chinese-oled' | 'lcd-replacement';

export type ScreenOption = {
  modelId: string;
  grade: ScreenGrade;
  gradeName: string;
  brightness: {
    typical: number;
    hbm?: number;
    unit: 'nits';
  };
  colorGamut: string;
  thickness: number;
  touchSensitivity: 'excellent' | 'good' | 'normal' | 'poor';
  supportsTrueTone: boolean;
  riskLevel: 'low' | 'medium' | 'high';
  riskDescription: string;
  price: {
    purchase: number;
    retail: number;
    currency: 'CNY';
  };
  warrantyMonths: number;
  supplier: string;
};

export type CompatibilityCategory =
  | 'earpiece-flex'
  | 'true-tone-writer'
  | 'sealant'
  | 'bracket'
  | 'screw-spec'
  | 'face-id'
  | 'battery';

export type CompatibilityNote = {
  modelId: string;
  category: CompatibilityCategory;
  categoryName: string;
  isCompatible: boolean;
  note: string;
  severity: 'info' | 'warning' | 'danger';
  relatedModelIds?: string[];
};

export type BatchNote = {
  date: string;
  content: string;
  operator: string;
};

export type InventoryItem = {
  id: string;
  modelId: string;
  screenGrade: ScreenGrade;
  quantity: number;
  minStock: number;
  purchasePrice: number;
  retailPrice: number;
  supplier: string;
  batchNumber: string;
  purchaseDate: string;
  expiryDate?: string;
  location: string;
  batchNotes: BatchNote[];
  lastUpdated: string;
};

export type SelectionParams = {
  modelId: string | null;
  screenGrade: ScreenGrade | null;
  includeCompatibility: boolean;
  includeInventory: boolean;
};

export type HistoryQuote = {
  id: string;
  modelId: string;
  modelName: string;
  screenGrade: ScreenGrade;
  gradeName: string;
  totalPrice: number;
  createdAt: string;
  customerName?: string;
  notes?: string;
};

export type TestChecklistItem = {
  id: string;
  name: string;
  category: 'display' | 'touch' | 'face-id' | 'camera' | 'sensors' | 'buttons';
  checked: boolean;
  passed: boolean | null;
  remarks?: string;
};

export type AppState = {
  selection: SelectionParams;
  pinnedModelIds: string[];
  favoriteModelIds: string[];
  compareModelIds: string[];
  historyQuotes: HistoryQuote[];
  testChecklist: TestChecklistItem[];

  setModelId: (modelId: string | null) => void;
  setScreenGrade: (grade: ScreenGrade | null) => void;
  setIncludeCompatibility: (value: boolean) => void;
  setIncludeInventory: (value: boolean) => void;
  resetSelection: () => void;

  togglePinnedModel: (modelId: string) => void;
  toggleFavoriteModel: (modelId: string) => void;
  toggleCompareModel: (modelId: string) => void;
  clearCompareModels: () => void;

  addHistoryQuote: (quote: Omit<HistoryQuote, 'id' | 'createdAt'>) => void;
  removeHistoryQuote: (id: string) => void;
  clearHistoryQuotes: () => void;

  updateTestChecklist: (id: string, updates: Partial<Omit<TestChecklistItem, 'id' | 'category'>>) => void;
  resetTestChecklist: () => void;

  initializeFromStorage: () => void;
};
