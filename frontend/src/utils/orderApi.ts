import { API_BASE_URL } from './api';

// Order Status Types
export type OrderStatus = 
  | 'pending'
  | 'confirmed' 
  | 'preparing'
  | 'baking'
  | 'ready'
  | 'out-for-delivery'
  | 'delivered'
  | 'cancelled';

// Order Tracking Interfaces
export interface OrderTrackingStep {
  status: OrderStatus;
  message: string;
  timestamp: string;
  isCompleted: boolean;
  isActive: boolean;
}

export interface DeliveryAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  landmark?: string;
}

export interface OrderItem {
  _id: string;
  pizza: {
    selectedIngredients: {
      bases: Array<{ name: string; price: number }>;
      sauces: Array<{ name: string; price: number }>;
      cheeses: Array<{ name: string; price: number }>;
      veggies: Array<{ name: string; price: number }>;
      meats: Array<{ name: string; price: number }>;
    };
    customizations: {
      size: string;
      crustType: string;
    };
  };
  quantity: number;
  price: number;
  totalPrice: number;
}

export interface UserOrder {
  _id: string;
  orderId: string;
  status: OrderStatus;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  totalAmount: number;
  items: OrderItem[];
  deliveryAddress: DeliveryAddress;
  createdAt: string;
  updatedAt: string;
  estimatedDeliveryTime?: string;
  actualDeliveryTime?: string;
  tracking: Array<{
    status: OrderStatus;
    message: string;
    timestamp: string;
  }>;
  deliveryInstructions?: string;
}

export interface OrderSummary {
  _id: string;
  orderId: string;
  status: OrderStatus;
  totalAmount: number;
  createdAt: string;
  itemsCount: number;
}

