import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Smartphone, Shield, AlertTriangle, Check, Wallet, ListChecks } from 'lucide-react';
import Layout from '@/components/Layout';
import ScreenCard from '@/components/ScreenCard';
import ProgressBar from '@/components/ProgressBar';
import { useAppStore, selectSelection } from '@/store/useAppStore';
import { getModelById } from '@/data/models';
import { getScreenOptionsByModelId } from '@/data/screenOptions';
import { getScreenOption } from '@/data/screenOptions';
import type { ScreenGrade, ScreenOption } from '@/types';
import { cn } from '@/lib/utils';

const gradeLevelMap: Record<ScreenGrade, 'S' | 'A' | 'B' | 'C'> = {
  'original': 'S',
  'refurbished': 'A',
  'chinese-oled': 'B',
  'lcd-replacement': 'C',
};

const touchSensitivityMap: Record<string, number> = {
  'excellent': 100,
  'good': 85,
  'normal': 70,
  'poor': 50,
};

const riskLevelMap: Record<string, number> = {
  'low': 20,
  'medium': 50,
  'high': 80,
};

interface ScreenParam {
  label: string;
  value: number;
  variant?: 'success' | 'warning';
  unit?: string;
}

export default function ScreenOptions() {
  const navigate = useNavigate();
  const [budget, setBudget] = useState(3000);
  const [compareList, setCompareList] = useState<ScreenGrade[]>([]);
  const [localBudget, setLocalBudget] = useState(3000);

  const selection = useAppStore(selectSelection);
  const { setScreenGrade } = useAppStore();

  const currentModel = useMemo(() => {
    if (!selection.modelId) return null;
    return getModelById(selection.modelId);
  }, [selection.modelId]);

  const screenOptions = useMemo(() => {
    if (!selection.modelId) return [];
    return getScreenOptionsByModelId(selection.modelId);
  }, [selection.modelId]);

  const buildScreenParams = (option: ScreenOption): ScreenParam[] => {
    const brightnessValue = Math.min(Math.round((option.brightness.typical / 1000) * 100), 100);
    const colorValue = parseInt(option.colorGamut.replace(/[^0-9]/g, '')) || 70;
    const thicknessValue = Math.round((1 - (option.thickness - 0.7) / 0.3) * 100);
    const touchValue = touchSensitivityMap[option.touchSensitivity] || 70;
    const trueToneValue = option.supportsTrueTone ? 100 : 30;
    const riskValue = riskLevelMap[option.riskLevel] || 50;

    return [
      { label: '亮度', value: brightnessValue, variant: 'success' as const, unit: '%' },
      { label: '色彩', value: colorValue, variant: 'success' as const, unit: '%' },
      { label: '厚度', value: Math.max(0, Math.min(100, thicknessValue)), variant: brightnessValue >= 80 ? 'success' as const : 'warning' as const, unit: '%' },
      { label: '触控', value: touchValue, variant: touchValue >= 80 ? 'success' as const : 'warning' as const, unit: '%' },
      { label: '原彩', value: trueToneValue, variant: trueToneValue >= 80 ? 'success' as const : 'warning' as const, unit: '%' },
      { label: '风险', value: riskValue, variant: riskValue <= 30 ? 'success' as const : 'warning' as const, unit: '%' },
    ];
  };

  const buildRiskTips = (option: ScreenOption): string[] => {
    const tips: string[] = [];
    if (option.riskDescription) {
      tips.push(option.riskDescription);
    }
    if (!option.supportsTrueTone) {
      tips.push('不支持原彩显示功能');
    }
    if (option.touchSensitivity !== 'excellent') {
      tips.push('触控灵敏度可能略低于原装屏幕');
    }
    if (option.riskLevel === 'high') {
      tips.push('建议专业人员操作，存在一定风险');
    }
    if (option.grade === 'chinese-oled') {
      tips.push('可能存在轻微烧屏风险，建议避免长时间显示静态画面');
    }
    if (option.grade === 'lcd-replacement') {
      tips.push('LCD屏幕不支持熄屏显示和HDR效果');
    }
    return tips;
  };

  const handleSelectCompare = (gradeId: string, selected: boolean) => {
    const grade = gradeId as ScreenGrade;
    if (selected) {
      if (compareList.length < 3) {
        setCompareList([...compareList, grade]);
      }
    } else {
      setCompareList(compareList.filter((g) => g !== grade));
    }
  };

  const handleGoToCompare = () => {
    if (compareList.length >= 2) {
      const compareParams = new URLSearchParams();
      compareList.forEach((grade, index) => {
        compareParams.append(`grade${index + 1}`, grade);
      });
      navigate(`/compare?${compareParams.toString()}`);
    }
  };

  const handleBack = () => {
    navigate('/model-select');
  };

  if (!currentModel) {
    return (
      <Layout>
        <div className="text-center py-16">
          <Smartphone size={48} className="mx-auto text-primary-300 mb-3" />
          <p className="text-primary-500 mb-4">请先选择一个型号</p>
          <button
            onClick={handleBack}
            className="px-6 py-2 bg-success text-white rounded-lg hover:bg-success/90 transition-colors"
          >
            去选择型号
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
              <h1 className="text-2xl font-bold text-primary-800">屏幕方案选择</h1>
              <p className="text-sm text-primary-500 mt-1">
                为 <span className="font-semibold text-primary-700">{currentModel.name}</span> 选择合适的屏幕方案
              </p>
            </div>
          </div>
          {compareList.length >= 2 && (
            <button
              onClick={handleGoToCompare}
              className="flex items-center space-x-2 px-4 py-2 bg-success text-white rounded-lg hover:bg-success/90 transition-all shadow-md"
            >
              <ListChecks size={18} />
              <span>对比方案 ({compareList.length}/3)</span>
            </button>
          )}
        </div>

        <div className="bg-white rounded-xl border border-primary-200 p-5 shadow-sm">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                <Smartphone size={24} className="text-success" />
              </div>
              <div>
                <p className="text-xs text-primary-500">当前型号</p>
                <p className="font-bold text-primary-800">{currentModel.name}</p>
              </div>
            </div>

            <div className="h-10 w-px bg-primary-200 hidden md:block" />

            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
                <Shield size={24} className="text-primary-600" />
              </div>
              <div>
                <p className="text-xs text-primary-500">原屏类型</p>
                <p className="font-bold text-primary-800 uppercase">{currentModel.screenType}</p>
              </div>
            </div>

            <div className="h-10 w-px bg-primary-200 hidden md:block" />

            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                <AlertTriangle size={24} className="text-warning" />
              </div>
              <div>
                <p className="text-xs text-primary-500">Face ID</p>
                <p className={cn(
                  'font-bold',
                  currentModel.hasFaceId ? 'text-success' : 'text-primary-500'
                )}>
                  {currentModel.hasFaceId ? '支持' : '不支持'}
                </p>
              </div>
            </div>

            <div className="h-10 w-px bg-primary-200 hidden md:block" />

            <div className="flex-1 min-w-[200px]">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center space-x-1.5">
                  <Wallet size={16} className="text-primary-500" />
                  <span className="text-xs font-medium text-primary-700">预算上限</span>
                </div>
                <span className="text-sm font-bold font-mono text-success">
                  ¥{localBudget.toLocaleString()}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="3000"
                step="50"
                value={localBudget}
                onChange={(e) => setLocalBudget(Number(e.target.value))}
                className="w-full h-2 bg-primary-200 rounded-lg appearance-none cursor-pointer accent-success"
              />
            </div>
          </div>
        </div>

        {compareList.length > 0 && compareList.length < 2 && (
          <div className="bg-warning/10 border border-warning/30 rounded-lg p-3 flex items-center space-x-2">
            <AlertTriangle size={16} className="text-warning flex-shrink-0" />
            <span className="text-sm text-warning-700">
              请再选择 {2 - compareList.length} 个方案进行对比（最多可选 3 个）
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {screenOptions.map((option) => {
            const isOverBudget = option.price.retail > localBudget;
            const isSelected = compareList.includes(option.grade);
            const params = buildScreenParams(option);
            const riskTips = buildRiskTips(option);

            return (
              <div
                key={option.grade}
                className={cn(
                  'relative transition-all duration-300',
                  isOverBudget && 'opacity-50'
                )}
              >
                {isOverBudget && (
                  <div className="absolute -top-2 -right-2 z-10 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                    超出预算
                  </div>
                )}
                <ScreenCard
                  id={option.grade}
                  grade={option.gradeName}
                  gradeLevel={gradeLevelMap[option.grade]}
                  params={params}
                  riskTips={riskTips}
                  price={option.price.retail}
                  isSelected={isSelected}
                  onSelect={handleSelectCompare}
                />
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-primary-200">
          <div className="text-sm text-primary-500">
            <span className="flex items-center space-x-1">
              <Check size={14} className="text-success" />
              <span>勾选方案后可进行对比分析</span>
            </span>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setCompareList([])}
              className="px-4 py-2 bg-primary-100 text-primary-600 rounded-lg hover:bg-primary-200 transition-colors text-sm font-medium"
            >
              清空选择
            </button>
            <button
              onClick={handleGoToCompare}
              disabled={compareList.length < 2}
              className={cn(
                'px-6 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2',
                compareList.length >= 2
                  ? 'bg-success text-white hover:bg-success/90 shadow-md'
                  : 'bg-primary-200 text-primary-400 cursor-not-allowed'
              )}
            >
              <ListChecks size={16} />
              <span>开始对比</span>
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
