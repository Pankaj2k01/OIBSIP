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

// Pizza Ingredient Types
export interface PizzaBase {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  stock: number;
  threshold: number;
  isActive: boolean;
  nutritionalInfo?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PizzaSauce {
  _id: string;
  name: string;
  description: string;
  price: number;
  spiceLevel: 'Mild' | 'Medium' | 'Hot' | 'Extra Hot';
  stock: number;
  threshold: number;
  isActive: boolean;
  ingredients: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PizzaCheese {
  _id: string;
  name: string;
  description: string;
  price: number;
  type: 'Fresh' | 'Aged' | 'Processed' | 'Organic';
  stock: number;
  threshold: number;
  isActive: boolean;
  origin?: string;
  nutritionalInfo?: {
    calories: number;
    protein: number;
    fat: number;
    calcium: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PizzaVeggie {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: 'Leafy Greens' | 'Root Vegetables' | 'Peppers' | 'Onions' | 'Mushrooms' | 'Tomatoes' | 'Other';
  stock: number;
  threshold: number;
  isActive: boolean;
  isOrganic: boolean;
  seasonality: string[];
  nutritionalInfo?: {
    calories: number;
    fiber: number;
    vitamins: string[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface PizzaMeat {
  _id: string;
  name: string;
  description: string;
  price: number;
  type: 'Poultry' | 'Pork' | 'Beef' | 'Seafood' | 'Processed';
  stock: number;
  threshold: number;
  isActive: boolean;
  isHalal: boolean;
  spiceLevel: 'None' | 'Mild' | 'Medium' | 'Hot';
  cookingMethod: 'Grilled' | 'Smoked' | 'Roasted' | 'Cured' | 'Fried';
  nutritionalInfo?: {
    calories: number;
    protein: number;
    fat: number;
    sodium: number;
  };
  createdAt: string;
  updatedAt: string;
}

// Pizza Ingredients Response from API
export interface PizzaIngredientsResponse {
  success: boolean;
  data: {
    bases: PizzaBase[];
    sauces: PizzaSauce[];
    cheeses: PizzaCheese[];
    veggies: PizzaVeggie[];
    meats: PizzaMeat[];
  };
}

// Pizza Builder State
export interface PizzaBuilderState {
  currentStep: number;
  selectedBase: PizzaBase | null;
  selectedSauce: PizzaSauce | null;
  selectedCheese: PizzaCheese | null;
  selectedVeggies: PizzaVeggie[];
  selectedMeats: PizzaMeat[];
  customizations: {
    size: 'Small' | 'Medium' | 'Large' | 'Extra Large';
    crustType: 'Thin' | 'Thick' | 'Stuffed';
    specialInstructions: string;
  };
  totalPrice: number;
}

// Pizza Customization
export interface CustomPizza {
  base: PizzaBase;
  sauce: PizzaSauce;
  cheese: PizzaCheese;
  veggies: PizzaVeggie[];
  meats: PizzaMeat[];
  customizations: {
    size: 'Small' | 'Medium' | 'Large' | 'Extra Large';
    crustType: 'Thin' | 'Thick' | 'Stuffed';
    specialInstructions: string;
  };
  quantity: number;
  totalPrice: number;
}

// Pizza Builder Step
export interface PizzaBuilderStep {
  id: number;
  title: string;
  description: string;
  component: string;
  isRequired: boolean;
  isCompleted: boolean;
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