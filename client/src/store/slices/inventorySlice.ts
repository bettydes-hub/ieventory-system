import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Item, Category, Store, Supplier } from '@/types';

interface InventoryState {
  items: Item[];
  categories: Category[];
  stores: Store[];
  suppliers: Supplier[];
  selectedItem: Item | null;
  loading: boolean;
  error: string | null;
  filters: {
    search: string;
    categoryId: string | null;
    storeId: string | null;
    status: string | null;
  };
}

const initialState: InventoryState = {
  items: [],
  categories: [],
  stores: [],
  suppliers: [],
  selectedItem: null,
  loading: false,
  error: null,
  filters: {
    search: '',
    categoryId: null,
    storeId: null,
    status: null,
  },
};

const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    setItems: (state, action: PayloadAction<Item[]>) => {
      state.items = action.payload;
    },
    addItem: (state, action: PayloadAction<Item>) => {
      state.items.push(action.payload);
    },
    updateItem: (state, action: PayloadAction<Item>) => {
      const index = state.items.findIndex(item => item.itemId === action.payload.itemId);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
    removeItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.itemId !== action.payload);
    },
    setCategories: (state, action: PayloadAction<Category[]>) => {
      state.categories = action.payload;
    },
    addCategory: (state, action: PayloadAction<Category>) => {
      state.categories.push(action.payload);
    },
    updateCategory: (state, action: PayloadAction<Category>) => {
      const index = state.categories.findIndex(cat => cat.categoryId === action.payload.categoryId);
      if (index !== -1) {
        state.categories[index] = action.payload;
      }
    },
    removeCategory: (state, action: PayloadAction<string>) => {
      state.categories = state.categories.filter(cat => cat.categoryId !== action.payload);
    },
    setStores: (state, action: PayloadAction<Store[]>) => {
      state.stores = action.payload;
    },
    addStore: (state, action: PayloadAction<Store>) => {
      state.stores.push(action.payload);
    },
    updateStore: (state, action: PayloadAction<Store>) => {
      const index = state.stores.findIndex(store => store.storeId === action.payload.storeId);
      if (index !== -1) {
        state.stores[index] = action.payload;
      }
    },
    removeStore: (state, action: PayloadAction<string>) => {
      state.stores = state.stores.filter(store => store.storeId !== action.payload);
    },
    setSuppliers: (state, action: PayloadAction<Supplier[]>) => {
      state.suppliers = action.payload;
    },
    addSupplier: (state, action: PayloadAction<Supplier>) => {
      state.suppliers.push(action.payload);
    },
    updateSupplier: (state, action: PayloadAction<Supplier>) => {
      const index = state.suppliers.findIndex(supplier => supplier.supplierId === action.payload.supplierId);
      if (index !== -1) {
        state.suppliers[index] = action.payload;
      }
    },
    removeSupplier: (state, action: PayloadAction<string>) => {
      state.suppliers = state.suppliers.filter(supplier => supplier.supplierId !== action.payload);
    },
    setSelectedItem: (state, action: PayloadAction<Item | null>) => {
      state.selectedItem = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setFilters: (state, action: PayloadAction<Partial<InventoryState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        search: '',
        categoryId: null,
        storeId: null,
        status: null,
      };
    },
  },
});

export const {
  setItems,
  addItem,
  updateItem,
  removeItem,
  setCategories,
  addCategory,
  updateCategory,
  removeCategory,
  setStores,
  addStore,
  updateStore,
  removeStore,
  setSuppliers,
  addSupplier,
  updateSupplier,
  removeSupplier,
  setSelectedItem,
  setLoading,
  setError,
  setFilters,
  clearFilters,
} = inventorySlice.actions;

export default inventorySlice.reducer;
