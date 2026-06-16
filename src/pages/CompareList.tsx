import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Shield,
  Copy,
  Download,
  Save,
  Printer,
  Check,
  X,
  Star,
  AlertTriangle,
  Clock,
  Sun,
  Palette,
  Ruler,
  Hand,
  Sparkles,
  TrendingUp,
  Award,
  CheckCircle2,
  XCircle,
  FileText,
  Wallet,
} from 'lucide-react';
import Layout from '@/components/Layout';
import CompareCard from '@/components/CompareCard';
import { useAppStore, selectSelection, selectCompareGrades } from '@/store/useAppStore';
import { getModelById } from '@/data/models';
import { getScreenOption } from '@/data/screenOptions';
import type { ScreenGrade, ScreenOption, HistoryQuote } from '@/types';
import { cn } from '@/lib/utils';

const gradeLevelMap: Record<ScreenGrade, 'S' | 'A' | 'B' | 'C'> = {
  'original': 'S',
  'refurbished': 'A',
  'chinese-oled': 'B',
  'lcd-replacement': 'C',
};

const gradeNames: Record<ScreenGrade, string> = {
  'original': '原拆屏幕',
  'refurbished': '后压屏幕',
  'chinese-oled': '国产OLED',
  'lcd-replacement': 'LCD替代屏',
};

interface CompareScheme {
  id: string;
  name: string;
  grade: string;
  gradeLevel: 'S' | 'A' | 'B' | 'C';
  price: number;
  warranty: string;
  pros: string[];
  cons: string[];
  isRecommended?: boolean;
  isOverBudget: boolean;
  budgetDiff: number;
  option: ScreenOption;
}

interface CompareDimension {
  key: string;
  label: string;
  icon: React.ReactNode;
}

const compareDimensions: CompareDimension[] = [
  { key: 'price', label: '价格', icon: <TrendingUp size={14} /> },
  { key: 'budgetDiff', label: '预算差额', icon: <Wallet size={14} /> },
  { key: 'warranty', label: '质保期', icon: <Clock size={14} /> },
  { key: 'brightness', label: '亮度', icon: <Sun size={14} /> },
  { key: 'colorAccuracy', label: '色彩准确度', icon: <Palette size={14} /> },
  { key: 'thickness', label: '厚度', icon: <Ruler size={14} /> },
  { key: 'touchFeel', label: '触控手感', icon: <Hand size={14} /> },
  { key: 'trueTone', label: '原彩支持', icon: <Sparkles size={14} /> },
  { key: 'risks', label: '常见风险', icon: <AlertTriangle size={14} /> },
  { key: 'recommendIndex', label: '推荐指数', icon: <Award size={14} /> },
];

const touchSensitivityMap: Record<string, number> = {
  'excellent': 100,
  'good': 85,
  'normal': 70,
  'poor': 50,
};

