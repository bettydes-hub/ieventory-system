import { useQuery, useMutation, useQueryClient } from 'react-query';
import { inventoryService } from '@/services/inventoryService';
import { CreateItemData, UpdateItemData } from '@/types';

export const useInventory = () => {
  const queryClient = useQueryClient();

  // Items
  const {
    data: items,
    isLoading: itemsLoading,
    error: itemsError,
    refetch: refetchItems,
  } = useQuery('items', () => inventoryService.getItems());

  const {
    data: inventorySummary,
    isLoading: summaryLoading,
    error: summaryError,
  } = useQuery('inventory-summary', () => inventoryService.getInventorySummary());

  const {
    data: lowStockAlerts,
    isLoading: alertsLoading,
    error: alertsError,
  } = useQuery('low-stock-alerts', () => inventoryService.getLowStockAlerts());

  const createItemMutation = useMutation(inventoryService.createItem, {
    onSuccess: () => {
      queryClient.invalidateQueries('items');
      queryClient.invalidateQueries('inventory-summary');
    },
  });

  const updateItemMutation = useMutation(
    ({ id, data }: { id: string; data: UpdateItemData }) =>
      inventoryService.updateItem(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('items');
        queryClient.invalidateQueries('inventory-summary');
      },
    }
  );

  const deleteItemMutation = useMutation(inventoryService.deleteItem, {
    onSuccess: () => {
      queryClient.invalidateQueries('items');
      queryClient.invalidateQueries('inventory-summary');
    },
  });

  const transferItemMutation = useMutation(inventoryService.transferItem, {
    onSuccess: () => {
      queryClient.invalidateQueries('items');
      queryClient.invalidateQueries('inventory-summary');
    },
  });

  // Categories
  const {
    data: categories,
    isLoading: categoriesLoading,
    error: categoriesError,
    refetch: refetchCategories,
  } = useQuery('categories', () => inventoryService.getCategories());

  const createCategoryMutation = useMutation(inventoryService.createCategory, {
    onSuccess: () => {
      queryClient.invalidateQueries('categories');
    },
  });

  const updateCategoryMutation = useMutation(
    ({ id, data }: { id: string; data: any }) =>
      inventoryService.updateCategory(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('categories');
      },
    }
  );

  const deleteCategoryMutation = useMutation(inventoryService.deleteCategory, {
    onSuccess: () => {
      queryClient.invalidateQueries('categories');
    },
  });

  // Stores
  const {
    data: stores,
    isLoading: storesLoading,
    error: storesError,
    refetch: refetchStores,
  } = useQuery('stores', () => inventoryService.getStores());

  const createStoreMutation = useMutation(inventoryService.createStore, {
    onSuccess: () => {
      queryClient.invalidateQueries('stores');
    },
  });

  const updateStoreMutation = useMutation(
    ({ id, data }: { id: string; data: any }) =>
      inventoryService.updateStore(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('stores');
      },
    }
  );

  const deleteStoreMutation = useMutation(inventoryService.deleteStore, {
    onSuccess: () => {
      queryClient.invalidateQueries('stores');
    },
  });

  // Suppliers
  const {
    data: suppliers,
    isLoading: suppliersLoading,
    error: suppliersError,
    refetch: refetchSuppliers,
  } = useQuery('suppliers', () => inventoryService.getSuppliers());

  const createSupplierMutation = useMutation(inventoryService.createSupplier, {
    onSuccess: () => {
      queryClient.invalidateQueries('suppliers');
    },
  });

  const updateSupplierMutation = useMutation(
    ({ id, data }: { id: string; data: any }) =>
      inventoryService.updateSupplier(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('suppliers');
      },
    }
  );

  const deleteSupplierMutation = useMutation(inventoryService.deleteSupplier, {
    onSuccess: () => {
      queryClient.invalidateQueries('suppliers');
    },
  });

  return {
    // Items
    items: items?.data || [],
    itemsLoading,
    itemsError,
    refetchItems,
    createItem: createItemMutation.mutateAsync,
    updateItem: updateItemMutation.mutateAsync,
    deleteItem: deleteItemMutation.mutateAsync,
    transferItem: transferItemMutation.mutateAsync,
    isCreatingItem: createItemMutation.isLoading,
    isUpdatingItem: updateItemMutation.isLoading,
    isDeletingItem: deleteItemMutation.isLoading,
    isTransferringItem: transferItemMutation.isLoading,

    // Summary
    inventorySummary,
    summaryLoading,
    summaryError,
    lowStockAlerts,
    alertsLoading,
    alertsError,

    // Categories
    categories,
    categoriesLoading,
    categoriesError,
    refetchCategories,
    createCategory: createCategoryMutation.mutateAsync,
    updateCategory: updateCategoryMutation.mutateAsync,
    deleteCategory: deleteCategoryMutation.mutateAsync,
    isCreatingCategory: createCategoryMutation.isLoading,
    isUpdatingCategory: updateCategoryMutation.isLoading,
    isDeletingCategory: deleteCategoryMutation.isLoading,

    // Stores
    stores,
    storesLoading,
    storesError,
    refetchStores,
    createStore: createStoreMutation.mutateAsync,
    updateStore: updateStoreMutation.mutateAsync,
    deleteStore: deleteStoreMutation.mutateAsync,
    isCreatingStore: createStoreMutation.isLoading,
    isUpdatingStore: updateStoreMutation.isLoading,
    isDeletingStore: deleteStoreMutation.isLoading,

    // Suppliers
    suppliers,
    suppliersLoading,
    suppliersError,
    refetchSuppliers,
    createSupplier: createSupplierMutation.mutateAsync,
    updateSupplier: updateSupplierMutation.mutateAsync,
    deleteSupplier: deleteSupplierMutation.mutateAsync,
    isCreatingSupplier: createSupplierMutation.isLoading,
    isUpdatingSupplier: updateSupplierMutation.isLoading,
    isDeletingSupplier: deleteSupplierMutation.isLoading,
  };
};
