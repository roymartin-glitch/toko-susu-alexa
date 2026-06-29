'use client'

import { useCallback, useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { productsApi, customersApi, transactionsApi, settingsApi } from './supabase'
import { getErrorMessage } from './utils'

// ============================================
// PRODUCTS HOOKS
// ============================================
export const useProducts = () => {
  const queryClient = useQueryClient()
  
  // Setup realtime subscription
  useEffect(() => {
    const { supabase } = require('./supabase')
    
    const channel = supabase
      .channel('products-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'products' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['products'] })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [queryClient])

  return useQuery({
    queryKey: ['products'],
    queryFn: () => productsApi.getAll(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 10000, // Refetch every 10 seconds
  })
}

export const useProduct = (id) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => productsApi.getById(id),
    enabled: !!id,
  })
}

export const useCreateProduct = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (product) => productsApi.create(product),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Produk berhasil ditambahkan')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })
}

export const useUpdateProduct = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, updates }) => productsApi.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Produk berhasil diperbarui')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })
}

export const useDeleteProduct = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => productsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Produk berhasil dihapus')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })
}

export const useUpdateProductStock = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, newStock }) => productsApi.updateStock(id, newStock),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })
}

// ============================================
// CUSTOMERS HOOKS
// ============================================
export const useCustomers = () => {
  const queryClient = useQueryClient()
  
  // Setup realtime subscription
  useEffect(() => {
    const { supabase } = require('./supabase')
    
    const channel = supabase
      .channel('customers-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'customers' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['customers'] })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [queryClient])

  return useQuery({
    queryKey: ['customers'],
    queryFn: () => customersApi.getAll(),
    staleTime: 1000 * 60 * 5,
    refetchInterval: 10000, // Refetch every 10 seconds
  })
}

export const useCustomer = (id) => {
  return useQuery({
    queryKey: ['customer', id],
    queryFn: () => customersApi.getById(id),
    enabled: !!id,
  })
}

export const useCreateCustomer = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (customer) => customersApi.create(customer),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      toast.success('Pelanggan berhasil ditambahkan')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })
}

export const useUpdateCustomer = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, updates }) => customersApi.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      toast.success('Pelanggan berhasil diperbarui')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })
}

export const useDeleteCustomer = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => customersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      toast.success('Pelanggan berhasil dihapus')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })
}

// ============================================
// TRANSACTIONS HOOKS
// ============================================
export const useTransactions = () => {
  const queryClient = useQueryClient()
  
  // Setup realtime subscription
  useEffect(() => {
    const { supabase } = require('./supabase')
    
    const channel = supabase
      .channel('transactions-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'transactions' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['transactions'] })
          queryClient.invalidateQueries({ queryKey: ['todayTotal'] })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [queryClient])

  return useQuery({
    queryKey: ['transactions'],
    queryFn: () => transactionsApi.getAll(),
    staleTime: 1000 * 60 * 2,
    refetchInterval: 5000, // Refetch every 5 seconds
  })
}

export const useTransaction = (id) => {
  return useQuery({
    queryKey: ['transaction', id],
    queryFn: () => transactionsApi.getById(id),
    enabled: !!id,
  })
}

export const useCreateTransaction = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (transaction) => transactionsApi.create(transaction),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Transaksi berhasil disimpan')
    },
    onError: (error) => {
      const errorMessage = getErrorMessage(error)
      console.error('❌ Transaction mutation error:', errorMessage)
      
      // Show user-friendly error
      if (errorMessage.includes('login') || errorMessage.includes('sesi')) {
        toast.error(errorMessage, {
          duration: 5000,
          action: {
            label: 'Login Ulang',
            onClick: () => {
              window.location.href = '/login'
            }
          }
        })
      } else {
        toast.error(errorMessage)
      }
    },
  })
}

export const useTodayTransactionTotal = () => {
  return useQuery({
    queryKey: ['todayTotal'],
    queryFn: () => transactionsApi.getTodayTotal(),
    staleTime: 1000 * 60,
  })
}

// ============================================
// SETTINGS HOOKS
// ============================================
export const useSettings = (userId) => {
  return useQuery({
    queryKey: ['settings', userId],
    queryFn: () => settingsApi.get(userId),
    enabled: !!userId,
  })
}

export const useUpdateSettings = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, settings }) => settingsApi.upsert(userId, settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] })
      toast.success('Pengaturan berhasil disimpan')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })
}

// ============================================
// CATEGORIES HOOKS
// ============================================
export const useCategories = () => {
  const queryClient = useQueryClient()
  
  // Setup realtime subscription
  useEffect(() => {
    const { supabase } = require('./supabase')
    
    const channel = supabase
      .channel('categories-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'categories' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['categories'] })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [queryClient])

  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { categoriesApi } = require('./supabase')
      return await categoriesApi.getAll()
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
    refetchOnMount: true,
  })
}

export const useCreateCategory = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (category) => {
      const { categoriesApi } = require('./supabase')
      return categoriesApi.create(category)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      toast.success('Kategori berhasil ditambahkan')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })
}

export const useDeleteCategory = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id) => {
      const { categoriesApi } = require('./supabase')
      return categoriesApi.delete(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      toast.success('Kategori berhasil dihapus')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })
}


// ============================================
// LOCAL STORAGE HOOKS
// ============================================
export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(initialValue)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key)
      if (item) {
        setStoredValue(JSON.parse(item))
      }
    } catch (error) {
      console.error('Error reading from localStorage:', error)
    }
    setIsLoaded(true)
  }, [key])

  const setValue = useCallback(
    (value) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value
        setStoredValue(valueToStore)
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      } catch (error) {
        console.error('Error writing to localStorage:', error)
      }
    },
    [key, storedValue]
  )

  return [storedValue, setValue, isLoaded]
}

// ============================================
// DEBOUNCE HOOK
// ============================================
export const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => clearTimeout(handler)
  }, [value, delay])

  return debouncedValue
}

// ============================================
// PREVIOUS VALUE HOOK
// ============================================
export const usePrevious = (value) => {
  const ref = useState()

  useEffect(() => {
    ref.current = value
  }, [value])

  return ref.current
}

// ============================================
// ASYNC HOOK
// ============================================
export const useAsync = (asyncFunction, immediate = true) => {
  const [status, setStatus] = useState('idle')
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  const execute = useCallback(async () => {
    setStatus('pending')
    setData(null)
    setError(null)
    try {
      const response = await asyncFunction()
      setData(response)
      setStatus('success')
      return response
    } catch (err) {
      setError(err)
      setStatus('error')
    }
  }, [asyncFunction])

  useEffect(() => {
    if (immediate) {
      execute()
    }
  }, [execute, immediate])

  return { execute, status, data, error }
}

// ============================================
// FETCH HOOK
// ============================================
export const useFetch = (url, options = {}) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(url, options)
        if (!response.ok) throw new Error('API request failed')
        const result = await response.json()
        setData(result)
      } catch (err) {
        setError(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [url, options])

  return { data, loading, error }
}
