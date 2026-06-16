import type { CompatibilityNote, CompatibilityCategory } from '../types';

const categoryNames: Record<CompatibilityCategory, string> = {
  'earpiece-flex': '听筒排线',
  'true-tone-writer': '原彩写入',
  'sealant': '密封胶',
  'bracket': '支架',
  'screw-spec': '螺丝规格',
  'face-id': '面容识别',
  'battery': '电池',
};

const createNote = (
  modelId: string,
  category: CompatibilityCategory,
  isCompatible: boolean,
  note: string,
  severity: CompatibilityNote['severity'],
  relatedModelIds?: string[]
): CompatibilityNote => ({
  modelId,
  category,
  categoryName: categoryNames[category],
  isCompatible,
  note,
  severity,
  relatedModelIds,
});

const generateCompatibilityForModels = (
  modelIds: string[],
  category: CompatibilityCategory,
  isCompatible: boolean,
  baseNote: string,
  severity: CompatibilityNote['severity']
): CompatibilityNote[] => {
  return modelIds.map((modelId) =>
    createNote(modelId, category, isCompatible, baseNote, severity, modelIds)
  );
};

export const compatibilityNotes: CompatibilityNote[] = [
  ...generateCompatibilityForModels(
    ['iphone-6', 'iphone-6-plus', 'iphone-6-cn', 'iphone-6-plus-cn'],
    'earpiece-flex',
    true,
    '听筒排线与屏幕集成，更换屏幕时需小心操作，避免损坏排线',
    'warning'
  ),
  ...generateCompatibilityForModels(
    ['iphone-6s', 'iphone-6s-plus', 'iphone-se-2016'],
    'earpiece-flex',
    true,
    '听筒排线独立设计，可单独更换，兼容性良好',
    'info'
  ),
  ...generateCompatibilityForModels(
    ['iphone-7', 'iphone-7-plus', 'iphone-7-cn', 'iphone-7-plus-cn'],
    'earpiece-flex',
    true,
    '听筒排线集成在屏幕总成上，更换时需转移前置摄像头',
    'warning'
  ),
  ...generateCompatibilityForModels(
    ['iphone-8', 'iphone-8-plus', 'iphone-se-2020', 'iphone-se-2022'],
    'earpiece-flex',
    true,
    '听筒排线设计与iPhone 7系列一致，可通用更换流程',
    'info'
  ),
  ...generateCompatibilityForModels(
    ['iphone-x', 'iphone-xs', 'iphone-xs-max', 'iphone-xs-max-cn'],
    'earpiece-flex',
    false,
    '听筒排线与Face ID模块高度集成，非原装屏幕可能导致听筒故障',
    'danger'
  ),
  ...generateCompatibilityForModels(
    ['iphone-xr', 'iphone-xr-cn', 'iphone-11', 'iphone-11-cn'],
    'earpiece-flex',
    true,
    'LCD机型听筒排线设计相对独立，但仍需注意Face ID排线保护',
    'warning'
  ),
  ...generateCompatibilityForModels(
    ['iphone-11-pro', 'iphone-11-pro-max', 'iphone-11-pro-cn', 'iphone-11-pro-max-cn'],
    'earpiece-flex',
    false,
    '听筒排线与屏幕IC绑定，非原装屏幕更换后听筒可能出现杂音',
    'danger'
  ),
  ...generateCompatibilityForModels(
    ['iphone-12-mini', 'iphone-12', 'iphone-12-pro', 'iphone-12-pro-max'],
    'earpiece-flex',
    false,
    'iPhone 12系列听筒排线集成度更高，第三方屏幕可能导致面容故障',
    'danger'
  ),
  ...generateCompatibilityForModels(
    ['iphone-6', 'iphone-6-plus', 'iphone-6s', 'iphone-6s-plus', 'iphone-se-2016', 'iphone-6-cn', 'iphone-6-plus-cn'],
    'true-tone-writer',
    false,
    '此机型不支持原彩显示功能，无需写入原彩数据',
    'info'
  ),
  ...generateCompatibilityForModels(
    ['iphone-7', 'iphone-7-plus', 'iphone-8', 'iphone-8-plus', 'iphone-se-2020', 'iphone-se-2022', 'iphone-7-cn', 'iphone-7-plus-cn'],
    'true-tone-writer',
    true,
    '支持原彩显示，更换屏幕后需使用原彩修复仪写入原始屏幕数据',
    'warning'
  ),
  ...generateCompatibilityForModels(
    ['iphone-x', 'iphone-xs', 'iphone-xs-max', 'iphone-xs-max-cn'],
    'true-tone-writer',
    true,
    'OLED机型原彩数据存储在屏幕IC中，需使用专用编程器读写',
    'warning'
  ),
  ...generateCompatibilityForModels(
    ['iphone-xr', 'iphone-xr-cn', 'iphone-11', 'iphone-11-cn'],
    'true-tone-writer',
    true,
    'LCD机型原彩写入相对简单，但需注意iOS版本兼容性',
    'warning'
  ),
  ...generateCompatibilityForModels(
    ['iphone-12', 'iphone-12-pro', 'iphone-12-pro-max', 'iphone-12-cn', 'iphone-12-pro-cn', 'iphone-12-pro-max-cn'],
    'true-tone-writer',
    false,
    'iOS 14及以上版本对原彩写入有严格限制，非原装屏幕可能无法恢复原彩',
    'danger'
  ),
  ...generateCompatibilityForModels(
    ['iphone-13', 'iphone-13-pro', 'iphone-13-pro-max', 'iphone-13-cn', 'iphone-13-pro-cn', 'iphone-13-pro-max-cn'],
    'true-tone-writer',
    false,
    'iOS 15增强了屏幕验证，第三方屏幕原彩功能可能永久失效',
    'danger'
  ),
  ...generateCompatibilityForModels(
    ['iphone-14', 'iphone-14-plus', 'iphone-14-pro', 'iphone-14-pro-max'],
    'true-tone-writer',
    false,
    'iPhone 14系列采用全新验证机制，非官方屏幕无法恢复原彩显示',
    'danger'
  ),
  ...generateCompatibilityForModels(
    ['iphone-15', 'iphone-15-plus', 'iphone-15-pro', 'iphone-15-pro-max'],
    'true-tone-writer',
    false,
    'USB-C机型屏幕验证更严格，建议使用官方认证配件',
    'danger'
  ),
  ...generateCompatibilityForModels(
    ['iphone-6', 'iphone-6-plus', 'iphone-6s', 'iphone-6s-plus', 'iphone-se-2016'],
    'sealant',
    true,
    '早期机型防水胶设计简单，使用标准密封胶即可',
    'info'
  ),
  ...generateCompatibilityForModels(
    ['iphone-7', 'iphone-7-plus', 'iphone-8', 'iphone-8-plus', 'iphone-7-cn', 'iphone-7-plus-cn'],
    'sealant',
    true,
    'IP67级防水密封胶，需使用专用压合工具确保密封效果',
    'warning'
  ),
  ...generateCompatibilityForModels(
    ['iphone-x', 'iphone-xs', 'iphone-xs-max', 'iphone-xr', 'iphone-xr-cn', 'iphone-xs-max-cn'],
    'sealant',
    true,
    '全面屏机型密封胶面积更大，需注意边角对齐，避免起泡',
    'warning'
  ),
  ...generateCompatibilityForModels(
    ['iphone-12', 'iphone-12-pro', 'iphone-12-pro-max', 'iphone-12-cn', 'iphone-12-pro-cn', 'iphone-12-pro-max-cn'],
    'sealant',
    true,
    'iPhone 12系列采用全新防水胶设计，需使用原装规格密封胶',
    'warning'
  ),
  ...generateCompatibilityForModels(
    ['iphone-14-pro', 'iphone-14-pro-max', 'iphone-15-pro', 'iphone-15-pro-max', 'iphone-14-pro-cn', 'iphone-14-pro-max-cn', 'iphone-15-pro-cn', 'iphone-15-pro-max-cn'],
    'sealant',
    true,
    '钛金属边框机型密封胶特殊，建议使用原厂规格',
    'warning'
  ),
  ...generateCompatibilityForModels(
    ['iphone-6', 'iphone-6-plus', 'iphone-6s', 'iphone-6s-plus', 'iphone-se-2016', 'iphone-6-cn', 'iphone-6-plus-cn'],
    'bracket',
    true,
    '屏幕支架与机身卡扣式固定，兼容性良好',
    'info'
  ),
  ...generateCompatibilityForModels(
    ['iphone-7', 'iphone-7-plus', 'iphone-8', 'iphone-8-plus', 'iphone-se-2020', 'iphone-se-2022', 'iphone-7-cn', 'iphone-7-plus-cn'],
    'bracket',
    true,
    '屏幕支架需使用专用胶水固定，注意支架平整度',
    'warning'
  ),
  ...generateCompatibilityForModels(
    ['iphone-x', 'iphone-xs', 'iphone-xs-max', 'iphone-xr', 'iphone-xr-cn', 'iphone-xs-max-cn'],
    'bracket',
    true,
    'COP封装屏幕支架较薄，更换时需注意避免弯折',
    'warning'
  ),
  ...generateCompatibilityForModels(
    ['iphone-12', 'iphone-12-pro', 'iphone-12-pro-max', 'iphone-12-cn', 'iphone-12-pro-cn', 'iphone-12-pro-max-cn'],
    'bracket',
    false,
    'iPhone 12系列屏幕支架设计变更，与前代不通用',
    'danger'
  ),
  ...generateCompatibilityForModels(
    ['iphone-14', 'iphone-14-plus', 'iphone-14-cn', 'iphone-14-plus-cn'],
    'bracket',
    true,
    '屏幕与背板分离设计，支架更换相对简单',
    'info'
  ),
  ...generateCompatibilityForModels(
    ['iphone-6', 'iphone-6-plus', 'iphone-6s', 'iphone-6s-plus', 'iphone-se-2016', 'iphone-6-cn', 'iphone-6-plus-cn'],
    'screw-spec',
    true,
    '底部螺丝为五星0.8mm，内部十字1.2mm',
    'info'
  ),
  ...generateCompatibilityForModels(
    ['iphone-7', 'iphone-7-plus', 'iphone-8', 'iphone-8-plus', 'iphone-se-2020', 'iphone-se-2022', 'iphone-7-cn', 'iphone-7-plus-cn'],
    'screw-spec',
    true,
    '底部五星0.8mm，内部有多种规格，注意区分长短螺丝',
    'warning'
  ),
  ...generateCompatibilityForModels(
    ['iphone-x', 'iphone-xs', 'iphone-xs-max', 'iphone-xr', 'iphone-xr-cn', 'iphone-xs-max-cn'],
    'screw-spec',
    true,
    '内部螺丝种类较多，建议使用磁性螺丝垫记忆位置',
    'warning'
  ),
  ...generateCompatibilityForModels(
    ['iphone-15', 'iphone-15-plus', 'iphone-15-pro', 'iphone-15-pro-max', 'iphone-15-cn', 'iphone-15-plus-cn', 'iphone-15-pro-cn', 'iphone-15-pro-max-cn'],
    'screw-spec',
    true,
    'USB-C机型内部螺丝规格有变化，使用专用螺丝刀',
    'warning'
  ),
  ...generateCompatibilityForModels(
    ['iphone-6', 'iphone-6-plus', 'iphone-6s', 'iphone-6s-plus', 'iphone-se-2016', 'iphone-7', 'iphone-7-plus', 'iphone-8', 'iphone-8-plus', 'iphone-se-2020', 'iphone-se-2022', 'iphone-6-cn', 'iphone-6-plus-cn', 'iphone-7-cn', 'iphone-7-plus-cn'],
    'face-id',
    false,
    '此机型采用Touch ID指纹识别，无Face ID模块',
    'info'
  ),
  ...generateCompatibilityForModels(
    ['iphone-x', 'iphone-xs', 'iphone-xs-max', 'iphone-xr', 'iphone-xr-cn', 'iphone-xs-max-cn'],
    'face-id',
    true,
    'Face ID模块与主板绑定，更换屏幕时注意保护泛光感应元件',
    'warning'
  ),
  ...generateCompatibilityForModels(
    ['iphone-11', 'iphone-11-pro', 'iphone-11-pro-max', 'iphone-11-cn', 'iphone-11-pro-cn', 'iphone-11-pro-max-cn'],
    'face-id',
    true,
    'Face ID点阵投影器位置调整，更换屏幕时需精确对位',
    'warning'
  ),
  ...generateCompatibilityForModels(
    ['iphone-12', 'iphone-12-pro', 'iphone-12-pro-max', 'iphone-12-cn', 'iphone-12-pro-cn', 'iphone-12-pro-max-cn'],
    'face-id',
    false,
    '非原装屏幕可能触发Face ID无法使用，建议使用原装配件',
    'danger'
  ),
  ...generateCompatibilityForModels(
    ['iphone-13', 'iphone-13-pro', 'iphone-13-pro-max', 'iphone-13-cn', 'iphone-13-pro-cn', 'iphone-13-pro-max-cn'],
    'face-id',
    false,
    'iOS 15.2以上版本第三方屏幕可能导致Face ID永久禁用',
    'danger'
  ),
  ...generateCompatibilityForModels(
    ['iphone-14', 'iphone-14-plus', 'iphone-14-pro', 'iphone-14-pro-max', 'iphone-14-cn', 'iphone-14-plus-cn', 'iphone-14-pro-cn', 'iphone-14-pro-max-cn'],
    'face-id',
    false,
    'iPhone 14系列Face ID模块可单独更换，但需官方认证',
    'danger'
  ),
  ...generateCompatibilityForModels(
    ['iphone-15', 'iphone-15-plus', 'iphone-15-pro', 'iphone-15-pro-max', 'iphone-15-cn', 'iphone-15-plus-cn', 'iphone-15-pro-cn', 'iphone-15-pro-max-cn'],
    'face-id',
    false,
    'USB-C机型Face ID与主板加密绑定，第三方维修无法修复',
    'danger'
  ),
  ...generateCompatibilityForModels(
    ['iphone-6', 'iphone-6-plus', 'iphone-6s', 'iphone-6s-plus', 'iphone-se-2016'],
    'battery',
    true,
    '电池容量较小，更换时注意电池胶不要拉断',
    'info'
  ),
  ...generateCompatibilityForModels(
    ['iphone-7', 'iphone-7-plus', 'iphone-8', 'iphone-8-plus', 'iphone-se-2020', 'iphone-se-2022', 'iphone-7-cn', 'iphone-7-plus-cn'],
    'battery',
    true,
    '电池胶有改进，但仍需小心操作，避免刺破电池',
    'warning'
  ),
  ...generateCompatibilityForModels(
    ['iphone-x', 'iphone-xs', 'iphone-xs-max', 'iphone-xr', 'iphone-xr-cn', 'iphone-xs-max-cn'],
    'battery',
    true,
    'L型电池设计，拉胶时需左右交替用力',
    'warning'
  ),
  ...generateCompatibilityForModels(
    ['iphone-11', 'iphone-11-pro', 'iphone-11-pro-max', 'iphone-11-cn', 'iphone-11-pro-cn', 'iphone-11-pro-max-cn'],
    'battery',
    true,
    '电池容量增大，拉胶点增多，建议使用专用加热台',
    'warning'
  ),
  ...generateCompatibilityForModels(
    ['iphone-12', 'iphone-12-pro', 'iphone-12-pro-max', 'iphone-12-cn', 'iphone-12-pro-cn', 'iphone-12-pro-max-cn'],
    'battery',
    true,
    '磁吸设计，更换电池时注意保护MagSafe模块',
    'warning'
  ),
  ...generateCompatibilityForModels(
    ['iphone-14', 'iphone-14-plus', 'iphone-14-cn', 'iphone-14-plus-cn'],
    'battery',
    true,
    '后盖可从正面拆卸，电池更换更方便',
    'info'
  ),
  ...generateCompatibilityForModels(
    ['iphone-15', 'iphone-15-plus', 'iphone-15-pro', 'iphone-15-pro-max', 'iphone-15-cn', 'iphone-15-plus-cn', 'iphone-15-pro-cn', 'iphone-15-pro-max-cn'],
    'battery',
    true,
    '内置拉环设计，电池更换更加便捷',
    'info'
  ),
];

export const getCompatibilityByModelId = (modelId: string): CompatibilityNote[] => {
  return compatibilityNotes.filter((note) => note.modelId === modelId);
};

export const getCompatibilityByCategory = (category: CompatibilityCategory): CompatibilityNote[] => {
  return compatibilityNotes.filter((note) => note.category === category);
};

export const getCompatibilityBySeverity = (severity: CompatibilityNote['severity']): CompatibilityNote[] => {
  return compatibilityNotes.filter((note) => note.severity === severity);
};
