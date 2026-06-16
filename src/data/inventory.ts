import type { InventoryItem, ScreenGrade, BatchNote } from '../types';

const createBatchNotes = (modelName: string, grade: string): BatchNote[] => [
  {
    date: '2024-12-15',
    content: `${modelName} ${grade} 批次入库，抽检合格率98%`,
    operator: '张师傅',
  },
  {
    date: '2025-01-20',
    content: '库存盘点，数量核对无误',
    operator: '李管理员',
  },
  {
    date: '2025-02-10',
    content: '客户反映个别屏幕有轻微亮点，已做单独检测',
    operator: '王质检',
  },
];

const createInventoryItem = (
  modelId: string,
  screenGrade: ScreenGrade,
  quantity: number,
  minStock: number,
  purchasePrice: number,
  retailPrice: number,
  supplier: string,
  purchaseDate: string,
  location: string
): InventoryItem => {
  const gradeNames: Record<ScreenGrade, string> = {
    'original': '原拆屏幕',
    'refurbished': '后压屏幕',
    'chinese-oled': '国产OLED',
    'lcd-replacement': 'LCD替代屏',
  };

  const modelName = modelId.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

  return {
    id: `${modelId}-${screenGrade}`,
    modelId,
    screenGrade,
    quantity,
    minStock,
    purchasePrice,
    retailPrice,
    supplier,
    batchNumber: `BATCH-${modelId.slice(-4).toUpperCase()}-${Date.now().toString().slice(-6)}`,
    purchaseDate,
    location,
    batchNotes: createBatchNotes(modelName, gradeNames[screenGrade]),
    lastUpdated: '2025-06-15T10:30:00Z',
  };
};

