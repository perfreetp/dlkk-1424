import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Search,
  Filter,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Package,
  History,
  X,
  Calendar,
  User,
  FileText,
  ChevronRight,
  ChevronDown as ChevronDownIcon,
} from 'lucide-react';
import Layout from '@/components/Layout';
import { useAppStore, selectHistoryQuotes, selectSelection } from '@/store/useAppStore';
import { iphoneModels } from '@/data/models';
import { inventoryItems } from '@/data/inventory';
import type { InventoryItem, ScreenGrade } from '@/types';
import { cn } from '@/lib/utils';

type SortKey = 'quantity' | 'purchasePrice' | 'retailPrice' | 'profit';
type SortDirection = 'asc' | 'desc' | null;

interface SortState {
  key: SortKey | null;
  direction: SortDirection;
}

const gradeNames: Record<ScreenGrade, string> = {
  'original': '原拆屏幕',
  'refurbished': '后压屏幕',
  'chinese-oled': '国产OLED',
  'lcd-replacement': 'LCD替代屏',
};

const gradeColors: Record<string, string> = {
  'original': 'bg-success/10 text-success border-success/30',
  'refurbished': 'bg-primary-100 text-primary-700 border-primary-300',
  'chinese-oled': 'bg-warning/10 text-warning border-warning/30',
  'lcd-replacement': 'bg-primary-100 text-primary-500 border-primary-200',
};

