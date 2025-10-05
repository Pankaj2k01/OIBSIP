import api from './api';
import { PizzaIngredientsResponse } from '../types';

export const pizzaApi = {
  // Get all ingredients for pizza builder
  getAllIngredients: async (): Promise<PizzaIngredientsResponse> => {
    const response = await api.get('/pizza/ingredients');
    return response.data;
  },

  // Get specific ingredient types
  getBases: async () => {
    const response = await api.get('/pizza/bases');
    return response.data;
  },

  getSauces: async () => {
    const response = await api.get('/pizza/sauces');
    return response.data;
  },

  getCheeses: async () => {
    const response = await api.get('/pizza/cheeses');
    return response.data;
  },

  getVeggies: async () => {
    const response = await api.get('/pizza/veggies');
    return response.data;
  },

  getMeats: async () => {
    const response = await api.get('/pizza/meats');
    return response.data;
  }
};

export default pizzaApi;