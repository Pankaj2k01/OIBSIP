import { useState, useCallback } from 'react';
import { PizzaBuilderState, PizzaBase, PizzaSauce, PizzaCheese, PizzaVeggie, PizzaMeat, CustomPizza } from '../types';

const initialState: PizzaBuilderState = {
  currentStep: 0,
  selectedBase: null,
  selectedSauce: null,
  selectedCheese: null,
  selectedVeggies: [],
  selectedMeats: [],
  customizations: {
    size: 'Medium',
    crustType: 'Thin',
    specialInstructions: ''
  },
  totalPrice: 0
};

// Size multipliers for pricing
const sizeMultipliers = {
  'Small': 0.8,
  'Medium': 1.0,
  'Large': 1.3,
  'Extra Large': 1.6
};

export const usePizzaBuilder = () => {
  const [builderState, setBuilderState] = useState<PizzaBuilderState>(initialState);

  // Calculate total price
  const calculatePrice = useCallback((state: PizzaBuilderState): number => {
    let total = 0;

    if (state.selectedBase) total += state.selectedBase.price;
    if (state.selectedSauce) total += state.selectedSauce.price;
    if (state.selectedCheese) total += state.selectedCheese.price;
    
    state.selectedVeggies.forEach(veggie => total += veggie.price);
    state.selectedMeats.forEach(meat => total += meat.price);

    // Apply size multiplier
    total *= sizeMultipliers[state.customizations.size];

    return Math.round(total * 100) / 100; // Round to 2 decimal places
  }, []);

  // Update state and recalculate price
  const updateState = useCallback((updates: Partial<PizzaBuilderState>) => {
    setBuilderState(prevState => {
      const newState = { ...prevState, ...updates };
      newState.totalPrice = calculatePrice(newState);
      return newState;
    });
  }, [calculatePrice]);

  // Navigation functions
  const nextStep = useCallback(() => {
    setBuilderState(prev => ({ ...prev, currentStep: prev.currentStep + 1 }));
  }, []);

  const prevStep = useCallback(() => {
    setBuilderState(prev => ({ ...prev, currentStep: prev.currentStep - 1 }));
  }, []);

  const goToStep = useCallback((step: number) => {
    setBuilderState(prev => ({ ...prev, currentStep: step }));
  }, []);

  // Selection functions
  const selectBase = useCallback((base: PizzaBase) => {
    updateState({ selectedBase: base });
  }, [updateState]);

  const selectSauce = useCallback((sauce: PizzaSauce) => {
    updateState({ selectedSauce: sauce });
  }, [updateState]);

  const selectCheese = useCallback((cheese: PizzaCheese) => {
    updateState({ selectedCheese: cheese });
  }, [updateState]);

  const toggleVeggie = useCallback((veggie: PizzaVeggie) => {
    setBuilderState(prevState => {
      const isSelected = prevState.selectedVeggies.some(v => v._id === veggie._id);
      let newVeggies;
      
      if (isSelected) {
        newVeggies = prevState.selectedVeggies.filter(v => v._id !== veggie._id);
      } else {
        newVeggies = [...prevState.selectedVeggies, veggie];
      }

      const newState = { ...prevState, selectedVeggies: newVeggies };
      newState.totalPrice = calculatePrice(newState);
      return newState;
    });
  }, [calculatePrice]);

  const toggleMeat = useCallback((meat: PizzaMeat) => {
    setBuilderState(prevState => {
      const isSelected = prevState.selectedMeats.some(m => m._id === meat._id);
      let newMeats;
      
      if (isSelected) {
        newMeats = prevState.selectedMeats.filter(m => m._id !== meat._id);
      } else {
        newMeats = [...prevState.selectedMeats, meat];
      }

      const newState = { ...prevState, selectedMeats: newMeats };
      newState.totalPrice = calculatePrice(newState);
      return newState;
    });
  }, [calculatePrice]);

  const updateCustomizations = useCallback((customizations: Partial<PizzaBuilderState['customizations']>) => {
    updateState({ 
      customizations: { 
        ...builderState.customizations, 
        ...customizations 
      } 
    });
  }, [builderState.customizations, updateState]);

  // Validation functions
  const isStepComplete = useCallback((step: number): boolean => {
    switch (step) {
      case 0: return builderState.selectedBase !== null;
      case 1: return builderState.selectedSauce !== null;
      case 2: return builderState.selectedCheese !== null;
      case 3: return true; // Veggies are optional
      case 4: return true; // Meats are optional
      case 5: return true; // Customizations have defaults
      default: return false;
    }
  }, [builderState]);

  const canProceed = useCallback((): boolean => {
    return builderState.selectedBase !== null &&
           builderState.selectedSauce !== null &&
           builderState.selectedCheese !== null;
  }, [builderState]);

  // Convert to CustomPizza for order
  const buildPizza = useCallback((quantity: number = 1): CustomPizza | null => {
    if (!canProceed()) return null;

    return {
      base: builderState.selectedBase!,
      sauce: builderState.selectedSauce!,
      cheese: builderState.selectedCheese!,
      veggies: builderState.selectedVeggies,
      meats: builderState.selectedMeats,
      customizations: builderState.customizations,
      quantity,
      totalPrice: builderState.totalPrice * quantity
    };
  }, [builderState, canProceed]);

  // Reset builder
  const resetBuilder = useCallback(() => {
    setBuilderState(initialState);
  }, []);

  return {
    // State
    builderState,
    
    // Navigation
    nextStep,
    prevStep,
    goToStep,
    
    // Selection
    selectBase,
    selectSauce,
    selectCheese,
    toggleVeggie,
    toggleMeat,
    updateCustomizations,
    
    // Validation
    isStepComplete,
    canProceed,
    
    // Utils
    buildPizza,
    resetBuilder,
    
    // Helpers
    sizeMultipliers
  };
};