export default function Inventory() {
  const navigate = useNavigate();
  const [modelFilter, setModelFilter] = useState<string>('all');
  const [gradeFilter, setGradeFilter] = useState<string>('all');
  const [supplierFilter, setSupplierFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortState, setSortState] = useState<SortState>({ key: null, direction: null });
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const historyQuotes = useAppStore(selectHistoryQuotes);
  const selection = useAppStore(selectSelection);

  const suppliers = useMemo(() => {
    const uniqueSuppliers = [...new Set(inventoryItems.map((item) => item.supplier))];
    return uniqueSuppliers;
  }, []);

  const modelOptions = useMemo(() => {
    return iphoneModels
      .filter((m) => inventoryItems.some((item) => item.modelId === m.id))
      .sort((a, b) => b.releaseYear - a.releaseYear);
  }, []);

  const filteredData = useMemo(() => {
    let data = [...inventoryItems];

    if (modelFilter !== 'all') {
      data = data.filter((item) => item.modelId === modelFilter);
    }

    if (gradeFilter !== 'all') {
      data = data.filter((item) => item.screenGrade === gradeFilter);
    }

    if (supplierFilter !== 'all') {
      data = data.filter((item) => item.supplier === supplierFilter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      data = data.filter(
        (item) =>
          item.modelId.toLowerCase().includes(query) ||
          item.supplier.toLowerCase().includes(query) ||
          item.location.toLowerCase().includes(query) ||
          gradeNames[item.screenGrade]?.toLowerCase().includes(query)
      );
    }

    return data;
  }, [modelFilter, gradeFilter, supplierFilter, searchQuery]);

  const sortedData = useMemo(() => {
    if (!sortState.key || !sortState.direction) {
      return filteredData;
    }

    return [...filteredData].sort((a, b) => {
      let aVal: number;
      let bVal: number;

      if (sortState.key === 'profit') {
        aVal = a.retailPrice - a.purchasePrice;
        bVal = b.retailPrice - b.purchasePrice;
      } else {
        aVal = a[sortState.key];
        bVal = b[sortState.key];
      }

      return sortState.direction === 'asc' ? aVal - bVal : bVal - aVal;
    });
  }, [filteredData, sortState]);

  const handleSort = (key: SortKey) => {
    setSortState((prev) => {
      if (prev.key !== key) {
        return { key, direction: 'asc' };
      }
      if (prev.direction === 'asc') {
        return { key, direction: 'desc' };
      }
      return { key: null, direction: null };
    });
  };

  const getProfitMargin = (item: InventoryItem) => {
    const profit = item.retailPrice - item.purchasePrice;
    return Math.round((profit / item.purchasePrice) * 100);
  };

  const getMarginColor = (margin: number) => {
    if (margin >= 50) return 'text-green-600 bg-green-50 border-green-200';
    if (margin >= 30) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getModelName = (modelId: string) => {
    const model = iphoneModels.find((m) => m.id === modelId);
    return model?.name || modelId;
  };

  const renderSortIcon = (key: SortKey) => {
    if (sortState.key !== key) {
      return <ChevronsUpDown size={14} className="text-primary-300" />;
    }
    if (sortState.direction === 'asc') {
      return <ChevronUp size={14} className="text-success" />;
    }
    return <ChevronDown size={14} className="text-success" />;
  };

  const toggleExpand = (id: string) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const handleBack = () => {
    navigate('/compatibility');
  };

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
              <h1 className="text-2xl font-bold text-primary-800">库存报价</h1>
              <p className="text-sm text-primary-500 mt-1">
                管理屏幕库存和报价信息
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowHistoryModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-success text-white rounded-lg hover:bg-success/90 transition-all shadow-md"
          >
            <History size={18} />
            <span>历史报价</span>
          </button>
        </div>

        <div className="bg-white rounded-xl border border-primary-200 p-5 shadow-sm">
          <div className="flex items-center space-x-2 mb-4">
            <Filter size={18} className="text-primary-500" />
            <span className="font-medium text-primary-700">筛选条件</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-primary-700">型号</label>
              <select
                value={modelFilter}
                onChange={(e) => setModelFilter(e.target.value)}
                className="w-full px-3 py-2 bg-primary-50 border border-primary-200 rounded-lg text-sm text-primary-800 focus:outline-none focus:ring-2 focus:ring-success/30 focus:border-success transition-all"
              >
                <option value="all">全部型号</option>
                {modelOptions.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-primary-700">屏幕等级</label>
              <select
                value={gradeFilter}
                onChange={(e) => setGradeFilter(e.target.value)}
                className="w-full px-3 py-2 bg-primary-50 border border-primary-200 rounded-lg text-sm text-primary-800 focus:outline-none focus:ring-2 focus:ring-success/30 focus:border-success transition-all"
              >
                <option value="all">全部等级</option>
                <option value="original">原拆屏幕</option>
                <option value="refurbished">后压屏幕</option>
                <option value="chinese-oled">国产OLED</option>
                <option value="lcd-replacement">LCD替代屏</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-primary-700">供应商</label>
              <select
                value={supplierFilter}
                onChange={(e) => setSupplierFilter(e.target.value)}
                className="w-full px-3 py-2 bg-primary-50 border border-primary-200 rounded-lg text-sm text-primary-800 focus:outline-none focus:ring-2 focus:ring-success/30 focus:border-success transition-all"
              >
                <option value="all">全部供应商</option>
                {suppliers.map((supplier) => (
                  <option key={supplier} value={supplier}>
                    {supplier}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-primary-700">搜索</label>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-400" />
                <input
                  type="text"
                  placeholder="搜索型号、供应商..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-primary-50 border border-primary-200 rounded-lg text-sm text-primary-800 placeholder-primary-400 focus:outline-none focus:ring-2 focus:ring-success/30 focus:border-success transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-primary-500">
            共 <span className="font-semibold text-primary-700">{sortedData.length}</span> 条记录
          </span>
          <div className="flex items-center space-x-2">
            {(modelFilter !== 'all' || gradeFilter !== 'all' || supplierFilter !== 'all' || searchQuery) && (
              <button
                onClick={() => {
                  setModelFilter('all');
                  setGradeFilter('all');
                  setSupplierFilter('all');
                  setSearchQuery('');
                }}
                className="text-sm text-primary-500 hover:text-primary-700 underline"
              >
                清除筛选
              </button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-primary-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-primary-50 border-b border-primary-200">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-primary-600 uppercase tracking-wider w-10">
                    <span className="sr-only">展开</span>
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-semibold text-primary-600 uppercase tracking-wider">
                    屏幕等级
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-semibold text-primary-600 uppercase tracking-wider">
                    型号
                  </th>
                  <th
                    className="px-4 py-3 text-right text-xs font-semibold text-primary-600 uppercase tracking-wider cursor-pointer hover:bg-primary-100/50"
                    onClick={() => handleSort('quantity')}
                  >
                    <div className="flex items-center justify-end space-x-1">
                      <span>库存数量</span>
                      {renderSortIcon('quantity')}
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 text-right text-xs font-semibold text-primary-600 uppercase tracking-wider cursor-pointer hover:bg-primary-100/50"
                    onClick={() => handleSort('purchasePrice')}
                  >
                    <div className="flex items-center justify-end space-x-1">
                      <span>进货价</span>
                      {renderSortIcon('purchasePrice')}
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 text-right text-xs font-semibold text-primary-600 uppercase tracking-wider cursor-pointer hover:bg-primary-100/50"
                    onClick={() => handleSort('retailPrice')}
                  >
                    <div className="flex items-center justify-end space-x-1">
                      <span>零售价</span>
                      {renderSortIcon('retailPrice')}
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 text-right text-xs font-semibold text-primary-600 uppercase tracking-wider cursor-pointer hover:bg-primary-100/50"
                    onClick={() => handleSort('profit')}
                  >
                    <div className="flex items-center justify-end space-x-1">
                      <span>毛利</span>
                      {renderSortIcon('profit')}
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-semibold text-primary-600 uppercase tracking-wider">
                    供应商
                  </th>
                  <th
                    className="px-4 py-3 text-center text-xs font-semibold text-primary-600 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary-100">
                {sortedData.map((item, index) => {
                  const margin = getProfitMargin(item);
                  const profit = item.retailPrice - item.purchasePrice;
                  const isExpanded = expandedRow === item.id;

                  return (
                    <>
                      <tr
                        key={item.id}
                        className={cn(
                          'transition-colors hover:bg-primary-50/50 cursor-pointer',
                          index % 2 === 1 && 'bg-primary-50/30',
                          isExpanded && 'bg-primary-50'
                        )}
                        onClick={() => toggleExpand(item.id)}
                      >
                        <td className="px-4 py-3">
                          <button className="p-1 rounded hover:bg-primary-100 transition-colors">
                            {isExpanded ? (
                              <ChevronDownIcon size={16} className="text-primary-500" />
                            ) : (
                              <ChevronRight size={16} className="text-primary-400" />
                            )}
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={cn(
                              'text-xs font-bold px-2.5 py-1 rounded border',
                              gradeColors[item.screenGrade]
                            )}
                          >
                            {gradeNames[item.screenGrade]}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-primary-700 font-medium">
                          {getModelName(item.modelId)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className={cn(
                            'font-mono font-semibold text-sm',
                            item.quantity <= item.minStock ? 'text-red-500' : 'text-primary-700'
                          )}>
                            {item.quantity.toLocaleString()}
                          </span>
                          {item.quantity <= item.minStock && (
                            <span className="text-[10px] text-red-500 block">库存不足</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-sm text-primary-700">
                          ¥{item.purchasePrice.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-sm font-semibold text-primary-800">
                          ¥{item.retailPrice.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex flex-col items-end space-y-1">
                            <span className="font-mono text-sm font-bold text-primary-700">
                              ¥{profit.toLocaleString()}
                            </span>
                            <span
                              className={cn(
                                'text-[10px] font-bold px-1.5 py-0.5 rounded border',
                                getMarginColor(margin)
                              )}
                            >
                              {margin >= 0 ? '+' : ''}{margin}%
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-primary-600">
                          {item.supplier}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate('/screen-options');
                            }}
                            className="px-3 py-1 bg-primary-100 text-primary-600 text-xs font-medium rounded hover:bg-primary-200 transition-colors"
                          >
                            查看
                          </button>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className="bg-primary-50/80">
                          <td colSpan={9} className="px-4 py-4">
                            <div className="border-l-4 border-success/30 pl-4">
                              <h4 className="text-sm font-semibold text-primary-700 mb-3 flex items-center space-x-2">
                                <FileText size={14} />
                                <span>批次备注详情</span>
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <div className="flex items-center space-x-2 text-xs text-primary-500">
                                  <Package size={12} />
                                  <span>批次号: <span className="font-mono text-primary-700">{item.batchNumber}</span></span>
                                </div>
                                <div className="flex items-center space-x-2 text-xs text-primary-500">
                                  <Calendar size={12} />
                                  <span>入库日期: <span className="text-primary-700">{item.purchaseDate}</span></span>
                                </div>
                                <div className="flex items-center space-x-2 text-xs text-primary-500">
                                  <User size={12} />
                                  <span>库位: <span className="font-mono text-primary-700">{item.location}</span></span>
                                </div>
                                <div className="flex items-center space-x-2 text-xs text-primary-500">
                                  <History size={12} />
                                  <span>更新时间: <span className="text-primary-700">{item.lastUpdated}</span></span>
                                </div>
                              </div>
                              </div>
                              <div className="mt-4 space-y-2">
                                {item.batchNotes.map((note, idx) => (
                                  <div key={idx} className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-primary-200">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                                      <User size={14} className="text-primary-500" />
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex items-center justify-between">
                                        <span className="text-xs font-medium text-primary-700">{note.operator}</span>
                                      <span className="text-[10px] text-primary-400">{note.date}</span>
                                    </div>
                                    <p className="text-xs text-primary-600 mt-0.5">{note.content}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>

          {sortedData.length === 0 && (
            <div className="py-12 text-center">
              <Package size={40} className="mx-auto text-primary-300 mb-3" />
              <p className="text-primary-500">暂无数据</p>
            </div>
          )}
        </div>
      </div>

      {showHistoryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-primary-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-primary-800 flex items-center space-x-2">
                <History size={18} />
                <span>历史报价查询</span>
              </h3>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="p-2 rounded-lg hover:bg-primary-100 transition-colors"
              >
                <X size={18} className="text-primary-500" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {historyQuotes.length === 0 ? (
                <div className="text-center py-12">
                  <History size={40} className="mx-auto text-primary-300 mb-3" />
                  <p className="text-primary-500">暂无历史报价记录</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {historyQuotes.map((quote) => (
                    <div
                      key={quote.id}
                      className="p-4 bg-primary-50 rounded-lg border border-primary-200"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-primary-800">{quote.modelName}</h4>
                          <p className="text-xs text-primary-500 mt-0.5">
                            {quote.gradeName} • {new Date(quote.createdAt).toLocaleString('zh-CN')}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-xl font-bold font-mono text-success">
                            ¥{quote.totalPrice.toLocaleString()}
                          </span>
                        </div>
                      </div>
                      {quote.customerName && (
                        <p className="text-xs text-primary-600 mt-2">
                          客户: {quote.customerName}
                        </p>
                      )}
                      {quote.notes && (
                        <p className="text-xs text-primary-500 mt-1">{quote.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