// Order API Class
class OrderAPI {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
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
      return data.success ? data.data : data;
    } catch (error) {
      console.error(`Order API Error (${endpoint}):`, error);
      throw error;
    }
  }

  // Get user's orders with pagination
  async getUserOrders(params: {
    page?: number;
    limit?: number;
    status?: OrderStatus;
  } = {}): Promise<{
    orders: OrderSummary[];
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
    const endpoint = `/orders/user${queryString ? `?${queryString}` : ''}`;
    
    return this.makeRequest(endpoint);
  }

  // Get specific order details
  async getOrderDetails(orderId: string): Promise<UserOrder> {
    return this.makeRequest<UserOrder>(`/orders/${orderId}`);
  }

  // Track order status
  async trackOrder(orderId: string): Promise<{
    order: UserOrder;
    trackingSteps: OrderTrackingStep[];
    estimatedDelivery: string;
    currentStep: number;
  }> {
    const order = await this.getOrderDetails(orderId);
    const trackingSteps = this.generateTrackingSteps(order);
    
    return {
      order,
      trackingSteps,
      estimatedDelivery: order.estimatedDeliveryTime || this.calculateEstimatedDelivery(order),
      currentStep: this.getCurrentStepIndex(order.status)
    };
  }

  // Cancel order (if allowed)
  async cancelOrder(orderId: string, reason?: string): Promise<UserOrder> {
    return this.makeRequest<UserOrder>(`/orders/${orderId}/cancel`, {
      method: 'PUT',
      body: JSON.stringify({ reason }),
    });
  }

  // Request refund
  async requestRefund(orderId: string, reason: string): Promise<{
    success: boolean;
    message: string;
  }> {
    return this.makeRequest(`/orders/${orderId}/refund`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  // Rate order
  async rateOrder(orderId: string, rating: number, review?: string): Promise<{
    success: boolean;
    message: string;
  }> {
    return this.makeRequest(`/orders/${orderId}/rate`, {
      method: 'POST',
      body: JSON.stringify({ rating, review }),
    });
  }

  // Generate tracking steps based on order status
  private generateTrackingSteps(order: UserOrder): OrderTrackingStep[] {
    const statusFlow: OrderStatus[] = [
      'pending',
      'confirmed',
      'preparing',
      'baking',
      'ready',
      'out-for-delivery',
      'delivered'
    ];

    const currentStatusIndex = statusFlow.indexOf(order.status);
    const isCancelled = order.status === 'cancelled';

    return statusFlow.map((status, index) => {
      const trackingEntry = order.tracking.find(t => t.status === status);
      const isCompleted = !isCancelled && index <= currentStatusIndex;
      const isActive = !isCancelled && index === currentStatusIndex;

      return {
        status,
        message: trackingEntry?.message || this.getDefaultStatusMessage(status),
        timestamp: trackingEntry?.timestamp || '',
        isCompleted,
        isActive,
      };
    });
  }

  // Get default status messages
  private getDefaultStatusMessage(status: OrderStatus): string {
    const messages: Record<OrderStatus, string> = {
      pending: 'Order placed successfully. Waiting for confirmation.',
      confirmed: 'Order confirmed! Your delicious pizza is being prepared.',
      preparing: 'Our chefs are preparing your pizza with fresh ingredients.',
      baking: 'Your pizza is baking in our wood-fired oven.',
      ready: 'Pizza is ready for pickup/delivery!',
      'out-for-delivery': 'Your order is on the way! Delivery partner assigned.',
      delivered: 'Order delivered successfully. Enjoy your meal!',
      cancelled: 'Order has been cancelled.',
    };

    return messages[status] || 'Status update';
  }

  // Get current step index
  private getCurrentStepIndex(status: OrderStatus): number {
    const statusFlow: OrderStatus[] = [
      'pending',
      'confirmed',
      'preparing',
      'baking',
      'ready',
      'out-for-delivery',
      'delivered'
    ];

    return statusFlow.indexOf(status);
  }

  // Calculate estimated delivery time
  private calculateEstimatedDelivery(order: UserOrder): string {
    const orderTime = new Date(order.createdAt);
    const estimatedMinutes = this.getEstimatedMinutes(order.status);
    
    const estimatedTime = new Date(orderTime.getTime() + estimatedMinutes * 60000);
    return estimatedTime.toISOString();
  }

  // Get estimated minutes based on status
  private getEstimatedMinutes(status: OrderStatus): number {
    const estimates: Record<OrderStatus, number> = {
      pending: 5,
      confirmed: 15,
      preparing: 25,
      baking: 35,
      ready: 45,
      'out-for-delivery': 60,
      delivered: 0,
      cancelled: 0,
    };

    return estimates[status] || 45;
  }
}

// Create singleton instance
export const orderAPI = new OrderAPI();

// Utility functions for order display
export const formatOrderStatus = (status: OrderStatus): string => {
  const statusMap: Record<OrderStatus, string> = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    preparing: 'Preparing',
    baking: 'Baking',
    ready: 'Ready',
    'out-for-delivery': 'Out for Delivery',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
  };

  return statusMap[status] || status;
};

export const getOrderStatusColor = (status: OrderStatus): string => {
  const colorMap: Record<OrderStatus, string> = {
    pending: 'warning',
    confirmed: 'info',
    preparing: 'primary',
    baking: 'primary',
    ready: 'success',
    'out-for-delivery': 'info',
    delivered: 'success',
    cancelled: 'danger',
  };

  return colorMap[status] || 'secondary';
};

export const getOrderStatusIcon = (status: OrderStatus): string => {
  const iconMap: Record<OrderStatus, string> = {
    pending: 'clock',
    confirmed: 'check-circle',
    preparing: 'tools',
    baking: 'fire',
    ready: 'check-circle-fill',
    'out-for-delivery': 'truck',
    delivered: 'house-check',
    cancelled: 'x-circle',
  };

  return iconMap[status] || 'circle';
};

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

export const formatRelativeTime = (dateString: string): string => {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  
  return formatDate(dateString);
};

export const canCancelOrder = (status: OrderStatus): boolean => {
  return ['pending', 'confirmed'].includes(status);
};

export const canRateOrder = (status: OrderStatus): boolean => {
  return status === 'delivered';
};