export const inventoryItems: InventoryItem[] = [
  createInventoryItem('iphone-6', 'original', 45, 20, 120, 168, '深圳华强北供应商', '2024-12-15', 'A-01-01'),
  createInventoryItem('iphone-6', 'refurbished', 32, 15, 80, 116, '广州后压工厂', '2024-12-20', 'A-01-02'),
  createInventoryItem('iphone-6', 'lcd-replacement', 58, 25, 50, 75, '东莞LCD厂商', '2025-01-05', 'A-01-03'),

  createInventoryItem('iphone-6-plus', 'original', 28, 15, 150, 210, '深圳华强北供应商', '2024-12-15', 'A-01-04'),
  createInventoryItem('iphone-6-plus', 'refurbished', 22, 10, 100, 145, '广州后压工厂', '2024-12-20', 'A-01-05'),
  createInventoryItem('iphone-6-plus', 'lcd-replacement', 38, 20, 70, 105, '东莞LCD厂商', '2025-01-05', 'A-01-06'),

  createInventoryItem('iphone-7', 'original', 35, 20, 180, 252, '深圳富士康渠道', '2024-12-18', 'A-02-01'),
  createInventoryItem('iphone-7', 'refurbished', 28, 15, 120, 174, '佛山翻新工厂', '2024-12-22', 'A-02-02'),
  createInventoryItem('iphone-7', 'lcd-replacement', 42, 20, 90, 135, '惠州LCD厂商', '2025-01-08', 'A-02-03'),

  createInventoryItem('iphone-8', 'original', 40, 20, 220, 308, '深圳富士康渠道', '2024-12-18', 'A-02-04'),
  createInventoryItem('iphone-8', 'refurbished', 25, 15, 150, 218, '佛山翻新工厂', '2024-12-22', 'A-02-05'),
  createInventoryItem('iphone-8', 'lcd-replacement', 35, 18, 110, 165, '惠州LCD厂商', '2025-01-08', 'A-02-06'),

  createInventoryItem('iphone-x', 'original', 18, 10, 800, 1120, '香港原装渠道', '2024-11-20', 'B-01-01'),
  createInventoryItem('iphone-x', 'refurbished', 22, 12, 500, 725, '深圳OLED翻新厂', '2024-12-01', 'B-01-02'),
  createInventoryItem('iphone-x', 'chinese-oled', 35, 15, 300, 450, '京东方授权经销商', '2024-12-10', 'B-01-03'),
  createInventoryItem('iphone-x', 'lcd-replacement', 28, 12, 200, 300, '东莞LCD厂商', '2025-01-10', 'B-01-04'),

  createInventoryItem('iphone-xs', 'original', 12, 8, 900, 1260, '香港原装渠道', '2024-11-20', 'B-01-05'),
  createInventoryItem('iphone-xs', 'refurbished', 18, 10, 550, 798, '深圳OLED翻新厂', '2024-12-01', 'B-01-06'),
  createInventoryItem('iphone-xs', 'chinese-oled', 28, 12, 350, 525, '京东方授权经销商', '2024-12-10', 'B-01-07'),
  createInventoryItem('iphone-xs', 'lcd-replacement', 22, 10, 220, 330, '东莞LCD厂商', '2025-01-10', 'B-01-08'),

  createInventoryItem('iphone-xs-max', 'original', 15, 8, 1000, 1400, '香港原装渠道', '2024-11-25', 'B-02-01'),
  createInventoryItem('iphone-xs-max', 'refurbished', 20, 10, 650, 943, '深圳OLED翻新厂', '2024-12-05', 'B-02-02'),
  createInventoryItem('iphone-xs-max', 'chinese-oled', 32, 15, 400, 600, '京东方授权经销商', '2024-12-15', 'B-02-03'),
  createInventoryItem('iphone-xs-max', 'lcd-replacement', 25, 12, 250, 375, '东莞LCD厂商', '2025-01-12', 'B-02-04'),

  createInventoryItem('iphone-xr', 'original', 30, 15, 400, 560, '深圳富士康渠道', '2024-12-01', 'B-02-05'),
  createInventoryItem('iphone-xr', 'refurbished', 28, 12, 280, 406, '佛山翻新工厂', '2024-12-10', 'B-02-06'),
  createInventoryItem('iphone-xr', 'lcd-replacement', 45, 20, 180, 270, '惠州LCD厂商', '2025-01-05', 'B-02-07'),

  createInventoryItem('iphone-11', 'original', 25, 15, 450, 630, '深圳富士康渠道', '2024-12-05', 'B-03-01'),
  createInventoryItem('iphone-11', 'refurbished', 22, 12, 300, 435, '佛山翻新工厂', '2024-12-15', 'B-03-02'),
  createInventoryItem('iphone-11', 'lcd-replacement', 38, 18, 200, 300, '惠州LCD厂商', '2025-01-08', 'B-03-03'),

  createInventoryItem('iphone-11-pro', 'original', 10, 6, 1100, 1540, '香港原装渠道', '2024-11-28', 'B-03-04'),
  createInventoryItem('iphone-11-pro', 'refurbished', 15, 8, 700, 1015, '深圳OLED翻新厂', '2024-12-08', 'B-03-05'),
  createInventoryItem('iphone-11-pro', 'chinese-oled', 22, 10, 450, 675, '京东方授权经销商', '2024-12-18', 'B-03-06'),
  createInventoryItem('iphone-11-pro', 'lcd-replacement', 18, 8, 280, 420, '东莞LCD厂商', '2025-01-15', 'B-03-07'),

  createInventoryItem('iphone-11-pro-max', 'original', 8, 5, 1200, 1680, '香港原装渠道', '2024-11-28', 'B-03-08'),
  createInventoryItem('iphone-11-pro-max', 'refurbished', 12, 6, 800, 1160, '深圳OLED翻新厂', '2024-12-08', 'B-04-01'),
  createInventoryItem('iphone-11-pro-max', 'chinese-oled', 18, 8, 500, 750, '京东方授权经销商', '2024-12-18', 'B-04-02'),
  createInventoryItem('iphone-11-pro-max', 'lcd-replacement', 15, 7, 300, 450, '东莞LCD厂商', '2025-01-15', 'B-04-03'),

  createInventoryItem('iphone-12', 'original', 12, 6, 1100, 1540, '香港原装渠道', '2024-12-10', 'B-04-04'),
  createInventoryItem('iphone-12', 'refurbished', 18, 8, 700, 1015, '深圳OLED翻新厂', '2024-12-20', 'B-04-05'),
  createInventoryItem('iphone-12', 'chinese-oled', 25, 10, 450, 675, '京东方授权经销商', '2025-01-02', 'B-04-06'),
  createInventoryItem('iphone-12', 'lcd-replacement', 20, 8, 280, 420, '东莞LCD厂商', '2025-01-18', 'B-04-07'),

  createInventoryItem('iphone-12-pro', 'original', 8, 5, 1300, 1820, '香港原装渠道', '2024-12-12', 'B-04-08'),
  createInventoryItem('iphone-12-pro', 'refurbished', 12, 6, 850, 1233, '深圳OLED翻新厂', '2024-12-22', 'B-05-01'),
  createInventoryItem('iphone-12-pro', 'chinese-oled', 18, 8, 550, 825, '京东方授权经销商', '2025-01-05', 'B-05-02'),
  createInventoryItem('iphone-12-pro', 'lcd-replacement', 14, 6, 320, 480, '东莞LCD厂商', '2025-01-20', 'B-05-03'),

  createInventoryItem('iphone-12-pro-max', 'original', 6, 4, 1500, 2100, '香港原装渠道', '2024-12-12', 'B-05-04'),
  createInventoryItem('iphone-12-pro-max', 'refurbished', 10, 5, 1000, 1450, '深圳OLED翻新厂', '2024-12-22', 'B-05-05'),
  createInventoryItem('iphone-12-pro-max', 'chinese-oled', 15, 7, 650, 975, '京东方授权经销商', '2025-01-05', 'B-05-06'),
  createInventoryItem('iphone-12-pro-max', 'lcd-replacement', 12, 5, 380, 570, '东莞LCD厂商', '2025-01-20', 'B-05-07'),

  createInventoryItem('iphone-13', 'original', 10, 5, 1150, 1610, '香港原装渠道', '2025-01-05', 'B-05-08'),
  createInventoryItem('iphone-13', 'refurbished', 15, 7, 750, 1088, '深圳OLED翻新厂', '2025-01-15', 'B-06-01'),
  createInventoryItem('iphone-13', 'chinese-oled', 22, 10, 480, 720, '京东方授权经销商', '2025-01-25', 'B-06-02'),
  createInventoryItem('iphone-13', 'lcd-replacement', 18, 8, 300, 450, '东莞LCD厂商', '2025-02-01', 'B-06-03'),

  createInventoryItem('iphone-13-pro', 'original', 5, 3, 1600, 2240, '香港原装渠道', '2025-01-08', 'B-06-04'),
  createInventoryItem('iphone-13-pro', 'refurbished', 10, 5, 1050, 1523, '深圳OLED翻新厂', '2025-01-18', 'B-06-05'),
  createInventoryItem('iphone-13-pro', 'chinese-oled', 15, 7, 680, 1020, '京东方授权经销商', '2025-01-28', 'B-06-06'),
  createInventoryItem('iphone-13-pro', 'lcd-replacement', 12, 5, 400, 600, '东莞LCD厂商', '2025-02-05', 'B-06-07'),

  createInventoryItem('iphone-13-pro-max', 'original', 4, 3, 1800, 2520, '香港原装渠道', '2025-01-08', 'B-06-08'),
  createInventoryItem('iphone-13-pro-max', 'refurbished', 8, 4, 1200, 1740, '深圳OLED翻新厂', '2025-01-18', 'B-07-01'),
  createInventoryItem('iphone-13-pro-max', 'chinese-oled', 12, 6, 780, 1170, '京东方授权经销商', '2025-01-28', 'B-07-02'),
  createInventoryItem('iphone-13-pro-max', 'lcd-replacement', 10, 5, 450, 675, '东莞LCD厂商', '2025-02-05', 'B-07-03'),

  createInventoryItem('iphone-14', 'original', 8, 4, 1250, 1750, '香港原装渠道', '2025-02-01', 'B-07-04'),
  createInventoryItem('iphone-14', 'refurbished', 12, 6, 800, 1160, '深圳OLED翻新厂', '2025-02-10', 'B-07-05'),
  createInventoryItem('iphone-14', 'chinese-oled', 18, 8, 520, 780, '京东方授权经销商', '2025-02-20', 'B-07-06'),
  createInventoryItem('iphone-14', 'lcd-replacement', 15, 7, 320, 480, '东莞LCD厂商', '2025-03-01', 'B-07-07'),

  createInventoryItem('iphone-14-pro', 'original', 3, 2, 2200, 3080, '香港原装渠道', '2025-02-05', 'B-07-08'),
  createInventoryItem('iphone-14-pro', 'refurbished', 8, 4, 1500, 2175, '深圳OLED翻新厂', '2025-02-15', 'B-08-01'),
  createInventoryItem('iphone-14-pro', 'chinese-oled', 12, 6, 980, 1470, '京东方授权经销商', '2025-02-25', 'B-08-02'),
  createInventoryItem('iphone-14-pro', 'lcd-replacement', 10, 5, 550, 825, '东莞LCD厂商', '2025-03-05', 'B-08-03'),

  createInventoryItem('iphone-14-pro-max', 'original', 2, 2, 2500, 3500, '香港原装渠道', '2025-02-05', 'B-08-04'),
  createInventoryItem('iphone-14-pro-max', 'refurbished', 6, 3, 1700, 2465, '深圳OLED翻新厂', '2025-02-15', 'B-08-05'),
  createInventoryItem('iphone-14-pro-max', 'chinese-oled', 10, 5, 1100, 1650, '京东方授权经销商', '2025-02-25', 'B-08-06'),
  createInventoryItem('iphone-14-pro-max', 'lcd-replacement', 8, 4, 620, 930, '东莞LCD厂商', '2025-03-05', 'B-08-07'),

  createInventoryItem('iphone-15', 'original', 5, 3, 1400, 1960, '香港原装渠道', '2025-03-01', 'B-08-08'),
  createInventoryItem('iphone-15', 'refurbished', 10, 5, 900, 1305, '深圳OLED翻新厂', '2025-03-10', 'C-01-01'),
  createInventoryItem('iphone-15', 'chinese-oled', 15, 7, 580, 870, '京东方授权经销商', '2025-03-20', 'C-01-02'),
  createInventoryItem('iphone-15', 'lcd-replacement', 12, 6, 350, 525, '东莞LCD厂商', '2025-03-28', 'C-01-03'),

  createInventoryItem('iphone-15-pro', 'original', 2, 2, 2800, 3920, '香港原装渠道', '2025-03-05', 'C-01-04'),
  createInventoryItem('iphone-15-pro', 'refurbished', 5, 3, 1900, 2755, '深圳OLED翻新厂', '2025-03-15', 'C-01-05'),
  createInventoryItem('iphone-15-pro', 'chinese-oled', 8, 4, 1250, 1875, '京东方授权经销商', '2025-03-25', 'C-01-06'),
  createInventoryItem('iphone-15-pro', 'lcd-replacement', 6, 3, 700, 1050, '东莞LCD厂商', '2025-04-01', 'C-01-07'),

  createInventoryItem('iphone-15-pro-max', 'original', 2, 2, 3200, 4480, '香港原装渠道', '2025-03-05', 'C-01-08'),
  createInventoryItem('iphone-15-pro-max', 'refurbished', 4, 2, 2200, 3190, '深圳OLED翻新厂', '2025-03-15', 'C-02-01'),
  createInventoryItem('iphone-15-pro-max', 'chinese-oled', 6, 3, 1450, 2175, '京东方授权经销商', '2025-03-25', 'C-02-02'),
  createInventoryItem('iphone-15-pro-max', 'lcd-replacement', 5, 2, 800, 1200, '东莞LCD厂商', '2025-04-01', 'C-02-03'),
];

export const getInventoryByModelId = (modelId: string): InventoryItem[] => {
  return inventoryItems.filter((item) => item.modelId === modelId);
};

export const getInventoryByModelAndGrade = (modelId: string, grade: ScreenGrade): InventoryItem | undefined => {
  return inventoryItems.find((item) => item.modelId === modelId && item.screenGrade === grade);
};

export const getLowStockItems = (): InventoryItem[] => {
  return inventoryItems.filter((item) => item.quantity <= item.minStock);
};

export const getInventoryBySupplier = (supplier: string): InventoryItem[] => {
  return inventoryItems.filter((item) => item.supplier === supplier);
};

export const getInventoryByLocation = (location: string): InventoryItem[] => {
  return inventoryItems.filter((item) => item.location.startsWith(location));
};
