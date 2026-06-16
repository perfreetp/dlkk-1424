import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Star,
  ChevronDown,
  ChevronUp,
  Check,
  AlertTriangle,
  Info,
  XCircle,
  Smartphone,
  Volume2,
  Palette,
  Droplets,
  Frame,
  Wrench,
  Shield,
  Battery,
  CheckCircle2,
  X,
} from 'lucide-react';
import Layout from '@/components/Layout';
import { useAppStore, selectSelection, selectTestChecklist, selectFavoriteNoteIds } from '@/store/useAppStore';
import { getModelById } from '@/data/models';
import { getCompatibilityByModelId } from '@/data/compatibility';
import type { CompatibilityCategory, CompatibilityNote, TestChecklistItem } from '@/types';
import { cn } from '@/lib/utils';

type CategoryFilter = CompatibilityCategory | 'all';

const categoryConfig: Record<CategoryFilter, { label: string; icon: React.ReactNode }> = {
  'all': { label: '全部', icon: <Info size={16} /> },
  'earpiece-flex': { label: '听筒排线', icon: <Volume2 size={16} /> },
  'true-tone-writer': { label: '原彩写入', icon: <Palette size={16} /> },
  'sealant': { label: '密封胶', icon: <Droplets size={16} /> },
  'bracket': { label: '支架', icon: <Frame size={16} /> },
  'screw-spec': { label: '螺丝规格', icon: <Wrench size={16} /> },
  'face-id': { label: '面容识别', icon: <Shield size={16} /> },
  'battery': { label: '电池', icon: <Battery size={16} /> },
};

const severityConfig = {
  info: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', label: '低风险' },
  warning: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', label: '中风险' },
  danger: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', label: '高风险' },
};

const operationSteps: Record<string, string[]> = {
  'earpiece-flex': [
    '使用热风枪加热屏幕边缘，温度控制在 80-100°C',
    '用吸盘轻轻拉起屏幕，注意不要过度拉伸排线',
    '使用塑料撬片小心分离听筒排线与屏幕连接器',
    '更换新屏幕后，先测试听筒功能再完全组装',
    '确保排线连接器完全卡扣到位，无松动',
  ],
  'true-tone-writer': [
    '在更换屏幕前，使用原彩修复仪读取原屏幕数据',
    '记录设备的序列号和原屏幕的编码信息',
    '更换新屏幕后，将数据写入新屏幕的IC芯片',
    '重启设备，在设置中检查原彩显示开关是否可用',
    '在不同光线环境下测试原彩显示效果',
  ],
  'sealant': [
    '彻底清除机身和屏幕上的旧密封胶残留',
    '使用无尘布沾少量异丙醇清洁粘接面',
    '按照屏幕边框形状均匀涂抹新的密封胶',
    '使用专用压合夹具固定屏幕，压力控制在 5-8kg',
    '静置 30 分钟后再进行下一步操作',
  ],
  'bracket': [
    '加热屏幕支架区域，软化原有胶水',
    '使用细金属丝小心分离屏幕与支架',
    '清除支架上的残胶，检查支架是否变形',
    '在支架内均匀涂抹专用结构胶',
    '将新屏幕与支架精确对齐后压合固定',
  ],
  'screw-spec': [
    '使用磁性螺丝垫，按拆卸顺序放置螺丝',
    '确认螺丝刀型号匹配：五星 0.8mm、十字 1.2mm',
    '螺丝按对角线顺序逐步拧紧，避免屏幕受力不均',
    '扭矩控制在 0.6-0.8 N·m，不要过度拧紧',
    '组装完成后检查所有螺丝是否到位',
  ],
  'face-id': [
    '在拆卸屏幕前，标记 Face ID 组件的原始位置',
    '使用防静电镊子操作，避免静电损坏元件',
    '不要触摸点阵投影器和泛光感应元件的表面',
    '更换屏幕后，先进行 Face ID 功能测试',
    '如果 Face ID 失效，使用诊断工具排查原因',
  ],
  'battery': [
    '关机并断开电池连接器',
    '使用专用拉胶手柄，缓慢均匀拉出电池胶',
    '如果拉胶断裂，使用异丙醇软化残留胶水',
    '安装新电池时，注意电池胶的正确位置',
    '连接电池后，静置 5 分钟再开机测试',
  ],
};

interface NoteDetail {
  id: string;
  expanded: boolean;
}

