import type { ScreenOption, ScreenGrade } from '../types';

const gradeConfig: Record<ScreenGrade, { name: string; warranty: number; supplier: string }> = {
  'original': { name: '原拆屏幕', warranty: 12, supplier: '苹果官方授权' },
  'refurbished': { name: '后压屏幕', warranty: 6, supplier: '第三方翻新' },
  'chinese-oled': { name: '国产OLED', warranty: 3, supplier: '国内屏幕厂商' },
  'lcd-replacement': { name: 'LCD替代屏', warranty: 3, supplier: '第三方LCD厂商' },
};

const createScreenOption = (
  modelId: string,
  grade: ScreenGrade,
  typicalBrightness: number,
  hbmBrightness: number | undefined,
  colorGamut: string,
  thickness: number,
  touchSensitivity: ScreenOption['touchSensitivity'],
  supportsTrueTone: boolean,
  riskLevel: ScreenOption['riskLevel'],
  riskDescription: string,
  purchasePrice: number,
  retailPrice: number
): ScreenOption => {
  const config = gradeConfig[grade];
  return {
    modelId,
    grade,
    gradeName: config.name,
    brightness: {
      typical: typicalBrightness,
      hbm: hbmBrightness,
      unit: 'nits',
    },
    colorGamut,
    thickness,
    touchSensitivity,
    supportsTrueTone,
    riskLevel,
    riskDescription,
    price: {
      purchase: purchasePrice,
      retail: retailPrice,
      currency: 'CNY',
    },
    warrantyMonths: config.warranty,
    supplier: config.supplier,
  };
};

const generateScreenOptionsForModel = (
  modelId: string,
  baseTypical: number,
  baseHbm: number | undefined,
  isOled: boolean,
  basePrice: { original: number; refurbished: number; chineseOled: number; lcd: number }
): ScreenOption[] => {
  const options: ScreenOption[] = [];

  options.push(
    createScreenOption(
      modelId,
      'original',
      baseTypical,
      baseHbm,
      'Display P3 100%',
      0.78,
      'excellent',
      true,
      'low',
      '原装拆机屏幕，无兼容性风险，需注意排线保护',
      basePrice.original,
      Math.round(basePrice.original * 1.4)
    )
  );

  options.push(
    createScreenOption(
      modelId,
      'refurbished',
      Math.round(baseTypical * 0.95),
      baseHbm ? Math.round(baseHbm * 0.9) : undefined,
      'Display P3 95%',
      0.82,
      'good',
      true,
      'medium',
      '后压工艺，可能存在轻微色差，需注意密封胶处理',
      basePrice.refurbished,
      Math.round(basePrice.refurbished * 1.45)
    )
  );

  if (isOled) {
    options.push(
      createScreenOption(
        modelId,
        'chinese-oled',
        Math.round(baseTypical * 0.85),
        baseHbm ? Math.round(baseHbm * 0.75) : undefined,
        'Display P3 85%',
        0.85,
        'good',
        false,
        'medium',
        '国产OLED屏幕，亮度略低，不支持原彩显示，可能存在烧屏风险',
        basePrice.chineseOled,
        Math.round(basePrice.chineseOled * 1.5)
      )
    );
  }

  options.push(
    createScreenOption(
      modelId,
      'lcd-replacement',
      Math.round(baseTypical * 0.75),
      undefined,
      'sRGB 90%',
      0.9,
      'normal',
      false,
      'high',
      'LCD替代屏，厚度增加，不支持3D Touch/原彩显示，显示效果一般',
      basePrice.lcd,
      Math.round(basePrice.lcd * 1.5)
    )
  );

  return options;
};

