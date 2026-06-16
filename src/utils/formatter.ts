export const formatPrice = (price: number, currency: string = 'CNY'): string => {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price);
};

export const formatDate = (date: string | Date, format: 'short' | 'long' | 'full' = 'short'): string => {
  const d = typeof date === 'string' ? new Date(date) : date;

  const options: Record<'short' | 'long' | 'full', Intl.DateTimeFormatOptions> = {
    short: { year: 'numeric', month: '2-digit', day: '2-digit' },
    long: { year: 'numeric', month: 'long', day: 'numeric' },
    full: {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    },
  };

  return new Intl.DateTimeFormat('zh-CN', options[format]).format(d);
};

export const formatPercentage = (value: number, total: number): string => {
  if (total === 0) return '0%';
  const percentage = (value / total) * 100;
  return `${percentage.toFixed(1)}%`;
};

export const formatBrightness = (value: number, unit: string = 'nits'): string => {
  return `${value} ${unit}`;
};

export const formatThickness = (value: number, unit: string = 'mm'): string => {
  return `${value} ${unit}`;
};

export const formatQuantity = (value: number, unit: string = '件'): string => {
  return `${value}${unit}`;
};

export const formatWarranty = (months: number): string => {
  if (months === 0) return '无保修';
  if (months < 12) return `${months}个月保修`;
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  if (remainingMonths === 0) return `${years}年保修`;
  return `${years}年${remainingMonths}个月保修`;
};

export const formatStockStatus = (quantity: number, minStock: number): string => {
  if (quantity === 0) return '缺货';
  if (quantity <= minStock) return '库存紧张';
  return '库存充足';
};

export const getStockStatusColor = (quantity: number, minStock: number): string => {
  if (quantity === 0) return 'text-red-600';
  if (quantity <= minStock) return 'text-amber-600';
  return 'text-green-600';
};

export const formatRiskLevel = (level: 'low' | 'medium' | 'high'): string => {
  const labels = {
    low: '低风险',
    medium: '中风险',
    high: '高风险',
  };
  return labels[level];
};

export const getRiskLevelColor = (level: 'low' | 'medium' | 'high'): string => {
  const colors = {
    low: 'text-green-600',
    medium: 'text-amber-600',
    high: 'text-red-600',
  };
  return colors[level];
};

export const formatSeverity = (severity: 'info' | 'warning' | 'danger'): string => {
  const labels = {
    info: '提示',
    warning: '警告',
    danger: '危险',
  };
  return labels[severity];
};

export const getSeverityColor = (severity: 'info' | 'warning' | 'danger'): string => {
  const colors = {
    info: 'text-blue-600',
    warning: 'text-amber-600',
    danger: 'text-red-600',
  };
  return colors[severity];
};

export const formatTouchSensitivity = (sensitivity: 'excellent' | 'good' | 'normal' | 'poor'): string => {
  const labels = {
    excellent: '优秀',
    good: '良好',
    normal: '一般',
    poor: '较差',
  };
  return labels[sensitivity];
};

export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
};

export const capitalizeFirstLetter = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const formatModelName = (modelId: string): string => {
  return modelId
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase())
    .replace('Cn', '国行');
};