export default function CompareList() {
  const navigate = useNavigate();
  const [showCustomerCard, setShowCustomerCard] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const selection = useAppStore(selectSelection);
  const compareGrades = useAppStore(selectCompareGrades);
  const { addHistoryQuote } = useAppStore();

  const currentModel = useMemo(() => {
    if (!selection.modelId) return null;
    return getModelById(selection.modelId);
  }, [selection.modelId]);

  const compareOptions = useMemo(() => {
    if (!selection.modelId || compareGrades.length < 2) return [];

    return compareGrades
      .map((grade) => getScreenOption(selection.modelId!, grade))
      .filter((option): option is ScreenOption => option !== undefined);
  }, [selection.modelId, compareGrades]);

  const compareSchemes = useMemo((): CompareScheme[] => {
    return compareOptions.map((option) => {
      const pros: string[] = [];
      const cons: string[] = [];
      const isOverBudget = option.price.retail > selection.budget;
      const budgetDiff = option.price.retail - selection.budget;

      if (option.grade === 'original') {
        pros.push('原装品质，显示效果最佳');
        pros.push('支持原彩显示');
        pros.push('触控灵敏度优秀');
        pros.push('无兼容性问题');
        cons.push('价格较高');
        cons.push('货源相对稀缺');
      } else if (option.grade === 'refurbished') {
        pros.push('性价比高');
        pros.push('显示效果接近原装');
        pros.push('支持原彩写入');
        cons.push('后压工艺，存在轻微色差风险');
        cons.push('质保期较短');
      } else if (option.grade === 'chinese-oled') {
        pros.push('价格实惠');
        pros.push('OLED显示效果');
        cons.push('不支持原彩显示');
        cons.push('存在烧屏风险');
        cons.push('亮度略低');
      } else {
        pros.push('价格最低');
        pros.push('无烧屏风险');
        cons.push('厚度增加');
        cons.push('不支持原彩显示');
        cons.push('显示效果一般');
      }

      return {
        id: option.grade,
        name: gradeNames[option.grade],
        grade: `Grade ${gradeLevelMap[option.grade]}`,
        gradeLevel: gradeLevelMap[option.grade],
        price: option.price.retail,
        warranty: `${option.warrantyMonths} 个月`,
        pros,
        cons,
        isRecommended: (option.grade === 'original' || option.grade === 'refurbished') && !isOverBudget,
        isOverBudget,
        budgetDiff,
        option,
      };
    });
  }, [compareOptions, selection.budget]);

  const getDimensionValue = (option: ScreenOption, dimension: string, scheme?: CompareScheme): string | React.ReactNode => {
    switch (dimension) {
      case 'price':
        return <span className="font-mono font-bold">¥{option.price.retail.toLocaleString()}</span>;
      case 'budgetDiff':
        if (!scheme) return '-';
        return (
          <span className={cn(
            'font-mono font-bold',
            scheme.isOverBudget ? 'text-red-500' : 'text-green-600'
          )}>
            {scheme.isOverBudget ? '+' : ''}¥{scheme.budgetDiff.toLocaleString()}
          </span>
        );
      case 'warranty':
        return <span className="font-mono">{option.warrantyMonths} 个月</span>;
      case 'brightness':
        return (
          <span className="font-mono">
            {option.brightness.typical} nits
            {option.brightness.hbm && ` (HBM: ${option.brightness.hbm})`}
          </span>
        );
      case 'colorAccuracy':
        return <span className="font-mono">{option.colorGamut}</span>;
      case 'thickness':
        return <span className="font-mono">{option.thickness} mm</span>;
      case 'touchFeel':
        return (
          <div className="flex items-center space-x-1">
            <span className="font-mono">{touchSensitivityMap[option.touchSensitivity]}%</span>
            <span className="text-xs text-primary-500">({option.touchSensitivity})</span>
          </div>
        );
      case 'trueTone':
        return option.supportsTrueTone ? (
          <span className="flex items-center space-x-1 text-green-600">
            <CheckCircle2 size={16} />
            <span>支持</span>
          </span>
        ) : (
          <span className="flex items-center space-x-1 text-red-500">
            <XCircle size={16} />
            <span>不支持</span>
          </span>
        );
      case 'risks':
        return option.riskDescription;
      case 'recommendIndex': {
        const baseScore = option.grade === 'original' ? 95 :
          option.grade === 'refurbished' ? 85 :
          option.grade === 'chinese-oled' ? 70 : 60;
        const stars = Math.round(baseScore / 20);
        return (
          <div className="flex items-center space-x-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={16}
                className={i < stars ? 'text-yellow-400 fill-yellow-400' : 'text-primary-200'}
              />
            ))}
            <span className="ml-1 font-mono text-xs text-primary-600">{baseScore}</span>
          </div>
        );
      }
      default:
        return '-';
    }
  };

  const handleCopy = async () => {
    if (!currentModel) return;

    let text = `【${currentModel.name} 屏幕方案对比】\n\n`;
    compareOptions.forEach((option) => {
      text += `【${gradeNames[option.grade]}】\n`;
      text += `价格: ¥${option.price.retail}\n`;
      text += `质保: ${option.warrantyMonths}个月\n`;
      text += `亮度: ${option.brightness.typical}nits\n`;
      text += `色彩: ${option.colorGamut}\n`;
      text += `厚度: ${option.thickness}mm\n`;
      text += `原彩: ${option.supportsTrueTone ? '支持' : '不支持'}\n`;
      text += `风险: ${option.riskDescription}\n`;
      text += `---\n`;
    });

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  const handleSave = () => {
    if (!currentModel || compareOptions.length === 0) return;

    const recommended = compareOptions.find((o) => o.grade === 'original') ||
      compareOptions.find((o) => o.grade === 'refurbished') ||
      compareOptions[0];

    addHistoryQuote({
      modelId: currentModel.id,
      modelName: currentModel.name,
      screenGrade: recommended.grade,
      gradeName: gradeNames[recommended.grade],
      screenPrice: recommended.price.retail,
      laborFee: 0,
      totalPrice: recommended.price.retail,
      faceIdStatus: selection.faceIdStatus === 'all' ? undefined : selection.faceIdStatus,
      notes: `对比方案: ${compareOptions.map((o) => gradeNames[o.grade]).join(', ')}`,
    });

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handlePrint = () => {
    setShowCustomerCard(true);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const handleBack = () => {
    navigate('/screen-options');
  };

  if (!currentModel) {
    return (
      <Layout>
        <div className="text-center py-16">
          <Shield size={48} className="mx-auto text-primary-300 mb-3" />
          <p className="text-primary-500 mb-4">请先选择一个型号</p>
          <button
            onClick={() => navigate('/model-select')}
            className="px-6 py-2 bg-success text-white rounded-lg hover:bg-success/90 transition-colors"
          >
            去选择型号
          </button>
        </div>
      </Layout>
    );
  }

  if (compareOptions.length < 2) {
    return (
      <Layout>
        <div className="text-center py-16">
          <AlertTriangle size={48} className="mx-auto text-warning mb-3" />
          <p className="text-primary-500 mb-4">请至少选择 2 个方案进行对比</p>
          <button
            onClick={handleBack}
            className="px-6 py-2 bg-success text-white rounded-lg hover:bg-success/90 transition-colors"
          >
            返回选择
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBack}
              className="p-2 rounded-lg bg-primary-100 text-primary-600 hover:bg-primary-200 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-primary-800">方案对比</h1>
              <p className="text-sm text-primary-500 mt-1">
                <span className="font-semibold text-primary-700">{currentModel.name}</span> 的屏幕方案对比
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              className={cn(
                'flex items-center space-x-2 px-4 py-2 rounded-lg transition-all',
                copied
                  ? 'bg-green-100 text-green-700 border border-green-300'
                  : 'bg-primary-100 text-primary-600 hover:bg-primary-200'
              )}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              <span>{copied ? '已复制' : '复制'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-100 text-primary-600 rounded-lg hover:bg-primary-200 transition-all"
            >
              <Printer size={16} />
              <span>打印</span>
            </button>
            <button
              onClick={handleSave}
              className={cn(
                'flex items-center space-x-2 px-4 py-2 rounded-lg transition-all',
                saved
                  ? 'bg-green-100 text-green-700 border border-green-300'
                  : 'bg-success text-white hover:bg-success/90 shadow-md'
              )}
            >
              {saved ? <Check size={16} /> : <Save size={16} />}
              <span>{saved ? '已保存' : '保存报价'}</span>
            </button>
          </div>
        </div>

        <div className="bg-primary-50 rounded-xl border border-primary-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Wallet size={24} className="text-success" />
              <div>
                <p className="text-sm text-primary-600">客户预算</p>
                <p className="text-2xl font-bold font-mono text-primary-800">
                  ¥{selection.budget.toLocaleString()}
                </p>
              </div>
            </div>
            {compareSchemes.some((s) => s.isOverBudget) && (
              <div className="flex items-center space-x-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-200">
                <AlertTriangle size={16} />
                <span>部分方案超出预算，不推荐选择</span>
              </div>
            )}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {compareSchemes.map((scheme) => (
              <div
                key={scheme.id}
                className={cn(
                  'flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm',
                  scheme.isOverBudget
                    ? 'bg-red-50 border border-red-200 text-red-700'
                    : 'bg-green-50 border border-green-200 text-green-700'
                )}
              >
                <span className="font-medium">{scheme.name}</span>
                <span className="font-mono">
                  {scheme.isOverBudget ? '+' : ''}¥{scheme.budgetDiff.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-primary-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-primary-200">
                  <th className="w-32 px-6 py-4 text-left text-xs font-semibold text-primary-500 uppercase tracking-wider bg-primary-50/50 sticky left-0">
                    对比项
                  </th>
                  {compareSchemes.map((scheme) => {
                    const gradeColors: Record<string, { bg: string; text: string; border: string }> = {
                      S: { bg: 'bg-success/10', text: 'text-success', border: 'border-success' },
                      A: { bg: 'bg-primary-100', text: 'text-primary-700', border: 'border-primary-400' },
                      B: { bg: 'bg-warning/10', text: 'text-warning', border: 'border-warning' },
                      C: { bg: 'bg-primary-100', text: 'text-primary-500', border: 'border-primary-300' },
                    };
                    const colors = gradeColors[scheme.gradeLevel];

                    return (
                      <th
                        key={scheme.id}
                        className={cn(
                          'px-6 py-4 text-center min-w-[180px]',
                          scheme.isRecommended && 'bg-success/5'
                        )}
                      >
                        <div className="flex flex-col items-center space-y-2">
                          {scheme.isRecommended && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-success text-white uppercase tracking-wider">
                              推荐
                            </span>
                          )}
                          <div
                            className={cn(
                              'w-12 h-12 rounded-xl flex items-center justify-center border-2',
                              colors.bg,
                              colors.border
                            )}
                          >
                            <Shield size={20} className={colors.text} />
                          </div>
                          <div>
                            <p className="font-bold text-primary-800">{scheme.name}</p>
                            <span
                              className={cn(
                                'text-xs font-bold px-2 py-0.5 rounded',
                                colors.bg,
                                colors.text
                              )}
                            >
                              {scheme.grade}
                            </span>
                          </div>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-primary-100">
                {compareDimensions.map((dim) => (
                  <tr key={dim.key}>
                    <td className="px-6 py-4 text-sm font-medium text-primary-600 bg-primary-50/50 sticky left-0">
                      <div className="flex items-center space-x-2">
                        {dim.icon}
                        <span>{dim.label}</span>
                      </div>
                    </td>
                    {compareOptions.map((option) => {
                      const scheme = compareSchemes.find((s) => s.id === option.grade);
                      return (
                        <td
                          key={option.grade}
                          className={cn(
                            'px-6 py-4 text-center text-sm text-primary-700',
                            dim.key === 'recommendIndex' && scheme?.isOverBudget && 'opacity-50'
                          )}
                        >
                          {getDimensionValue(option, dim.key, scheme)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <CompareCard
          schemes={compareSchemes}
          onSelect={(id) => {
            const grade = id as ScreenGrade;
            const option = compareOptions.find((o) => o.grade === grade);
            if (option) {
              addHistoryQuote({
                modelId: currentModel.id,
                modelName: currentModel.name,
                screenGrade: grade,
                gradeName: gradeNames[grade],
                screenPrice: option.price.retail,
                laborFee: 0,
                totalPrice: option.price.retail,
                faceIdStatus: selection.faceIdStatus === 'all' ? undefined : selection.faceIdStatus,
                notes: '从对比页面选择',
              });
              navigate('/compatibility');
            }
          }}
        />

        <div className="flex justify-between items-center pt-4 border-t border-primary-200">
          <button
            onClick={() => setShowCustomerCard(!showCustomerCard)}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-100 text-primary-600 rounded-lg hover:bg-primary-200 transition-all"
          >
            <FileText size={16} />
            <span>{showCustomerCard ? '隐藏' : '显示'}客户解释卡</span>
          </button>
          <button
            onClick={() => navigate('/inventory')}
            className="px-6 py-2 bg-success text-white rounded-lg hover:bg-success/90 transition-all shadow-md"
          >
            查看库存报价
          </button>
        </div>

        {showCustomerCard && (
          <div className="bg-white rounded-xl border border-primary-200 p-6 shadow-sm print:shadow-none print:border-1">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-primary-800">iPhone 屏幕更换方案建议书</h2>
              <p className="text-sm text-primary-500 mt-1">
                机型: <span className="font-semibold">{currentModel.name}</span>
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {compareSchemes.map((scheme) => (
                <div
                  key={scheme.id}
                  className={cn(
                    'border-2 rounded-xl p-4',
                    scheme.isRecommended ? 'border-success bg-success/5' : 'border-primary-200'
                  )}
                >
                  {scheme.isRecommended && (
                    <div className="text-center mb-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-success text-white">
                        推荐方案
                      </span>
                    </div>
                  )}
                  <h3 className="font-bold text-primary-800 text-center">{scheme.name}</h3>
                  <p className="text-center text-2xl font-bold font-mono text-success mt-2">
                    ¥{scheme.price.toLocaleString()}
                  </p>
                  <p className={cn(
                    'text-center text-xs font-semibold mt-1',
                    scheme.isOverBudget ? 'text-red-500' : 'text-green-600'
                  )}>
                    预算{scheme.isOverBudget ? '超' : '省'} ¥{Math.abs(scheme.budgetDiff).toLocaleString()}
                  </p>
                  <p className="text-center text-xs text-primary-500 mt-1">
                    质保 {scheme.warranty}
                  </p>
                  <div className="mt-4 space-y-1">
                    {scheme.pros.map((pro, idx) => (
                      <div key={idx} className="flex items-start space-x-1.5 text-xs text-primary-600">
                        <Check size={12} className="text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{pro}</span>
                      </div>
                    ))}
                    {scheme.cons.map((con, idx) => (
                      <div key={idx} className="flex items-start space-x-1.5 text-xs text-primary-500">
                        <X size={12} className="text-warning mt-0.5 flex-shrink-0" />
                        <span>{con}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-primary-50 rounded-lg">
              <h4 className="font-semibold text-primary-700 text-sm mb-2">温馨提示</h4>
              <ul className="text-xs text-primary-500 space-y-1">
                <li>• 以上价格为参考价格，最终价格以门店实际报价为准</li>
                <li>• 更换屏幕后请当面测试各项功能是否正常</li>
                <li>• 原装屏幕支持原彩显示，第三方屏幕可能不支持</li>
                <li>• 建议选择正规维修渠道，确保维修质量</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