export const screenOptions: ScreenOption[] = [
  ...generateScreenOptionsForModel('iphone-6', 500, undefined, false, { original: 120, refurbished: 80, chineseOled: 0, lcd: 50 }),
  ...generateScreenOptionsForModel('iphone-6-plus', 400, undefined, false, { original: 150, refurbished: 100, chineseOled: 0, lcd: 70 }),
  ...generateScreenOptionsForModel('iphone-6s', 500, undefined, false, { original: 130, refurbished: 90, chineseOled: 0, lcd: 60 }),
  ...generateScreenOptionsForModel('iphone-6s-plus', 400, undefined, false, { original: 160, refurbished: 110, chineseOled: 0, lcd: 80 }),
  ...generateScreenOptionsForModel('iphone-se-2016', 500, undefined, false, { original: 120, refurbished: 85, chineseOled: 0, lcd: 55 }),
  ...generateScreenOptionsForModel('iphone-7', 625, undefined, false, { original: 180, refurbished: 120, chineseOled: 0, lcd: 90 }),
  ...generateScreenOptionsForModel('iphone-7-plus', 400, undefined, false, { original: 200, refurbished: 140, chineseOled: 0, lcd: 100 }),
  ...generateScreenOptionsForModel('iphone-8', 625, undefined, false, { original: 220, refurbished: 150, chineseOled: 0, lcd: 110 }),
  ...generateScreenOptionsForModel('iphone-8-plus', 400, undefined, false, { original: 250, refurbished: 170, chineseOled: 0, lcd: 120 }),
  ...generateScreenOptionsForModel('iphone-x', 625, 1000, true, { original: 800, refurbished: 500, chineseOled: 300, lcd: 200 }),
  ...generateScreenOptionsForModel('iphone-xr', 625, undefined, false, { original: 400, refurbished: 280, chineseOled: 0, lcd: 180 }),
  ...generateScreenOptionsForModel('iphone-xs', 625, 1000, true, { original: 900, refurbished: 550, chineseOled: 350, lcd: 220 }),
  ...generateScreenOptionsForModel('iphone-xs-max', 625, 1000, true, { original: 1000, refurbished: 650, chineseOled: 400, lcd: 250 }),
  ...generateScreenOptionsForModel('iphone-11', 625, undefined, false, { original: 450, refurbished: 300, chineseOled: 0, lcd: 200 }),
  ...generateScreenOptionsForModel('iphone-11-pro', 800, 1200, true, { original: 1100, refurbished: 700, chineseOled: 450, lcd: 280 }),
  ...generateScreenOptionsForModel('iphone-11-pro-max', 800, 1200, true, { original: 1200, refurbished: 800, chineseOled: 500, lcd: 300 }),
  ...generateScreenOptionsForModel('iphone-se-2020', 625, undefined, false, { original: 280, refurbished: 180, chineseOled: 0, lcd: 120 }),
  ...generateScreenOptionsForModel('iphone-12-mini', 625, 1200, true, { original: 1000, refurbished: 650, chineseOled: 400, lcd: 260 }),
  ...generateScreenOptionsForModel('iphone-12', 625, 1200, true, { original: 1100, refurbished: 700, chineseOled: 450, lcd: 280 }),
  ...generateScreenOptionsForModel('iphone-12-pro', 800, 1200, true, { original: 1300, refurbished: 850, chineseOled: 550, lcd: 320 }),
  ...generateScreenOptionsForModel('iphone-12-pro-max', 800, 1200, true, { original: 1500, refurbished: 1000, chineseOled: 650, lcd: 380 }),
  ...generateScreenOptionsForModel('iphone-13-mini', 625, 1200, true, { original: 1050, refurbished: 680, chineseOled: 420, lcd: 270 }),
  ...generateScreenOptionsForModel('iphone-13', 600, 1200, true, { original: 1150, refurbished: 750, chineseOled: 480, lcd: 300 }),
  ...generateScreenOptionsForModel('iphone-13-pro', 1000, 1200, true, { original: 1600, refurbished: 1050, chineseOled: 680, lcd: 400 }),
  ...generateScreenOptionsForModel('iphone-13-pro-max', 1000, 1200, true, { original: 1800, refurbished: 1200, chineseOled: 780, lcd: 450 }),
  ...generateScreenOptionsForModel('iphone-se-2022', 625, undefined, false, { original: 320, refurbished: 200, chineseOled: 0, lcd: 140 }),
  ...generateScreenOptionsForModel('iphone-14', 600, 1200, true, { original: 1250, refurbished: 800, chineseOled: 520, lcd: 320 }),
  ...generateScreenOptionsForModel('iphone-14-plus', 600, 1200, true, { original: 1450, refurbished: 950, chineseOled: 620, lcd: 380 }),
  ...generateScreenOptionsForModel('iphone-14-pro', 1000, 1600, true, { original: 2200, refurbished: 1500, chineseOled: 980, lcd: 550 }),
  ...generateScreenOptionsForModel('iphone-14-pro-max', 1000, 1600, true, { original: 2500, refurbished: 1700, chineseOled: 1100, lcd: 620 }),
  ...generateScreenOptionsForModel('iphone-15', 600, 1600, true, { original: 1400, refurbished: 900, chineseOled: 580, lcd: 350 }),
  ...generateScreenOptionsForModel('iphone-15-plus', 600, 1600, true, { original: 1600, refurbished: 1050, chineseOled: 680, lcd: 400 }),
  ...generateScreenOptionsForModel('iphone-15-pro', 1000, 2000, true, { original: 2800, refurbished: 1900, chineseOled: 1250, lcd: 700 }),
  ...generateScreenOptionsForModel('iphone-15-pro-max', 1000, 2000, true, { original: 3200, refurbished: 2200, chineseOled: 1450, lcd: 800 }),
  ...generateScreenOptionsForModel('iphone-6-cn', 500, undefined, false, { original: 130, refurbished: 90, chineseOled: 0, lcd: 55 }),
  ...generateScreenOptionsForModel('iphone-6-plus-cn', 400, undefined, false, { original: 160, refurbished: 110, chineseOled: 0, lcd: 75 }),
  ...generateScreenOptionsForModel('iphone-7-cn', 625, undefined, false, { original: 190, refurbished: 130, chineseOled: 0, lcd: 95 }),
  ...generateScreenOptionsForModel('iphone-7-plus-cn', 400, undefined, false, { original: 210, refurbished: 150, chineseOled: 0, lcd: 105 }),
  ...generateScreenOptionsForModel('iphone-xr-cn', 625, undefined, false, { original: 420, refurbished: 290, chineseOled: 0, lcd: 190 }),
  ...generateScreenOptionsForModel('iphone-xs-max-cn', 625, 1000, true, { original: 1050, refurbished: 680, chineseOled: 420, lcd: 260 }),
  ...generateScreenOptionsForModel('iphone-11-cn', 625, undefined, false, { original: 470, refurbished: 310, chineseOled: 0, lcd: 210 }),
  ...generateScreenOptionsForModel('iphone-11-pro-cn', 800, 1200, true, { original: 1150, refurbished: 730, chineseOled: 470, lcd: 290 }),
  ...generateScreenOptionsForModel('iphone-11-pro-max-cn', 800, 1200, true, { original: 1250, refurbished: 830, chineseOled: 520, lcd: 310 }),
  ...generateScreenOptionsForModel('iphone-12-cn', 625, 1200, true, { original: 1150, refurbished: 730, chineseOled: 470, lcd: 290 }),
  ...generateScreenOptionsForModel('iphone-12-pro-cn', 800, 1200, true, { original: 1350, refurbished: 880, chineseOled: 570, lcd: 330 }),
  ...generateScreenOptionsForModel('iphone-12-pro-max-cn', 800, 1200, true, { original: 1550, refurbished: 1030, chineseOled: 670, lcd: 390 }),
  ...generateScreenOptionsForModel('iphone-13-cn', 600, 1200, true, { original: 1200, refurbished: 780, chineseOled: 500, lcd: 310 }),
  ...generateScreenOptionsForModel('iphone-13-pro-cn', 1000, 1200, true, { original: 1650, refurbished: 1080, chineseOled: 700, lcd: 410 }),
  ...generateScreenOptionsForModel('iphone-13-pro-max-cn', 1000, 1200, true, { original: 1850, refurbished: 1230, chineseOled: 800, lcd: 460 }),
  ...generateScreenOptionsForModel('iphone-14-cn', 600, 1200, true, { original: 1300, refurbished: 830, chineseOled: 540, lcd: 330 }),
  ...generateScreenOptionsForModel('iphone-14-plus-cn', 600, 1200, true, { original: 1500, refurbished: 980, chineseOled: 640, lcd: 390 }),
  ...generateScreenOptionsForModel('iphone-14-pro-cn', 1000, 1600, true, { original: 2300, refurbished: 1550, chineseOled: 1020, lcd: 570 }),
  ...generateScreenOptionsForModel('iphone-14-pro-max-cn', 1000, 1600, true, { original: 2600, refurbished: 1750, chineseOled: 1150, lcd: 640 }),
  ...generateScreenOptionsForModel('iphone-15-cn', 600, 1600, true, { original: 1450, refurbished: 930, chineseOled: 600, lcd: 360 }),
  ...generateScreenOptionsForModel('iphone-15-plus-cn', 600, 1600, true, { original: 1650, refurbished: 1080, chineseOled: 700, lcd: 410 }),
  ...generateScreenOptionsForModel('iphone-15-pro-cn', 1000, 2000, true, { original: 2900, refurbished: 1950, chineseOled: 1280, lcd: 720 }),
  ...generateScreenOptionsForModel('iphone-15-pro-max-cn', 1000, 2000, true, { original: 3300, refurbished: 2250, chineseOled: 1480, lcd: 820 }),
];

export const getScreenOptionsByModelId = (modelId: string): ScreenOption[] => {
  return screenOptions.filter((option) => option.modelId === modelId);
};

export const getScreenOption = (modelId: string, grade: ScreenGrade): ScreenOption | undefined => {
  return screenOptions.find((option) => option.modelId === modelId && option.grade === grade);
};

export const getScreenOptionsByGrade = (grade: ScreenGrade): ScreenOption[] => {
  return screenOptions.filter((option) => option.grade === grade);
};
