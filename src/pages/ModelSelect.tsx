import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Globe, Shield, Monitor, Wallet, Star } from 'lucide-react';
import Layout from '@/components/Layout';
import ModelCard from '@/components/ModelCard';
import { useAppStore, selectPinnedModelIds, selectSelection } from '@/store/useAppStore';
import { iphoneModels } from '@/data/models';
import { getScreenOptionsByModelId } from '@/data/screenOptions';
import { cn } from '@/lib/utils';

type Region = 'all' | 'china' | 'global';
type FaceIdStatus = 'all' | 'normal' | 'abnormal';
type ScreenTypeFilter = 'all' | 'oled' | 'lcd';

export default function ModelSelect() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [region, setRegion] = useState<Region>('all');
  const [faceIdStatus, setFaceIdStatus] = useState<FaceIdStatus>('all');
  const [screenType, setScreenType] = useState<ScreenTypeFilter>('all');
  const [budget, setBudget] = useState(3000);

  const { setModelId, togglePinnedModel } = useAppStore();
  const pinnedModelIds = useAppStore(selectPinnedModelIds);
  const selection = useAppStore(selectSelection);

  const filteredModels = useMemo(() => {
    let models = [...iphoneModels];

    if (region !== 'all') {
      models = models.filter((m) => m.region === region);
    }

    if (faceIdStatus !== 'all') {
      if (faceIdStatus === 'normal') {
        models = models.filter((m) => m.hasFaceId);
      } else {
        models = models.filter((m) => !m.hasFaceId);
      }
    }

    if (screenType !== 'all') {
      if (screenType === 'oled') {
        models = models.filter((m) => m.screenType === 'oled' || m.screenType === 'ltpo');
      } else {
        models = models.filter((m) => m.screenType === 'lcd');
      }
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      models = models.filter(
        (m) =>
          m.name.toLowerCase().includes(query) ||
          m.id.toLowerCase().includes(query) ||
          String(m.releaseYear).includes(query)
      );
    }

    models = models.filter((m) => {
      const options = getScreenOptionsByModelId(m.id);
      if (options.length === 0) return false;
      const minPrice = Math.min(...options.map((o) => o.price.retail));
      return minPrice <= budget;
    });

    const pinned = models.filter((m) => pinnedModelIds.includes(m.id));
    const unpinned = models.filter((m) => !pinnedModelIds.includes(m.id));

    pinned.sort((a, b) => b.releaseYear - a.releaseYear);
    unpinned.sort((a, b) => b.releaseYear - a.releaseYear);

    return [...pinned, ...unpinned];
  }, [region, faceIdStatus, screenType, searchQuery, budget, pinnedModelIds]);

  const handleSelectModel = (modelId: string) => {
    setModelId(modelId);
    navigate('/screen-options');
  };

  const handlePinModel = (modelId: string) => {
    togglePinnedModel(modelId);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-primary-800">型号选择</h1>
            <p className="text-sm text-primary-500 mt-1">
              选择您需要更换屏幕的 iPhone 型号
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Star size={16} className="text-warning" />
            <span className="text-sm text-primary-600">
              双击卡片可置顶/取消置顶
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-primary-200 p-5 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Globe size={16} className="text-primary-500" />
                <label className="text-sm font-medium text-primary-700">销售地区</label>
              </div>
              <div className="flex space-x-2">
                {(['all', 'china', 'global'] as Region[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => setRegion(r)}
                    className={cn(
                      'flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                      region === r
                        ? 'bg-success text-white shadow-md'
                        : 'bg-primary-100 text-primary-600 hover:bg-primary-200'
                    )}
                  >
                    {r === 'all' ? '全部' : r === 'china' ? '国行' : '外版'}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Shield size={16} className="text-primary-500" />
                <label className="text-sm font-medium text-primary-700">Face ID 状态</label>
              </div>
              <div className="flex space-x-2">
                {(['all', 'normal', 'abnormal'] as FaceIdStatus[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => setFaceIdStatus(s)}
                    className={cn(
                      'flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                      faceIdStatus === s
                        ? 'bg-success text-white shadow-md'
                        : 'bg-primary-100 text-primary-600 hover:bg-primary-200'
                    )}
                  >
                    {s === 'all' ? '全部' : s === 'normal' ? '正常' : '异常'}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Monitor size={16} className="text-primary-500" />
                <label className="text-sm font-medium text-primary-700">原屏类型</label>
              </div>
              <div className="flex space-x-2">
                {(['all', 'oled', 'lcd'] as ScreenTypeFilter[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setScreenType(t)}
                    className={cn(
                      'flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                      screenType === t
                        ? 'bg-success text-white shadow-md'
                        : 'bg-primary-100 text-primary-600 hover:bg-primary-200'
                    )}
                  >
                    {t === 'all' ? '全部' : t === 'oled' ? 'OLED' : 'LCD'}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Wallet size={16} className="text-primary-500" />
                  <label className="text-sm font-medium text-primary-700">预算上限</label>
                </div>
                <span className="text-sm font-bold font-mono text-success">
                  ¥{budget.toLocaleString()}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="3000"
                step="50"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full h-2 bg-primary-200 rounded-lg appearance-none cursor-pointer accent-success"
              />
              <div className="flex justify-between text-xs text-primary-400">
                <span>¥0</span>
                <span>¥1500</span>
                <span>¥3000</span>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-400" />
              <input
                type="text"
                placeholder="搜索型号名称、编号或年份..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-primary-50 border border-primary-200 rounded-lg text-sm text-primary-800 placeholder-primary-400 focus:outline-none focus:ring-2 focus:ring-success/30 focus:border-success transition-all"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-primary-500">
            共找到 <span className="font-semibold text-primary-700">{filteredModels.length}</span> 个型号
          </span>
          {pinnedModelIds.length > 0 && (
            <span className="text-xs text-warning font-medium">
              {pinnedModelIds.length} 个置顶型号
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredModels.map((model) => (
            <ModelCard
              key={model.id}
              id={model.id}
              name={model.name}
              year={model.releaseYear}
              screenType={model.screenType.toUpperCase()}
              hasFaceId={model.hasFaceId}
              isSelected={selection.modelId === model.id}
              isPinned={pinnedModelIds.includes(model.id)}
              onSelect={handleSelectModel}
              onPin={handlePinModel}
            />
          ))}
        </div>

        {filteredModels.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl border border-primary-200">
            <Monitor size={48} className="mx-auto text-primary-300 mb-3" />
            <p className="text-primary-500">没有找到符合条件的型号</p>
            <p className="text-sm text-primary-400 mt-1">请尝试调整筛选条件</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
