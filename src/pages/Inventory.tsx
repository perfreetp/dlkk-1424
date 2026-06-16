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
  Plus,
  Phone,
  AlertCircle,
  RefreshCw,
  DollarSign,
  ClipboardList,
  Check,
  Trash2,
  Eye,
  Save,
  Wrench,
  Clock,
  CheckCircle,
  XCircle,
  RotateCcw,
  ArrowRight,
  Shield,
} from 'lucide-react';
import Layout from '@/components/Layout';
import { useAppStore, selectHistoryQuotes, selectSelection, selectWorkOrders, selectInventoryReservations, selectInventoryItems } from '@/store/useAppStore';
import { iphoneModels } from '@/data/models';
import { getScreenOption } from '@/data/screenOptions';
import type { InventoryItem, ScreenGrade, HistoryQuote, WorkOrder, WorkOrderStatus } from '@/types';
import { cn } from '@/lib/utils';
import { generateId } from '@/utils/formatter';

type SortKey = 'quantity' | 'purchasePrice' | 'retailPrice' | 'profit';
type SortDirection = 'asc' | 'desc' | null;

interface SortState {
  key: SortKey | null;
  direction: SortDirection;
}

interface QuoteFormData {
  modelId: string;
  screenGrade: ScreenGrade | '';
  customerName: string;
  customerPhone: string;
  faultDescription: string;
  laborFee: number;
  notes: string;
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

const workOrderStatusConfig: Record<WorkOrderStatus, { label: string; color: string; bgColor: string; icon: React.ReactNode }> = {
  'pending': { label: '待检测', color: 'text-blue-700', bgColor: 'bg-blue-50 border-blue-200', icon: <Clock size={14} /> },
  'quoted': { label: '已报价', color: 'text-yellow-700', bgColor: 'bg-yellow-50 border-yellow-200', icon: <DollarSign size={14} /> },
  'repairing': { label: '维修中', color: 'text-purple-700', bgColor: 'bg-purple-50 border-purple-200', icon: <Wrench size={14} /> },
  'delivered': { label: '已交付', color: 'text-green-700', bgColor: 'bg-green-50 border-green-200', icon: <CheckCircle size={14} /> },
  'cancelled': { label: '已取消', color: 'text-gray-600', bgColor: 'bg-gray-50 border-gray-200', icon: <XCircle size={14} /> },
};

const defaultFormData: QuoteFormData = {
  modelId: '',
  screenGrade: '',
  customerName: '',
  customerPhone: '',
  faultDescription: '',
  laborFee: 80,
  notes: '',
};

export default function Inventory() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'inventory' | 'work-orders'>('inventory');
  const [modelFilter, setModelFilter] = useState<string>('all');
  const [gradeFilter, setGradeFilter] = useState<string>('all');
  const [supplierFilter, setSupplierFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortState, setSortState] = useState<SortState>({ key: null, direction: null });
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showQuoteDetailModal, setShowQuoteDetailModal] = useState(false);
  const [showWorkOrderDetailModal, setShowWorkOrderDetailModal] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<HistoryQuote | null>(null);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null);
  const [historySearchQuery, setHistorySearchQuery] = useState('');
  const [historySearchType, setHistorySearchType] = useState<'all' | 'customer' | 'model'>('all');
  const [workOrderSearchQuery, setWorkOrderSearchQuery] = useState('');
  const [workOrderStatusFilter, setWorkOrderStatusFilter] = useState<WorkOrderStatus | 'all'>('all');
  const [formData, setFormData] = useState<QuoteFormData>(defaultFormData);
  const [quoteSaved, setQuoteSaved] = useState(false);
  const [showAlternativeModal, setShowAlternativeModal] = useState(false);
  const [pendingQuoteForWorkOrder, setPendingQuoteForWorkOrder] = useState<HistoryQuote | null>(null);

  const historyQuotes = useAppStore(selectHistoryQuotes);
  const workOrders = useAppStore(selectWorkOrders);
  const inventoryReservations = useAppStore(selectInventoryReservations);
  const inventoryItems = useAppStore(selectInventoryItems);
  const selection = useAppStore(selectSelection);
  const {
    addHistoryQuote,
    removeHistoryQuote,
    addWorkOrder,
    updateWorkOrderStatus,
    convertQuoteToWorkOrder,
    reserveInventory,
    releaseInventory,
    deductInventory,
    getAvailableQuantity,
    getInventoryByModelAndGrade,
  } = useAppStore();

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

  const filteredHistoryQuotes = useMemo(() => {
    if (!historySearchQuery.trim()) return historyQuotes;
    const query = historySearchQuery.toLowerCase();
    return historyQuotes.filter((quote) => {
      if (historySearchType === 'customer') {
        return (
          quote.customerName?.toLowerCase().includes(query) ||
          quote.customerPhone?.includes(query)
        );
      }
      if (historySearchType === 'model') {
        return quote.modelName.toLowerCase().includes(query);
      }
      return (
        quote.customerName?.toLowerCase().includes(query) ||
        quote.customerPhone?.includes(query) ||
        quote.modelName.toLowerCase().includes(query) ||
        quote.gradeName.toLowerCase().includes(query)
      );
    });
  }, [historyQuotes, historySearchQuery, historySearchType]);

  const selectedScreenPrice = useMemo(() => {
    if (!formData.modelId || !formData.screenGrade) return 0;
    const option = getScreenOption(formData.modelId, formData.screenGrade as ScreenGrade);
    return option?.price.retail || 0;
  }, [formData.modelId, formData.screenGrade]);

  const selectedInventoryItem = useMemo(() => {
    if (!formData.modelId || !formData.screenGrade) return null;
    return getInventoryByModelAndGrade(formData.modelId, formData.screenGrade as ScreenGrade);
  }, [formData.modelId, formData.screenGrade]);

  const lowStockAlternatives = useMemo(() => {
    if (!selectedInventoryItem || selectedInventoryItem.quantity > selectedInventoryItem.minStock) {
      return [];
    }
    const allModelInventory = inventoryItems.filter(
      (item) => item.modelId === selectedInventoryItem.modelId && item.id !== selectedInventoryItem.id
    );
    return allModelInventory.sort((a, b) => b.quantity - a.quantity);
  }, [selectedInventoryItem]);

  const totalQuotePrice = selectedScreenPrice + formData.laborFee;

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

  const handleOpenQuoteModal = () => {
    setFormData({
      ...defaultFormData,
      modelId: selection.modelId || '',
      screenGrade: selection.screenGrade || '',
      laborFee: 80,
    });
    setQuoteSaved(false);
    setShowQuoteModal(true);
  };

  const handleFormChange = (field: keyof QuoteFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveQuote = () => {
    if (!formData.modelId || !formData.screenGrade) return;

    const modelName = getModelName(formData.modelId);
    const gradeName = gradeNames[formData.screenGrade as ScreenGrade];

    const quote: Omit<HistoryQuote, 'id' | 'createdAt'> = {
      modelId: formData.modelId,
      modelName,
      screenGrade: formData.screenGrade as ScreenGrade,
      gradeName,
      screenPrice: selectedScreenPrice,
      laborFee: formData.laborFee,
      totalPrice: totalQuotePrice,
      budget: selection.budget,
      customerName: formData.customerName || undefined,
      customerPhone: formData.customerPhone || undefined,
      faultDescription: formData.faultDescription || undefined,
      faceIdStatus: selection.faceIdStatus === 'normal' || selection.faceIdStatus === 'abnormal' 
        ? selection.faceIdStatus 
        : undefined,
      notes: formData.notes || undefined,
    };

    addHistoryQuote(quote);
    setQuoteSaved(true);
    setTimeout(() => {
      setShowQuoteModal(false);
      setFormData(defaultFormData);
    }, 1000);
  };

  const handleViewQuoteDetail = (quote: HistoryQuote) => {
    setSelectedQuote(quote);
    setShowQuoteDetailModal(true);
  };

  const handleDeleteQuote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('确定要删除这条报价记录吗？')) {
      removeHistoryQuote(id);
    }
  };

  const handleConvertToWorkOrder = (quote: HistoryQuote) => {
    const inventoryItem = getInventoryByModelAndGrade(quote.modelId, quote.screenGrade);
    const available = inventoryItem ? getAvailableQuantity(quote.modelId, quote.screenGrade) : 0;

    if (available <= 0) {
      setPendingQuoteForWorkOrder(quote);
      setShowAlternativeModal(true);
      return;
    }

    const workOrder = convertQuoteToWorkOrder(quote.id);
    if (workOrder && inventoryItem) {
      reserveInventory(workOrder.id, inventoryItem.id, quote.modelId, quote.screenGrade, 1);
      setShowQuoteDetailModal(false);
      setSelectedWorkOrder(workOrder);
      setShowWorkOrderDetailModal(true);
    }
  };

  const handleSelectAlternativeGrade = (newGrade: ScreenGrade) => {
    if (!pendingQuoteForWorkOrder) return;
    
    const inventoryItem = getInventoryByModelAndGrade(pendingQuoteForWorkOrder.modelId, newGrade);
    if (!inventoryItem) return;

    const updatedQuote: HistoryQuote = {
      ...pendingQuoteForWorkOrder,
      screenGrade: newGrade,
      gradeName: gradeNames[newGrade],
      screenPrice: inventoryItem.retailPrice,
      totalPrice: inventoryItem.retailPrice + pendingQuoteForWorkOrder.laborFee,
    };

    const workOrder = addWorkOrder({
      quoteId: pendingQuoteForWorkOrder.id,
      modelId: updatedQuote.modelId,
      modelName: updatedQuote.modelName,
      screenGrade: updatedQuote.screenGrade,
      gradeName: updatedQuote.gradeName,
      screenPrice: updatedQuote.screenPrice,
      laborFee: updatedQuote.laborFee,
      totalPrice: updatedQuote.totalPrice,
      budget: updatedQuote.budget,
      customerName: updatedQuote.customerName,
      customerPhone: updatedQuote.customerPhone,
      faultDescription: updatedQuote.faultDescription,
      faceIdStatus: updatedQuote.faceIdStatus,
      status: 'quoted',
      notes: `${updatedQuote.notes || ''}。由原方案${gradeNames[pendingQuoteForWorkOrder.screenGrade]}改选${gradeNames[newGrade]}（库存不足）`.replace(/^。/, ''),
    });

    if (workOrder) {
      reserveInventory(workOrder.id, inventoryItem.id, workOrder.modelId, workOrder.screenGrade, 1);
      setShowAlternativeModal(false);
      setPendingQuoteForWorkOrder(null);
      setShowQuoteDetailModal(false);
      setSelectedWorkOrder(workOrder);
      setShowWorkOrderDetailModal(true);
    }
  };

  const handleViewWorkOrderDetail = (order: WorkOrder) => {
    setSelectedWorkOrder(order);
    setShowWorkOrderDetailModal(true);
  };

  const handleUpdateWorkOrderStatus = (orderId: string, newStatus: WorkOrderStatus, remark?: string) => {
    updateWorkOrderStatus(orderId, newStatus, remark);
    
    if (newStatus === 'cancelled') {
      const reservation = inventoryReservations.find((r) => r.workOrderId === orderId && r.status === 'reserved');
      if (reservation) {
        releaseInventory(reservation.id);
      }
    } else if (newStatus === 'delivered') {
      const reservation = inventoryReservations.find((r) => r.workOrderId === orderId && r.status === 'reserved');
      if (reservation) {
        deductInventory(reservation.id);
      }
    }
    
    if (selectedWorkOrder?.id === orderId) {
      const updatedOrder = workOrders.find((o) => o.id === orderId);
      if (updatedOrder) {
        setSelectedWorkOrder({ ...updatedOrder });
      }
    }
  };

  const filteredWorkOrders = useMemo(() => {
    let orders = workOrders;
    
    if (workOrderStatusFilter !== 'all') {
      orders = orders.filter((o) => o.status === workOrderStatusFilter);
    }
    
    if (workOrderSearchQuery.trim()) {
      const query = workOrderSearchQuery.toLowerCase();
      orders = orders.filter((o) =>
        o.modelName.toLowerCase().includes(query) ||
        o.customerName?.toLowerCase().includes(query) ||
        o.customerPhone?.includes(query) ||
        o.gradeName.toLowerCase().includes(query)
      );
    }
    
    return orders;
  }, [workOrders, workOrderStatusFilter, workOrderSearchQuery]);

  const getBudgetDiff = (price: number, budget: number) => {
    return price - budget;
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
          <div className="flex items-center space-x-2">
            <button
              onClick={handleOpenQuoteModal}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all shadow-md"
            >
              <Plus size={18} />
              <span>新建报价</span>
            </button>
            <button
              onClick={() => setShowHistoryModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-success text-white rounded-lg hover:bg-success/90 transition-all shadow-md"
            >
              <History size={18} />
              <span>历史报价</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-primary-200 p-1 shadow-sm">
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveTab('inventory')}
              className={cn(
                'flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all',
                activeTab === 'inventory'
                  ? 'bg-success text-white shadow-md'
                  : 'text-primary-600 hover:bg-primary-50'
              )}
            >
              <Package size={16} />
              <span>库存报价</span>
            </button>
            <button
              onClick={() => setActiveTab('work-orders')}
              className={cn(
                'flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all',
                activeTab === 'work-orders'
                  ? 'bg-success text-white shadow-md'
                  : 'text-primary-600 hover:bg-primary-50'
              )}
            >
              <ClipboardList size={16} />
              <span>维修工单</span>
              {workOrders.filter((o) => o.status === 'pending' || o.status === 'repairing').length > 0 && (
                <span className="px-1.5 py-0.5 text-xs rounded-full bg-red-500 text-white">
                  {workOrders.filter((o) => o.status === 'pending' || o.status === 'repairing').length}
                </span>
              )}
            </button>
          </div>
        </div>

        {selection.modelId && (
          <div className="bg-primary-50 rounded-xl border border-primary-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <AlertCircle size={20} className="text-success" />
                </div>
                <div>
                  <p className="text-sm font-medium text-primary-700">
                    当前已选择：<span className="font-bold">{getModelName(selection.modelId)}</span>
                    {selection.screenGrade && (
                      <span className="ml-2">
                        · <span className="text-success">{gradeNames[selection.screenGrade]}</span>
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-primary-500 mt-0.5">
                    点击"新建报价"可直接使用当前选择创建报价单
                  </p>
                </div>
              </div>
              <button
                onClick={handleOpenQuoteModal}
                className="px-4 py-2 bg-success text-white text-sm rounded-lg hover:bg-success/90 transition-colors"
              >
                快速报价
              </button>
            </div>
          </div>
        )}

        {activeTab === 'inventory' && (
          <>
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
                  const availableQty = getAvailableQuantity(item.modelId, item.screenGrade);
                  const reservedQty = item.quantity - availableQty;
                  const isLowStock = availableQty <= item.minStock;
                  const alternatives = isLowStock
                    ? inventoryItems
                        .filter((i) => {
                          if (i.modelId !== item.modelId || i.id === item.id) return false;
                          const iAvailable = getAvailableQuantity(i.modelId, i.screenGrade);
                          return iAvailable > i.minStock;
                        })
                        .sort((a, b) => {
                          const aAvail = getAvailableQuantity(a.modelId, a.screenGrade);
                          const bAvail = getAvailableQuantity(b.modelId, b.screenGrade);
                          return bAvail - aAvail;
                        })
                    : [];

                  return (
                    <>
                      <tr
                        key={item.id}
                        className={cn(
                          'transition-colors hover:bg-primary-50/50 cursor-pointer',
                          index % 2 === 1 && 'bg-primary-50/30',
                          isExpanded && 'bg-primary-50',
                          isLowStock && 'bg-red-50/30'
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
                          <div className="flex flex-col items-end space-y-0.5">
                            <span className={cn(
                              'font-mono font-semibold text-sm',
                              isLowStock ? 'text-red-500' : 'text-primary-700'
                            )}>
                              {availableQty.toLocaleString()}
                              <span className="text-[10px] text-primary-400 font-normal ml-1">可用</span>
                            </span>
                            {reservedQty > 0 && (
                              <span className="text-[10px] text-warning-600 font-mono">
                                (总{item.quantity.toLocaleString()} / 预占{reservedQty.toLocaleString()}
                              </span>
                            )}
                            {reservedQty === 0 && item.quantity > 0 && (
                              <span className="text-[10px] text-primary-400 font-mono">
                                总库存: {item.quantity.toLocaleString()}
                              </span>
                            )}
                            {isLowStock && (
                              <span className="text-[10px] text-red-500 block">库存不足</span>
                            )}
                          </div>
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
                              {isLowStock && alternatives.length > 0 && (
                                <div className="mb-4 p-4 bg-red-50 rounded-lg border border-red-200">
                                  <div className="flex items-start space-x-3">
                                    <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
                                    <div className="flex-1">
                                      <h4 className="text-sm font-semibold text-red-700">
                                        库存不足警告
                                      </h4>
                                      <p className="text-xs text-red-600 mt-1">
                                        当前可用库存仅 {availableQty} 件（总库存 {item.quantity} 件，已预占 {reservedQty} 件），低于安全库存 {item.minStock} 件
                                      </p>
                                      <div className="mt-3">
                                        <p className="text-xs font-medium text-primary-700 mb-2">
                                          推荐替代方案：
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                          {alternatives.map((alt) => {
                                            const altAvailable = getAvailableQuantity(alt.modelId, alt.screenGrade);
                                            const altReserved = alt.quantity - altAvailable;
                                            return (
                                              <div
                                                key={alt.id}
                                                className="flex items-center space-x-2 px-3 py-2 bg-white rounded-lg border border-primary-200"
                                              >
                                                <span className={cn(
                                                  'text-xs font-bold px-2 py-0.5 rounded',
                                                  gradeColors[alt.screenGrade]
                                                )}>
                                                  {gradeNames[alt.screenGrade]}
                                                </span>
                                                <span className="text-xs text-primary-600">
                                                  可用: <span className="font-mono text-green-600">{altAvailable}</span>
                                                  {altReserved > 0 && (
                                                    <span className="text-warning-500 ml-1">(预占{altReserved})</span>
                                                  )}
                                                </span>
                                                <span className="text-xs text-primary-700 font-mono">
                                                  ¥{alt.retailPrice}
                                                </span>
                                                <span className="text-[10px] text-primary-400">
                                                  {alt.supplier}
                                                </span>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}

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
        </>
      )}

      {activeTab === 'work-orders' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-primary-200 p-4 shadow-sm">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex bg-primary-100 rounded-lg p-1">
                {(['all', 'pending', 'quoted', 'repairing', 'delivered', 'cancelled'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setWorkOrderStatusFilter(status)}
                    className={cn(
                      'px-3 py-1.5 text-xs font-medium rounded-md transition-all',
                      workOrderStatusFilter === status
                        ? 'bg-white text-primary-800 shadow-sm'
                        : 'text-primary-500 hover:text-primary-700'
                    )}
                  >
                    {status === 'all' ? '全部' : workOrderStatusConfig[status].label}
                    {status !== 'all' && (
                      <span className="ml-1">
                        ({workOrders.filter((o) => o.status === status).length})
                      </span>
                    )}
                  </button>
                ))}
              </div>
              <div className="flex-1 min-w-[200px] relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-400" />
                <input
                  type="text"
                  placeholder="搜索工单、客户、机型..."
                  value={workOrderSearchQuery}
                  onChange={(e) => setWorkOrderSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-primary-50 border border-primary-200 rounded-lg text-sm text-primary-800 placeholder-primary-400 focus:outline-none focus:ring-2 focus:ring-success/30 focus:border-success transition-all"
                />
              </div>
            </div>
          </div>

          {filteredWorkOrders.length === 0 ? (
            <div className="bg-white rounded-xl border border-primary-200 p-12 text-center shadow-sm">
              <ClipboardList size={48} className="mx-auto text-primary-300 mb-3" />
              <p className="text-primary-500">暂无维修工单</p>
              <p className="text-xs text-primary-400 mt-1">从历史报价中可将报价单转为工单</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredWorkOrders.map((order) => {
                const statusConfig = workOrderStatusConfig[order.status];
                return (
                  <div
                    key={order.id}
                    className="bg-white rounded-xl border border-primary-200 p-4 shadow-sm hover:border-success/50 transition-colors cursor-pointer"
                    onClick={() => handleViewWorkOrderDetail(order)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-semibold text-primary-800 truncate">{order.modelName}</h4>
                          <span className={cn(
                            'text-xs font-bold px-2 py-0.5 rounded border',
                            gradeColors[order.screenGrade]
                          )}>
                            {order.gradeName}
                          </span>
                          <span className={cn(
                            'inline-flex items-center space-x-1 text-xs px-2 py-0.5 rounded border',
                            statusConfig.bgColor,
                            statusConfig.color
                          )}>
                            {statusConfig.icon}
                            <span>{statusConfig.label}</span>
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-primary-500">
                          <span className="flex items-center space-x-1">
                            <Calendar size={12} />
                            <span>{new Date(order.createdAt).toLocaleString('zh-CN')}</span>
                          </span>
                          {order.customerName && (
                            <span className="flex items-center space-x-1">
                              <User size={12} />
                              <span>{order.customerName}</span>
                            </span>
                          )}
                          {order.customerPhone && (
                            <span className="flex items-center space-x-1">
                              <Phone size={12} />
                              <span>{order.customerPhone}</span>
                            </span>
                          )}
                        </div>
                        {order.faultDescription && (
                          <p className="text-xs text-primary-600 mt-2 line-clamp-1">
                            故障：{order.faultDescription}
                          </p>
                        )}
                      </div>
                      <div className="text-right ml-4 flex-shrink-0">
                        <div className="text-xl font-bold font-mono text-success">
                          ¥{order.totalPrice.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-primary-400 mt-1">
                          屏幕 ¥{order.screenPrice?.toLocaleString() || '0'} + 人工 ¥{order.laborFee?.toLocaleString() || '0'}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
      </div>

      {showQuoteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-primary-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-primary-800 flex items-center space-x-2">
                <ClipboardList size={18} />
                <span>新建接待报价单</span>
              </h3>
              <button
                onClick={() => setShowQuoteModal(false)}
                className="p-2 rounded-lg hover:bg-primary-100 transition-colors"
              >
                <X size={18} className="text-primary-500" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              {quoteSaved ? (
                <div className="py-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                    <Check size={32} className="text-green-500" />
                  </div>
                  <h3 className="text-xl font-bold text-primary-800 mb-2">报价单已保存</h3>
                  <p className="text-primary-500">可在历史报价中查看详情</p>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-primary-700">
                        机型 <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.modelId}
                        onChange={(e) => handleFormChange('modelId', e.target.value)}
                        className="w-full px-3 py-2 bg-primary-50 border border-primary-200 rounded-lg text-sm text-primary-800 focus:outline-none focus:ring-2 focus:ring-success/30 focus:border-success transition-all"
                      >
                        <option value="">请选择机型</option>
                        {modelOptions.map((model) => (
                          <option key={model.id} value={model.id}>
                            {model.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-primary-700">
                        屏幕等级 <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.screenGrade}
                        onChange={(e) => handleFormChange('screenGrade', e.target.value)}
                        className="w-full px-3 py-2 bg-primary-50 border border-primary-200 rounded-lg text-sm text-primary-800 focus:outline-none focus:ring-2 focus:ring-success/30 focus:border-success transition-all"
                        disabled={!formData.modelId}
                      >
                        <option value="">请选择屏幕等级</option>
                        {(['original', 'refurbished', 'chinese-oled', 'lcd-replacement'] as ScreenGrade[]).map((grade) => (
                          <option key={grade} value={grade}>
                            {gradeNames[grade]}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {selectedInventoryItem && selectedInventoryItem.quantity <= selectedInventoryItem.minStock && (
                    <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                      <div className="flex items-start space-x-3">
                        <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-red-700">库存不足</p>
                          <p className="text-xs text-red-600 mt-1">
                            当前库存仅 {selectedInventoryItem.quantity} 件，建议考虑替代方案
                          </p>
                          {lowStockAlternatives.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {lowStockAlternatives.slice(0, 2).map((alt) => (
                                <button
                                  key={alt.id}
                                  onClick={() => handleFormChange('screenGrade', alt.screenGrade)}
                                  className="text-xs px-2 py-1 bg-white rounded border border-primary-200 hover:border-success hover:text-success transition-colors"
                                >
                                  更换为 {gradeNames[alt.screenGrade]} (库存{alt.quantity})
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-primary-700">
                        <User size={14} className="inline mr-1" />
                        客户姓名
                      </label>
                      <input
                        type="text"
                        value={formData.customerName}
                        onChange={(e) => handleFormChange('customerName', e.target.value)}
                        placeholder="请输入客户姓名"
                        className="w-full px-3 py-2 bg-primary-50 border border-primary-200 rounded-lg text-sm text-primary-800 focus:outline-none focus:ring-2 focus:ring-success/30 focus:border-success transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-primary-700">
                        <Phone size={14} className="inline mr-1" />
                        联系电话
                      </label>
                      <input
                        type="tel"
                        value={formData.customerPhone}
                        onChange={(e) => handleFormChange('customerPhone', e.target.value)}
                        placeholder="请输入联系电话"
                        className="w-full px-3 py-2 bg-primary-50 border border-primary-200 rounded-lg text-sm text-primary-800 focus:outline-none focus:ring-2 focus:ring-success/30 focus:border-success transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-primary-700">
                      <AlertCircle size={14} className="inline mr-1" />
                      故障描述
                    </label>
                    <textarea
                      value={formData.faultDescription}
                      onChange={(e) => handleFormChange('faultDescription', e.target.value)}
                      placeholder="请描述手机故障情况，如屏幕碎裂、显示异常、触摸失灵等"
                      rows={3}
                      className="w-full px-3 py-2 bg-primary-50 border border-primary-200 rounded-lg text-sm text-primary-800 focus:outline-none focus:ring-2 focus:ring-success/30 focus:border-success transition-all resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-primary-700">
                      <DollarSign size={14} className="inline mr-1" />
                      人工费（元）
                    </label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="number"
                        value={formData.laborFee}
                        onChange={(e) => handleFormChange('laborFee', Number(e.target.value))}
                        min="0"
                        step="10"
                        className="w-32 px-3 py-2 bg-primary-50 border border-primary-200 rounded-lg text-sm text-primary-800 focus:outline-none focus:ring-2 focus:ring-success/30 focus:border-success transition-all"
                      />
                      <div className="flex space-x-2">
                        {[50, 80, 100, 150].map((fee) => (
                          <button
                            key={fee}
                            onClick={() => handleFormChange('laborFee', fee)}
                            className={cn(
                              'px-3 py-1 text-xs rounded-lg transition-colors',
                              formData.laborFee === fee
                                ? 'bg-success text-white'
                                : 'bg-primary-100 text-primary-600 hover:bg-primary-200'
                            )}
                          >
                            ¥{fee}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-primary-700">
                      <FileText size={14} className="inline mr-1" />
                      备注
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => handleFormChange('notes', e.target.value)}
                      placeholder="其他需要记录的信息"
                      rows={2}
                      className="w-full px-3 py-2 bg-primary-50 border border-primary-200 rounded-lg text-sm text-primary-800 focus:outline-none focus:ring-2 focus:ring-success/30 focus:border-success transition-all resize-none"
                    />
                  </div>

                  <div className="bg-primary-50 rounded-lg p-4 border border-primary-200">
                    <h4 className="text-sm font-semibold text-primary-700 mb-3">报价明细</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-primary-600">屏幕配件</span>
                        <span className="font-mono text-primary-800">¥{selectedScreenPrice.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-primary-600">人工费</span>
                        <span className="font-mono text-primary-800">¥{formData.laborFee.toLocaleString()}</span>
                      </div>
                      {selection.budget > 0 && (
                        <div className="flex justify-between">
                          <span className="text-primary-600">客户预算</span>
                          <span className={cn(
                            'font-mono',
                            totalQuotePrice > selection.budget ? 'text-red-500' : 'text-success'
                          )}>
                            ¥{selection.budget.toLocaleString()}
                            {totalQuotePrice > selection.budget && (
                              <span className="ml-2 text-xs">
                                (超预算 ¥{getBudgetDiff(totalQuotePrice, selection.budget).toLocaleString()})
                              </span>
                            )}
                          </span>
                        </div>
                      )}
                      <div className="pt-2 border-t border-primary-200 flex justify-between">
                        <span className="font-semibold text-primary-800">合计</span>
                        <span className="text-xl font-bold font-mono text-success">
                          ¥{totalQuotePrice.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {selection.faceIdStatus !== 'all' && (
                    <div className={cn(
                      'p-3 rounded-lg border',
                      selection.faceIdStatus === 'abnormal' 
                        ? 'bg-warning/10 border-warning/30' 
                        : 'bg-success/10 border-success/30'
                    )}>
                      <p className={cn(
                        'text-sm font-medium',
                        selection.faceIdStatus === 'abnormal' ? 'text-warning-700' : 'text-success-700'
                      )}>
                        Face ID 状态：{selection.faceIdStatus === 'normal' ? '正常' : '异常'}
                      </p>
                      <p className="text-xs text-primary-600 mt-1">
                        {selection.faceIdStatus === 'abnormal' 
                          ? '更换屏幕时需特别注意排线保护，避免进一步损坏 Face ID 组件'
                          : '请提醒客户保护好面容识别组件，更换时注意排线操作'}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
            {!quoteSaved && (
              <div className="px-6 py-4 border-t border-primary-200 flex justify-end space-x-3">
                <button
                  onClick={() => setShowQuoteModal(false)}
                  className="px-4 py-2 bg-primary-100 text-primary-600 rounded-lg hover:bg-primary-200 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleSaveQuote}
                  disabled={!formData.modelId || !formData.screenGrade}
                  className={cn(
                    'px-6 py-2 rounded-lg transition-all flex items-center space-x-2',
                    formData.modelId && formData.screenGrade
                      ? 'bg-success text-white hover:bg-success/90 shadow-md'
                      : 'bg-primary-200 text-primary-400 cursor-not-allowed'
                  )}
                >
                  <Save size={16} />
                  <span>保存报价</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {showHistoryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden">
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
            <div className="p-4 border-b border-primary-200">
              <div className="flex items-center space-x-3">
                <div className="flex bg-primary-100 rounded-lg p-1">
                  {(['all', 'customer', 'model'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setHistorySearchType(type)}
                      className={cn(
                        'px-3 py-1 text-xs font-medium rounded-md transition-all',
                        historySearchType === type
                          ? 'bg-white text-primary-800 shadow-sm'
                          : 'text-primary-500 hover:text-primary-700'
                      )}
                    >
                      {type === 'all' ? '全部' : type === 'customer' ? '按客户' : '按机型'}
                    </button>
                  ))}
                </div>
                <div className="flex-1 relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-400" />
                  <input
                    type="text"
                    placeholder={
                      historySearchType === 'customer'
                        ? '搜索客户姓名或电话...'
                        : historySearchType === 'model'
                        ? '搜索机型名称...'
                        : '搜索客户、机型...'
                    }
                    value={historySearchQuery}
                    onChange={(e) => setHistorySearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-primary-50 border border-primary-200 rounded-lg text-sm text-primary-800 placeholder-primary-400 focus:outline-none focus:ring-2 focus:ring-success/30 focus:border-success transition-all"
                  />
                </div>
                <button
                  onClick={() => setHistorySearchQuery('')}
                  className="p-2 text-primary-400 hover:text-primary-600 transition-colors"
                >
                  <RefreshCw size={16} />
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(85vh-140px)]">
              {filteredHistoryQuotes.length === 0 ? (
                <div className="text-center py-12">
                  <History size={40} className="mx-auto text-primary-300 mb-3" />
                  <p className="text-primary-500">
                    {historySearchQuery ? '未找到匹配的报价记录' : '暂无历史报价记录'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredHistoryQuotes.map((quote) => (
                    <div
                      key={quote.id}
                      className="p-4 bg-primary-50 rounded-lg border border-primary-200 hover:border-success/50 transition-colors cursor-pointer"
                      onClick={() => handleViewQuoteDetail(quote)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-semibold text-primary-800">{quote.modelName}</h4>
                            <span className={cn(
                              'text-xs font-bold px-2 py-0.5 rounded',
                              gradeColors[quote.screenGrade]
                            )}>
                              {quote.gradeName}
                            </span>
                            {quote.faceIdStatus && (
                              <span className={cn(
                                'text-xs px-2 py-0.5 rounded',
                                quote.faceIdStatus === 'abnormal'
                                  ? 'bg-warning/10 text-warning'
                                  : 'bg-success/10 text-success'
                              )}>
                                Face ID {quote.faceIdStatus === 'normal' ? '正常' : '异常'}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-primary-500">
                            <span className="flex items-center space-x-1">
                              <Calendar size={12} />
                              <span>{new Date(quote.createdAt).toLocaleString('zh-CN')}</span>
                            </span>
                            {quote.customerName && (
                              <span className="flex items-center space-x-1">
                                <User size={12} />
                                <span>{quote.customerName}</span>
                              </span>
                            )}
                            {quote.customerPhone && (
                              <span className="flex items-center space-x-1">
                                <Phone size={12} />
                                <span>{quote.customerPhone}</span>
                              </span>
                            )}
                          </div>
                          {quote.faultDescription && (
                            <p className="text-xs text-primary-600 mt-2 line-clamp-1">
                              故障：{quote.faultDescription}
                            </p>
                          )}
                        </div>
                        <div className="text-right ml-4">
                          <div className="text-xl font-bold font-mono text-success">
                            ¥{quote.totalPrice.toLocaleString()}
                          </div>
                          <div className="text-[10px] text-primary-400 mt-1">
                            屏幕 ¥{quote.screenPrice?.toLocaleString() || '0'} + 人工 ¥{quote.laborFee?.toLocaleString() || '0'}
                          </div>
                          <div className="flex items-center justify-end space-x-1 mt-2">
                            <button
                              onClick={(e) => handleDeleteQuote(quote.id, e)}
                              className="p-1.5 text-primary-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                            <button className="p-1.5 text-primary-400 hover:text-success hover:bg-success/5 rounded transition-colors">
                              <Eye size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showQuoteDetailModal && selectedQuote && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-primary-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-primary-800 flex items-center space-x-2">
                <FileText size={18} />
                <span>报价单详情</span>
              </h3>
              <button
                onClick={() => setShowQuoteDetailModal(false)}
                className="p-2 rounded-lg hover:bg-primary-100 transition-colors"
              >
                <X size={18} className="text-primary-500" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              <div className="space-y-6">
                <div className="bg-primary-50 rounded-lg p-4 border border-primary-200">
                  <h4 className="text-sm font-semibold text-primary-700 mb-3">基本信息</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-primary-500">报价单号</span>
                      <p className="font-mono text-primary-800 mt-0.5">{selectedQuote.id}</p>
                    </div>
                    <div>
                      <span className="text-primary-500">创建时间</span>
                      <p className="text-primary-800 mt-0.5">{new Date(selectedQuote.createdAt).toLocaleString('zh-CN')}</p>
                    </div>
                    <div>
                      <span className="text-primary-500">机型</span>
                      <p className="font-medium text-primary-800 mt-0.5">{selectedQuote.modelName}</p>
                    </div>
                    <div>
                      <span className="text-primary-500">屏幕等级</span>
                      <p className="font-medium text-primary-800 mt-0.5">{selectedQuote.gradeName}</p>
                    </div>
                  </div>
                </div>

                {(selectedQuote.customerName || selectedQuote.customerPhone) && (
                  <div className="bg-white rounded-lg p-4 border border-primary-200">
                    <h4 className="text-sm font-semibold text-primary-700 mb-3">客户信息</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {selectedQuote.customerName && (
                        <div>
                          <span className="text-primary-500">客户姓名</span>
                          <p className="font-medium text-primary-800 mt-0.5">{selectedQuote.customerName}</p>
                        </div>
                      )}
                      {selectedQuote.customerPhone && (
                        <div>
                          <span className="text-primary-500">联系电话</span>
                          <p className="font-mono text-primary-800 mt-0.5">{selectedQuote.customerPhone}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {selectedQuote.faultDescription && (
                  <div className="bg-white rounded-lg p-4 border border-primary-200">
                    <h4 className="text-sm font-semibold text-primary-700 mb-2">故障描述</h4>
                    <p className="text-sm text-primary-600">{selectedQuote.faultDescription}</p>
                  </div>
                )}

                {selectedQuote.faceIdStatus && (
                  <div className={cn(
                    'rounded-lg p-4 border',
                    selectedQuote.faceIdStatus === 'abnormal'
                      ? 'bg-warning/10 border-warning/30'
                      : 'bg-success/10 border-success/30'
                  )}>
                    <h4 className={cn(
                      'text-sm font-semibold mb-2',
                      selectedQuote.faceIdStatus === 'abnormal' ? 'text-warning-700' : 'text-success-700'
                    )}>
                      Face ID 状态：{selectedQuote.faceIdStatus === 'normal' ? '正常' : '异常'}
                    </h4>
                    <p className="text-sm text-primary-600">
                      {selectedQuote.faceIdStatus === 'abnormal'
                        ? '更换屏幕时需特别注意排线保护，避免进一步损坏 Face ID 组件。建议在更换前向客户说明风险。'
                        : '请提醒客户保护好面容识别组件，更换时注意排线操作，避免损坏。'}
                    </p>
                  </div>
                )}

                <div className="bg-primary-50 rounded-lg p-4 border border-primary-200">
                  <h4 className="text-sm font-semibold text-primary-700 mb-3">费用明细</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-primary-600">屏幕配件</span>
                      <span className="font-mono text-primary-800">¥{selectedQuote.screenPrice?.toLocaleString() || '0'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-primary-600">人工费</span>
                      <span className="font-mono text-primary-800">¥{selectedQuote.laborFee?.toLocaleString() || '0'}</span>
                    </div>
                    {selectedQuote.budget > 0 && (
                      <div className="flex justify-between">
                        <span className="text-primary-600">客户预算</span>
                        <span className={cn(
                          'font-mono',
                          selectedQuote.totalPrice > selectedQuote.budget ? 'text-red-500' : 'text-success'
                        )}>
                          ¥{selectedQuote.budget.toLocaleString()}
                          {selectedQuote.totalPrice > selectedQuote.budget && (
                            <span className="ml-2 text-xs">
                              (超预算 ¥{(selectedQuote.totalPrice - selectedQuote.budget).toLocaleString()})
                            </span>
                          )}
                        </span>
                      </div>
                    )}
                    <div className="pt-2 border-t border-primary-200 flex justify-between">
                      <span className="font-semibold text-primary-800">合计</span>
                      <span className="text-2xl font-bold font-mono text-success">
                        ¥{selectedQuote.totalPrice.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {selectedQuote.notes && (
                  <div className="bg-white rounded-lg p-4 border border-primary-200">
                    <h4 className="text-sm font-semibold text-primary-700 mb-2">备注</h4>
                    <p className="text-sm text-primary-600">{selectedQuote.notes}</p>
                  </div>
                )}

                <div className="pt-4 border-t border-primary-200">
                  <button
                    onClick={() => handleConvertToWorkOrder(selectedQuote)}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-success text-white rounded-lg hover:bg-success/90 transition-all shadow-md"
                  >
                    <Wrench size={18} />
                    <span className="font-medium">转为维修工单</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAlternativeModal && pendingQuoteForWorkOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-primary-200 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-warning/10 rounded-lg">
                  <AlertCircle size={20} className="text-warning" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-primary-800">库存不足，请选择替代等级</h3>
                  <p className="text-xs text-primary-500">
                    {pendingQuoteForWorkOrder.modelName} {pendingQuoteForWorkOrder.gradeName} 无可用库存
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowAlternativeModal(false);
                  setPendingQuoteForWorkOrder(null);
                }}
                className="p-2 rounded-lg hover:bg-primary-100 transition-colors"
              >
                <X size={18} className="text-primary-500" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[70vh]">
              <div className="mb-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-xs text-yellow-700">
                  <span className="font-semibold">原报价方案：</span>
                  {pendingQuoteForWorkOrder.gradeName}
                  <span className="mx-2">·</span>
                  屏幕 ¥{pendingQuoteForWorkOrder.screenPrice?.toLocaleString() || '0'}
                  <span className="mx-2">+</span>
                  人工 ¥{pendingQuoteForWorkOrder.laborFee?.toLocaleString() || '0'}
                  <span className="mx-2">=</span>
                  <span className="font-bold">合计 ¥{pendingQuoteForWorkOrder.totalPrice.toLocaleString()}</span>
                </p>
              </div>

              <h4 className="text-sm font-semibold text-primary-700 mb-3">可选择的替代方案：</h4>
              <div className="space-y-3">
                {inventoryItems
                  .filter((item) => {
                    if (item.modelId !== pendingQuoteForWorkOrder.modelId) return false;
                    if (item.screenGrade === pendingQuoteForWorkOrder.screenGrade) return false;
                    const available = getAvailableQuantity(item.modelId, item.screenGrade);
                    return available > 0;
                  })
                  .sort((a, b) => {
                    const aAvail = getAvailableQuantity(a.modelId, a.screenGrade);
                    const bAvail = getAvailableQuantity(b.modelId, b.screenGrade);
                    return bAvail - aAvail;
                  })
                  .map((item) => {
                    const available = getAvailableQuantity(item.modelId, item.screenGrade);
                    const newTotal = item.retailPrice + (pendingQuoteForWorkOrder.laborFee || 0);
                    const priceDiff = newTotal - pendingQuoteForWorkOrder.totalPrice;
                    return (
                      <div
                        key={item.id}
                        className="p-4 border border-primary-200 rounded-lg hover:border-success hover:bg-success/5 transition-all cursor-pointer"
                        onClick={() => handleSelectAlternativeGrade(item.screenGrade)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className={cn(
                                'text-xs font-bold px-2.5 py-1 rounded border',
                                gradeColors[item.screenGrade]
                              )}>
                                {gradeNames[item.screenGrade]}
                              </span>
                              <span className="text-xs font-mono text-green-600">
                                可用库存: {available}
                              </span>
                            </div>
                            <div className="text-xs text-primary-500 space-y-0.5">
                              <p>供应商: <span className="text-primary-700">{item.supplier}</span></p>
                              <p>批次号: <span className="font-mono text-primary-700">{item.batchNumber}</span></p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold font-mono text-success">
                              ¥{newTotal.toLocaleString()}
                            </p>
                            {priceDiff !== 0 && (
                              <p className={cn(
                                'text-xs font-semibold',
                                priceDiff > 0 ? 'text-red-500' : 'text-green-600'
                              )}>
                                {priceDiff > 0 ? '+' : ''}¥{priceDiff.toLocaleString()}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-primary-100 flex items-center justify-between">
                          <div className="text-xs text-primary-500">
                            屏幕 ¥{item.retailPrice.toLocaleString()}
                            <span className="mx-1">+</span>
                            人工 ¥{pendingQuoteForWorkOrder.laborFee?.toLocaleString() || '0'}
                          </div>
                          <span className="text-xs text-success font-medium flex items-center space-x-1">
                            <span>选择此方案</span>
                            <ArrowRight size={12} />
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>

              {inventoryItems.filter((item) => {
                if (item.modelId !== pendingQuoteForWorkOrder.modelId) return false;
                if (item.screenGrade === pendingQuoteForWorkOrder.screenGrade) return false;
                const available = getAvailableQuantity(item.modelId, item.screenGrade);
                return available > 0;
              }).length === 0 && (
                <div className="text-center py-8 text-primary-400">
                  <Package size={32} className="mx-auto mb-2" />
                  <p className="text-sm">暂无其他可用库存等级</p>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-primary-200 bg-primary-50 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowAlternativeModal(false);
                  setPendingQuoteForWorkOrder(null);
                }}
                className="px-4 py-2 text-sm text-primary-600 bg-white border border-primary-200 rounded-lg hover:bg-primary-50 transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {showWorkOrderDetailModal && selectedWorkOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-primary-200 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <h3 className="text-lg font-semibold text-primary-800 flex items-center space-x-2">
                  <ClipboardList size={18} />
                  <span>工单详情</span>
                </h3>
                <span className={cn(
                  'inline-flex items-center space-x-1 text-xs px-2.5 py-1 rounded-full border',
                  workOrderStatusConfig[selectedWorkOrder.status].bgColor,
                  workOrderStatusConfig[selectedWorkOrder.status].color
                )}>
                  {workOrderStatusConfig[selectedWorkOrder.status].icon}
                  <span>{workOrderStatusConfig[selectedWorkOrder.status].label}</span>
                </span>
              </div>
              <button
                onClick={() => setShowWorkOrderDetailModal(false)}
                className="p-2 rounded-lg hover:bg-primary-100 transition-colors"
              >
                <X size={18} className="text-primary-500" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="space-y-5">
                <div className="bg-primary-50 rounded-lg p-4 border border-primary-200">
                  <h4 className="text-sm font-semibold text-primary-700 mb-3">基本信息</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-primary-500">工单号</span>
                      <p className="font-mono text-primary-800 mt-0.5">{selectedWorkOrder.id}</p>
                    </div>
                    <div>
                      <span className="text-primary-500">创建时间</span>
                      <p className="text-primary-800 mt-0.5">{new Date(selectedWorkOrder.createdAt).toLocaleString('zh-CN')}</p>
                    </div>
                    <div>
                      <span className="text-primary-500">机型</span>
                      <p className="font-medium text-primary-800 mt-0.5">{selectedWorkOrder.modelName}</p>
                    </div>
                    <div>
                      <span className="text-primary-500">屏幕等级</span>
                      <p className="font-medium text-primary-800 mt-0.5">{selectedWorkOrder.gradeName}</p>
                    </div>
                    {selectedWorkOrder.deliveredAt && (
                      <div>
                        <span className="text-primary-500">交付时间</span>
                        <p className="text-primary-800 mt-0.5">{new Date(selectedWorkOrder.deliveredAt).toLocaleString('zh-CN')}</p>
                      </div>
                    )}
                    {selectedWorkOrder.budget > 0 && (
                      <div>
                        <span className="text-primary-500">客户预算</span>
                        <p className={cn(
                          'font-mono font-semibold mt-0.5',
                          selectedWorkOrder.totalPrice > selectedWorkOrder.budget ? 'text-red-500' : 'text-success'
                        )}>
                          ¥{selectedWorkOrder.budget.toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {(selectedWorkOrder.customerName || selectedWorkOrder.customerPhone) && (
                  <div className="bg-white rounded-lg p-4 border border-primary-200">
                    <h4 className="text-sm font-semibold text-primary-700 mb-3">客户信息</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {selectedWorkOrder.customerName && (
                        <div>
                          <span className="text-primary-500">客户姓名</span>
                          <p className="font-medium text-primary-800 mt-0.5">{selectedWorkOrder.customerName}</p>
                        </div>
                      )}
                      {selectedWorkOrder.customerPhone && (
                        <div>
                          <span className="text-primary-500">联系电话</span>
                          <p className="font-mono text-primary-800 mt-0.5">{selectedWorkOrder.customerPhone}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {selectedWorkOrder.faultDescription && (
                  <div className="bg-white rounded-lg p-4 border border-primary-200">
                    <h4 className="text-sm font-semibold text-primary-700 mb-2">故障描述</h4>
                    <p className="text-sm text-primary-600">{selectedWorkOrder.faultDescription}</p>
                  </div>
                )}

                {selectedWorkOrder.faceIdStatus && (
                  <div className={cn(
                    'rounded-lg p-4 border',
                    selectedWorkOrder.faceIdStatus === 'abnormal'
                      ? 'bg-warning/10 border-warning/30'
                      : 'bg-success/10 border-success/30'
                  )}>
                    <h4 className={cn(
                      'text-sm font-semibold mb-2 flex items-center space-x-2',
                      selectedWorkOrder.faceIdStatus === 'abnormal' ? 'text-warning-700' : 'text-success-700'
                    )}>
                      <Shield size={14} />
                      <span>Face ID 状态：{selectedWorkOrder.faceIdStatus === 'normal' ? '正常' : '异常'}</span>
                    </h4>
                    <p className="text-sm text-primary-600">
                      {selectedWorkOrder.faceIdStatus === 'abnormal'
                        ? '更换屏幕时需特别注意排线保护，避免进一步损坏 Face ID 组件。建议在更换前向客户说明风险。'
                        : '请提醒客户保护好面容识别组件，更换时注意排线操作，避免损坏。'}
                    </p>
                  </div>
                )}

                <div className="bg-primary-50 rounded-lg p-4 border border-primary-200">
                  <h4 className="text-sm font-semibold text-primary-700 mb-3">费用明细</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-primary-600">屏幕配件</span>
                      <span className="font-mono text-primary-800">¥{selectedWorkOrder.screenPrice?.toLocaleString() || '0'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-primary-600">人工费</span>
                      <span className="font-mono text-primary-800">¥{selectedWorkOrder.laborFee?.toLocaleString() || '0'}</span>
                    </div>
                    {selectedWorkOrder.budget > 0 && (
                      <div className="flex justify-between">
                        <span className="text-primary-600">预算差额</span>
                        <span className={cn(
                          'font-mono',
                          selectedWorkOrder.totalPrice > selectedWorkOrder.budget ? 'text-red-500' : 'text-green-600'
                        )}>
                          {selectedWorkOrder.totalPrice > selectedWorkOrder.budget ? '超' : '省'} ¥{Math.abs(selectedWorkOrder.totalPrice - selectedWorkOrder.budget).toLocaleString()}
                        </span>
                      </div>
                    )}
                    <div className="pt-2 border-t border-primary-200 flex justify-between">
                      <span className="font-semibold text-primary-800">合计</span>
                      <span className="text-2xl font-bold font-mono text-success">
                        ¥{selectedWorkOrder.totalPrice.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {selectedWorkOrder.notes && (
                  <div className="bg-white rounded-lg p-4 border border-primary-200">
                    <h4 className="text-sm font-semibold text-primary-700 mb-2">备注</h4>
                    <p className="text-sm text-primary-600">{selectedWorkOrder.notes}</p>
                  </div>
                )}

                {selectedWorkOrder.statusHistory.length > 0 && (
                  <div className="bg-white rounded-lg p-4 border border-primary-200">
                    <h4 className="text-sm font-semibold text-primary-700 mb-3">状态流转</h4>
                    <div className="space-y-3">
                      {selectedWorkOrder.statusHistory.map((item, idx) => (
                        <div key={idx} className="flex items-start space-x-3">
                          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center">
                            {workOrderStatusConfig[item.status].icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className={cn('text-sm font-medium', workOrderStatusConfig[item.status].color)}>
                                {workOrderStatusConfig[item.status].label}
                              </span>
                              <span className="text-xs text-primary-400">
                                {new Date(item.timestamp).toLocaleString('zh-CN')}
                              </span>
                            </div>
                            {item.remark && (
                              <p className="text-xs text-primary-500 mt-1">{item.remark}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-primary-200">
                  <div className="flex flex-wrap gap-2">
                    {selectedWorkOrder.status === 'quoted' && (
                      <button
                        onClick={() => handleUpdateWorkOrderStatus(selectedWorkOrder.id, 'repairing', '开始维修')}
                        className="flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-all"
                      >
                        <Wrench size={16} />
                        <span>开始维修</span>
                      </button>
                    )}
                    {selectedWorkOrder.status === 'pending' && (
                      <button
                        onClick={() => handleUpdateWorkOrderStatus(selectedWorkOrder.id, 'quoted', '检测完成，已报价')}
                        className="flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-all"
                      >
                        <DollarSign size={16} />
                        <span>已报价</span>
                      </button>
                    )}
                    {selectedWorkOrder.status === 'repairing' && (
                      <button
                        onClick={() => handleUpdateWorkOrderStatus(selectedWorkOrder.id, 'delivered', '维修完成，已交付')}
                        className="flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 bg-success text-white rounded-lg hover:bg-success/90 transition-all"
                      >
                        <CheckCircle size={16} />
                        <span>完成交付</span>
                      </button>
                    )}
                    {(selectedWorkOrder.status === 'pending' || selectedWorkOrder.status === 'quoted') && (
                      <button
                        onClick={() => {
                          if (confirm('确定要取消这个工单吗？')) {
                            handleUpdateWorkOrderStatus(selectedWorkOrder.id, 'cancelled', '客户取消');
                          }
                        }}
                        className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-all"
                      >
                        <XCircle size={16} />
                        <span>取消工单</span>
                      </button>
                    )}
                    {(selectedWorkOrder.status === 'cancelled' || selectedWorkOrder.status === 'delivered') && (
                      <button
                        onClick={() => setShowWorkOrderDetailModal(false)}
                        className="flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 bg-primary-100 text-primary-600 rounded-lg hover:bg-primary-200 transition-all"
                      >
                        <ArrowRight size={16} />
                        <span>关闭</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