export default function Compatibility() {
  const navigate = useNavigate();
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [noteDetails, setNoteDetails] = useState<Record<string, NoteDetail>>({});
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const selection = useAppStore(selectSelection);
  const testChecklist = useAppStore(selectTestChecklist);
  const favoriteNoteIds = useAppStore(selectFavoriteNoteIds);
  const { updateTestChecklist, resetTestChecklist, toggleFavoriteModel, toggleFavoriteNote } = useAppStore();

  const currentModel = useMemo(() => {
    if (!selection.modelId) return null;
    return getModelById(selection.modelId);
  }, [selection.modelId]);

  const notes = useMemo(() => {
    if (!selection.modelId) return [];
    return getCompatibilityByModelId(selection.modelId);
  }, [selection.modelId]);

  const filteredNotes = useMemo(() => {
    let filtered = notes;

    if (categoryFilter !== 'all') {
      filtered = filtered.filter((n) => n.category === categoryFilter);
    }

    if (showFavoritesOnly) {
      filtered = filtered.filter((n) => favoriteNoteIds.includes(n.modelId + '-' + n.category));
    }

    return filtered;
  }, [notes, categoryFilter, showFavoritesOnly, favoriteNoteIds]);

  const toggleExpand = (noteId: string) => {
    setNoteDetails((prev) => ({
      ...prev,
      [noteId]: {
        ...prev[noteId],
        expanded: !prev[noteId]?.expanded,
      },
    }));
  };

  const toggleFavorite = (noteId: string) => {
    toggleFavoriteNote(noteId);
  };

  const handleTestItemCheck = (id: string) => {
    const item = testChecklist.find((t) => t.id === id);
    if (!item) return;

    if (!item.checked) {
      updateTestChecklist(id, { checked: true, passed: null });
    } else if (item.passed === null) {
      updateTestChecklist(id, { passed: true });
    } else if (item.passed === true) {
      updateTestChecklist(id, { passed: false });
    } else {
      updateTestChecklist(id, { checked: false, passed: null });
    }
  };

  const handleBack = () => {
    navigate('/screen-options');
  };

  const getNoteId = (note: CompatibilityNote) => `${note.modelId}-${note.category}`;

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'info':
        return <Info size={18} className="text-green-600" />;
      case 'warning':
        return <AlertTriangle size={18} className="text-yellow-600" />;
      case 'danger':
        return <XCircle size={18} className="text-red-600" />;
      default:
        return <Info size={18} />;
    }
  };

  const completedTests = testChecklist.filter((t) => t.checked && t.passed !== null);
  const passedTests = testChecklist.filter((t) => t.checked && t.passed === true);
  const progressPercent = testChecklist.length > 0
    ? Math.round((completedTests.length / testChecklist.length) * 100)
    : 0;

  const testCategories = [
    { key: 'display', label: '显示测试', icon: <Smartphone size={14} /> },
    { key: 'touch', label: '触控测试', icon: <Smartphone size={14} /> },
    { key: 'face-id', label: '面容识别', icon: <Shield size={14} /> },
    { key: 'camera', label: '摄像头', icon: <Smartphone size={14} /> },
    { key: 'sensors', label: '传感器', icon: <Info size={14} /> },
    { key: 'buttons', label: '按键测试', icon: <Wrench size={14} /> },
  ];

  if (!currentModel) {
    return (
      <Layout>
        <div className="text-center py-16">
          <Smartphone size={48} className="mx-auto text-primary-300 mb-3" />
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
              <h1 className="text-2xl font-bold text-primary-800">兼容提醒</h1>
              <p className="text-sm text-primary-500 mt-1">
                <span className="font-semibold text-primary-700">{currentModel.name}</span> 的换屏注意事项
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className={cn(
              'flex items-center space-x-2 px-4 py-2 rounded-lg transition-all',
              showFavoritesOnly
                ? 'bg-yellow-100 text-yellow-700 border border-yellow-300'
                : 'bg-primary-100 text-primary-600 hover:bg-primary-200'
            )}
          >
            <Star size={16} fill={showFavoritesOnly ? 'currentColor' : 'none'} />
            <span>{showFavoritesOnly ? '显示全部' : '仅显示收藏'}</span>
          </button>
        </div>

        <div className="bg-white rounded-xl border border-primary-200 p-4 shadow-sm">
          <div className="flex flex-wrap gap-2">
            {(Object.keys(categoryConfig) as CategoryFilter[]).map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={cn(
                  'flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                  categoryFilter === cat
                    ? 'bg-success text-white shadow-md'
                    : 'bg-primary-100 text-primary-600 hover:bg-primary-200'
                )}
              >
                {categoryConfig[cat].icon}
                <span>{categoryConfig[cat].label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {filteredNotes.map((note) => {
            const noteId = getNoteId(note);
            const detail = noteDetails[noteId] || { expanded: false };
            const isFavorite = favoriteNoteIds.includes(noteId);
            const severity = severityConfig[note.severity];
            const steps = operationSteps[note.category] || [];

            return (
              <div
                key={noteId}
                className={cn(
                  'rounded-xl border-2 transition-all duration-300 overflow-hidden',
                  severity.bg,
                  severity.border
                )}
              >
                <div
                  className="p-4 cursor-pointer"
                  onClick={() => toggleExpand(noteId)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="flex-shrink-0 mt-0.5">
                        {getSeverityIcon(note.severity)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-primary-800">
                            {note.categoryName}
                          </h3>
                          <span className={cn(
                            'text-xs font-medium px-2 py-0.5 rounded-full',
                            severity.bg,
                            severity.text
                          )}>
                            {severity.label}
                          </span>
                          {note.isCompatible ? (
                            <span className="text-xs text-green-600 flex items-center space-x-0.5">
                              <Check size={12} />
                              <span>兼容</span>
                            </span>
                          ) : (
                            <span className="text-xs text-red-600 flex items-center space-x-0.5">
                              <X size={12} />
                              <span>不兼容</span>
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-primary-600 mt-1 leading-relaxed">
                          {note.note}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 ml-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(noteId);
                        }}
                        className={cn(
                          'p-2 rounded-lg transition-all',
                          isFavorite
                            ? 'text-yellow-500 bg-yellow-100'
                            : 'text-primary-300 hover:text-yellow-500 hover:bg-yellow-50'
                        )}
                      >
                        <Star size={18} fill={isFavorite ? 'currentColor' : 'none'} />
                      </button>
                      <button className="p-2 rounded-lg text-primary-400 hover:text-primary-600 hover:bg-primary-100 transition-all">
                        {detail.expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </button>
                    </div>
                  </div>
                </div>

                {detail.expanded && (
                  <div className="px-4 pb-4 border-t border-primary-200/50">
                    <div className="pt-4">
                      <h4 className="text-sm font-semibold text-primary-700 mb-3 flex items-center space-x-1.5">
                        <Wrench size={14} />
                        <span>操作步骤</span>
                      </h4>
                      <ol className="space-y-2">
                        {steps.map((step, index) => (
                          <li key={index} className="flex items-start space-x-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-white border-2 border-primary-300 flex items-center justify-center text-xs font-bold text-primary-600">
                              {index + 1}
                            </span>
                            <p className="text-sm text-primary-600 leading-relaxed pt-0.5">
                              {step}
                            </p>
                          </li>
                        ))}
                      </ol>
                    </div>

                    {note.relatedModelIds && note.relatedModelIds.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-primary-200/50">
                        <h4 className="text-sm font-semibold text-primary-700 mb-2">相关机型</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {note.relatedModelIds.slice(0, 5).map((modelId) => (
                            <span
                              key={modelId}
                              className="text-xs px-2 py-1 bg-white rounded-full text-primary-600 border border-primary-200"
                            >
                              {modelId.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                            </span>
                          ))}
                          {note.relatedModelIds.length > 5 && (
                            <span className="text-xs px-2 py-1 bg-white rounded-full text-primary-500 border border-primary-200">
                              +{note.relatedModelIds.length - 5} 更多
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {filteredNotes.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-primary-200">
            <Info size={40} className="mx-auto text-primary-300 mb-3" />
            <p className="text-primary-500">没有找到符合条件的提醒</p>
          </div>
        )}

        <div className="bg-white rounded-xl border border-primary-200 overflow-hidden shadow-sm">
          <div className="px-5 py-4 bg-primary-50 border-b border-primary-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle2 size={18} className="text-success" />
                <h3 className="font-semibold text-primary-800">换屏后测试清单</h3>
              </div>
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <span className="text-xs text-primary-500">完成进度</span>
                  <div className="text-sm font-bold text-primary-700">
                    {passedTests.length}/{testChecklist.length} 项通过
                  </div>
                </div>
                <div className="w-24 h-2 bg-primary-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-success rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <button
                  onClick={resetTestChecklist}
                  className="text-xs text-primary-500 hover:text-primary-700 underline"
                >
                  重置
                </button>
              </div>
            </div>
          </div>

          <div className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {testCategories.map((cat) => {
                const categoryTests = testChecklist.filter((t) => t.category === cat.key);
                return (
                  <div key={cat.key} className="space-y-2">
                    <h4 className="text-sm font-semibold text-primary-700 flex items-center space-x-1.5 pb-2 border-b border-primary-100">
                      {cat.icon}
                      <span>{cat.label}</span>
                    </h4>
                    <div className="space-y-1.5">
                      {categoryTests.map((test) => (
                        <div
                          key={test.id}
                          onClick={() => handleTestItemCheck(test.id)}
                          className={cn(
                            'flex items-center space-x-2.5 p-2 rounded-lg cursor-pointer transition-all',
                            test.checked && test.passed === true && 'bg-green-50',
                            test.checked && test.passed === false && 'bg-red-50',
                            !test.checked && 'hover:bg-primary-50'
                          )}
                        >
                          <div className={cn(
                            'w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all',
                            test.checked && test.passed === true && 'bg-green-500 border-green-500',
                            test.checked && test.passed === false && 'bg-red-500 border-red-500',
                            !test.checked && 'border-primary-300 hover:border-primary-400'
                          )}>
                            {test.checked && test.passed === true && <Check size={12} className="text-white" />}
                            {test.checked && test.passed === false && <X size={12} className="text-white" />}
                          </div>
                          <span className={cn(
                            'text-sm flex-1',
                            test.checked && test.passed === true && 'text-green-700 line-through',
                            test.checked && test.passed === false && 'text-red-700',
                            !test.checked && 'text-primary-600'
                          )}>
                            {test.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
