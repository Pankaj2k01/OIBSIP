// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  role: 'user' | 'admin';
  isEmailVerified: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    token: string;
    user: User;
  };
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any[];
}

// Auth Context Type
export interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

// Pizza Types (to be expanded later)
export interface PizzaBase {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  stock: number;
}

export interface PizzaSauce {
  id: string;
  name: string;
  price: number;
  description: string;
  stock: number;
}

export interface PizzaCheese {
  id: string;
  name: string;
  price: number;
  description: string;
  stock: number;
}

export interface PizzaVeggie {
  id: string;
  name: string;
  price: number;
  description: string;
  stock: number;
}

export interface PizzaMeat {
  id: string;
  name: string;
  price: number;
  description: string;
  stock: number;
}

// Pizza Customization
export interface CustomPizza {
  base: PizzaBase;
  sauce: PizzaSauce;
  cheese: PizzaCheese;
  veggies: PizzaVeggie[];
  meats: PizzaMeat[];
  totalPrice: number;
}

// Order Types
export interface Order {
  id: string;
  userId: string;
  items: CustomPizza[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'baking' | 'ready' | 'delivered';
  paymentId: string;
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Form Types
export interface ForgotPasswordForm {
  email: string;
}

export interface ResetPasswordForm {
  password: string;
  confirmPassword: string;
}