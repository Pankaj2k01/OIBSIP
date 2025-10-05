import { API_BASE_URL } from './api';

// Admin Dashboard Types
export interface DashboardOverview {
  overview: {
    totalUsers: number;
    totalOrders: number;
    todaysOrders: number;
    totalRevenue: number;
    todaysRevenue: number;
    averageOrderValue: number;
  };
  orderStatusDistribution: Array<{
    _id: string;
    count: number;
  }>;
  lowStockItems: Array<{
    _id: string;
    name: string;
    stock: number;
    threshold: number;
    category: string;
    type: string;
  }>;
  recentOrders: Array<{
    _id: string;
    orderId: string;
    status: string;
    totalAmount: number;
    createdAt: string;
    userId: {
      name: string;
      email: string;
    };
  }>;
}

export interface InventoryItem {
  _id: string;
  name: string;
  stock: number;
  threshold: number;
  category: string;
  price: number;
  isAvailable: boolean;
  type: string;
}

export interface InventoryOverview {
  inventory: {
    bases: InventoryItem[];
    sauces: InventoryItem[];
    cheeses: InventoryItem[];
    veggies: InventoryItem[];
    meats: InventoryItem[];
  };
  statistics: {
    totalItems: number;
    lowStockItems: number;
    outOfStockItems: number;
    availableItems: number;
  };
}

export interface Order {
  _id: string;
  orderId: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
  createdAt: string;
  userId: {
    name: string;
    email: string;
    phone?: string;
  };
  items: Array<{
    pizza: {
      selectedIngredients: any;
      customizations: any;
    };
    quantity: number;
    price: number;
  }>;
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  tracking: Array<{
    status: string;
    message: string;
    timestamp: string;
  }>;
}

export interface SalesAnalytics {
  salesByDay: Array<{
    _id: string;
    revenue: number;
    orders: number;
  }>;
  popularIngredients: Array<{
    _id: string;
    count: number;
  }>;
  statusBreakdown: Array<{
    _id: string;
    count: number;
  }>;
  period: string;
}

export interface InventoryMonitorStatus {
  isMonitoring: boolean;
  lastCheck: string | null;
  checkInterval: string;
  nextCheck: string;
}

// Admin API Functions
class AdminAPI {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${API_BASE_URL}/admin`;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const url = `${this.baseUrl}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.message || `Request failed with status ${response.status}`
        );
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error(`Admin API Error (${endpoint}):`, error);
      throw error;
    }
  }

  // Dashboard Methods
  async getDashboardOverview(): Promise<DashboardOverview> {
    return this.makeRequest<DashboardOverview>('/dashboard');
  }

  async getSalesAnalytics(period: '7d' | '30d' | '90d' = '30d'): Promise<SalesAnalytics> {
    return this.makeRequest<SalesAnalytics>(`/analytics?period=${period}`);
  }

  // Inventory Methods
  async getInventoryOverview(): Promise<InventoryOverview> {
    return this.makeRequest<InventoryOverview>('/inventory');
  }

  async updateInventoryItem(
    type: string,
    id: string,
    updates: {
      stock?: number;
      threshold?: number;
      price?: number;
      isAvailable?: boolean;
    }
  ): Promise<InventoryItem> {
    return this.makeRequest<InventoryItem>(`/inventory/${type}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async getInventoryMonitorStatus(): Promise<InventoryMonitorStatus> {
    return this.makeRequest<InventoryMonitorStatus>('/inventory/monitor/status');
  }

  async triggerInventoryCheck(): Promise<any> {
    return this.makeRequest<any>('/inventory/monitor/check', {
      method: 'POST',
    });
  }

  // Order Management Methods
  async getAllOrders(params: {
    page?: number;
    limit?: number;
    status?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}): Promise<{
    orders: Order[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalOrders: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  }> {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });

    const queryString = queryParams.toString();
    const endpoint = `/orders${queryString ? `?${queryString}` : ''}`;
    
    return this.makeRequest(endpoint);
  }

  async updateOrderStatus(
    orderId: string,
    status: string,
    notes?: string
  ): Promise<Order> {
    return this.makeRequest<Order>(`/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, notes }),
    });
  }

  // Utility Methods
  async exportReport(type: 'sales' | 'inventory', format: 'csv' | 'pdf' = 'csv'): Promise<Blob> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${this.baseUrl}/reports/export`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ type, format }),
    });

    if (!response.ok) {
      throw new Error('Failed to export report');
    }

    return response.blob();
  }
}

// Create singleton instance
export const adminAPI = new AdminAPI();

// Export utility functions for formatting
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount);
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatOrderStatus = (status: string): string => {
  return status
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const getStatusColor = (status: string): string => {
  const statusColors: Record<string, string> = {
    pending: 'warning',
    confirmed: 'info',
    preparing: 'primary',
    baking: 'primary',
    ready: 'success',
    'out-for-delivery': 'info',
    delivered: 'success',
    cancelled: 'danger',
  };
  
  return statusColors[status] || 'secondary';
};