import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, ProgressBar, Spinner, Alert, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { usePizzaBuilder } from '../../hooks/usePizzaBuilder';
import { pizzaApi } from '../../utils/pizzaApi';
import { PizzaBase, PizzaSauce, PizzaCheese, PizzaVeggie, PizzaMeat } from '../../types';
import BaseSelection from './BaseSelection';
import SauceSelection from './SauceSelection';
import CheeseSelection from './CheeseSelection';
import ToppingsSelection from './ToppingsSelection';
import PizzaCustomization from './PizzaCustomization';
import { toast } from 'react-toastify';

const PizzaBuilder: React.FC = () => {
  const navigate = useNavigate();
  const {
    builderState,
    nextStep,
    prevStep,
    goToStep,
    selectBase,
    selectSauce,
    selectCheese,
    toggleVeggie,
    toggleMeat,
    updateCustomizations,
    isStepComplete,
    canProceed,
    buildPizza,
    resetBuilder,
    sizeMultipliers
  } = usePizzaBuilder();

  // Ingredient data
  const [ingredients, setIngredients] = useState<{
    bases: PizzaBase[];
    sauces: PizzaSauce[];
    cheeses: PizzaCheese[];
    veggies: PizzaVeggie[];
    meats: PizzaMeat[];
  } | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pizza builder steps
  const steps = [
    { id: 0, title: 'Choose Base', description: 'Select your pizza crust', required: true },
    { id: 1, title: 'Pick Sauce', description: 'Choose your sauce', required: true },
    { id: 2, title: 'Select Cheese', description: 'Pick your cheese', required: true },
    { id: 3, title: 'Add Toppings', description: 'Vegetables & meats (optional)', required: false },
    { id: 4, title: 'Customize', description: 'Size, crust & instructions', required: false },
    { id: 5, title: 'Review', description: 'Review your pizza', required: false }
  ];

  // Load ingredients on component mount
  useEffect(() => {
    const loadIngredients = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await pizzaApi.getAllIngredients();
        
        if (response.success) {
          setIngredients(response.data);
        } else {
          throw new Error('Failed to load ingredients');
        }
      } catch (error: any) {
        const message = error.response?.data?.message || 'Failed to load pizza ingredients';
        setError(message);
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    };

    loadIngredients();
  }, []);

  const currentStep = steps[builderState.currentStep];
  const progressPercentage = ((builderState.currentStep + 1) / steps.length) * 100;

  const handleNext = () => {
    if (builderState.currentStep < steps.length - 1) {
      nextStep();
    }
  };

  const handlePrevious = () => {
    if (builderState.currentStep > 0) {
      prevStep();
    }
  };

  const handleAddToCart = () => {
    const pizza = buildPizza(1);
    if (pizza) {
      // TODO: Add to cart/order system
      toast.success('Pizza added to cart!');
      // For now, navigate to checkout or cart
      // navigate('/checkout');
      console.log('Pizza built:', pizza);
    } else {
      toast.error('Please complete all required steps');
    }
  };

  const handleStartOver = () => {
    resetBuilder();
    toast.info('Pizza builder reset');
  };

  const renderStepContent = () => {
    if (!ingredients) return null;

    switch (builderState.currentStep) {
      case 0:
        return (
          <BaseSelection
            bases={ingredients.bases}
            selectedBase={builderState.selectedBase}
            onSelectBase={selectBase}
          />
        );
      case 1:
        return (
          <SauceSelection
            sauces={ingredients.sauces}
            selectedSauce={builderState.selectedSauce}
            onSelectSauce={selectSauce}
          />
        );
      case 2:
        return (
          <CheeseSelection
            cheeses={ingredients.cheeses}
            selectedCheese={builderState.selectedCheese}
            onSelectCheese={selectCheese}
          />
        );
      case 3:
        return (
          <ToppingsSelection
            veggies={ingredients.veggies}
            meats={ingredients.meats}
            selectedVeggies={builderState.selectedVeggies}
            selectedMeats={builderState.selectedMeats}
            onToggleVeggie={toggleVeggie}
            onToggleMeat={toggleMeat}
          />
        );
      case 4:
        const basePrice = (builderState.selectedBase?.price || 0) +
                          (builderState.selectedSauce?.price || 0) +
                          (builderState.selectedCheese?.price || 0) +
                          builderState.selectedVeggies.reduce((sum, v) => sum + v.price, 0) +
                          builderState.selectedMeats.reduce((sum, m) => sum + m.price, 0);
        
        return (
          <PizzaCustomization
            customizations={builderState.customizations}
            onUpdateCustomizations={updateCustomizations}
            sizeMultipliers={sizeMultipliers}
            basePrice={basePrice}
          />
        );
      case 5:
        return renderPizzaReview();
      default:
        return null;
    }
  };

  const renderPizzaReview = () => {
    const pizza = buildPizza(1);
    if (!pizza) return null;

    return (
      <div>
        <div className="mb-4 text-center">
          <h4>Review Your Pizza</h4>
          <p className="text-muted">Make sure everything looks perfect</p>
        </div>

        <Row>
          <Col lg={8}>
            <Card>
              <Card.Body>
                <h5 className="card-title mb-3">Your Custom Pizza</h5>
                
                <div className="mb-3">
                  <h6>🍞 Base: {pizza.base.name}</h6>
                  <p className="text-muted mb-1">{pizza.base.description}</p>
                  <small className="text-success">${pizza.base.price.toFixed(2)}</small>
                </div>

                <div className="mb-3">
                  <h6>🍅 Sauce: {pizza.sauce.name}</h6>
                  <p className="text-muted mb-1">{pizza.sauce.description}</p>
                  <small className="text-success">${pizza.sauce.price.toFixed(2)}</small>
                </div>

                <div className="mb-3">
                  <h6>🧀 Cheese: {pizza.cheese.name}</h6>
                  <p className="text-muted mb-1">{pizza.cheese.description}</p>
                  <small className="text-success">${pizza.cheese.price.toFixed(2)}</small>
                </div>

                {pizza.veggies.length > 0 && (
                  <div className="mb-3">
                    <h6>🥬 Vegetables ({pizza.veggies.length})</h6>
                    {pizza.veggies.map(veggie => (
                      <div key={veggie._id} className="d-flex justify-content-between">
                        <span>{veggie.name}</span>
                        <small className="text-success">${veggie.price.toFixed(2)}</small>
                      </div>
                    ))}
                  </div>
                )}

                {pizza.meats.length > 0 && (
                  <div className="mb-3">
                    <h6>🥓 Meats ({pizza.meats.length})</h6>
                    {pizza.meats.map(meat => (
                      <div key={meat._id} className="d-flex justify-content-between">
                        <span>{meat.name}</span>
                        <small className="text-success">${meat.price.toFixed(2)}</small>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mb-3">
                  <h6>📏 Customizations</h6>
                  <p className="mb-1">
                    <strong>Size:</strong> {pizza.customizations.size} 
                    <Badge bg="info" className="ms-2">
                      {sizeMultipliers[pizza.customizations.size]}x price
                    </Badge>
                  </p>
                  <p className="mb-1"><strong>Crust:</strong> {pizza.customizations.crustType}</p>
                  {pizza.customizations.specialInstructions && (
                    <p className="mb-1">
                      <strong>Special Instructions:</strong> {pizza.customizations.specialInstructions}
                    </p>
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={4}>
            <Card className="sticky-top">
              <Card.Body>
                <h5 className="card-title">Order Summary</h5>
                
                <div className="d-flex justify-content-between mb-2">
                  <span>Quantity:</span>
                  <span>{pizza.quantity}</span>
                </div>
                
                <hr />
                
                <div className="d-flex justify-content-between mb-2">
                  <strong>Total Price:</strong>
                  <strong className="text-success">${pizza.totalPrice.toFixed(2)}</strong>
                </div>

                <div className="d-grid gap-2 mt-3">
                  <Button 
                    variant="success" 
                    size="lg"
                    onClick={handleAddToCart}
                  >
                    🛒 Add to Cart
                  </Button>
                  
                  <Button 
                    variant="outline-secondary"
                    onClick={handleStartOver}
                  >
                    Start Over
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>
    );
  };

  if (isLoading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <Spinner animation="border" role="status" className="mb-3">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <h4>Loading Pizza Builder...</h4>
          <p className="text-muted">Getting our fresh ingredients ready for you</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <Alert.Heading>Oops! Something went wrong</Alert.Heading>
          <p>{error}</p>
          <Button variant="outline-danger" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      {/* Header */}
      <div className="text-center mb-4">
        <h2>🍕 Build Your Perfect Pizza</h2>
        <p className="text-muted">Create your custom pizza step by step</p>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <ProgressBar 
          now={progressPercentage} 
          variant="success" 
          animated 
          className="mb-2"
        />
        <div className="d-flex justify-content-between">
          {steps.map((step) => (
            <div 
              key={step.id}
              className={`text-center cursor-pointer ${
                step.id === builderState.currentStep ? 'text-primary fw-bold' : 
                isStepComplete(step.id) ? 'text-success' : 'text-muted'
              }`}
              onClick={() => goToStep(step.id)}
              style={{ cursor: 'pointer', fontSize: '0.8rem', flex: 1 }}
            >
              <div>
                {isStepComplete(step.id) ? '✓' : step.id + 1}
              </div>
              <div>{step.title}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Current Step */}
      <Card className="mb-4">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h4 className="mb-1">
                Step {builderState.currentStep + 1}: {currentStep.title}
                {currentStep.required && <Badge bg="warning" className="ms-2">Required</Badge>}
              </h4>
              <p className="text-muted mb-0">{currentStep.description}</p>
            </div>
            <div className="text-end">
              <div className="h4 mb-0 text-success">
                ${builderState.totalPrice.toFixed(2)}
              </div>
              <small className="text-muted">Current Total</small>
            </div>
          </div>

          {renderStepContent()}
        </Card.Body>
      </Card>

      {/* Navigation */}
      <div className="d-flex justify-content-between">
        <Button 
          variant="outline-secondary"
          onClick={handlePrevious}
          disabled={builderState.currentStep === 0}
        >
          ← Previous
        </Button>

        <div className="d-flex gap-2">
          <Button 
            variant="outline-danger"
            onClick={handleStartOver}
          >
            🔄 Start Over
          </Button>

          {builderState.currentStep < steps.length - 1 ? (
            <Button 
              variant="primary"
              onClick={handleNext}
              disabled={currentStep.required && !isStepComplete(builderState.currentStep)}
            >
              Next →
            </Button>
          ) : (
            <Button 
              variant="success"
              onClick={handleAddToCart}
              disabled={!canProceed()}
            >
              🛒 Add to Cart
            </Button>
          )}
        </div>
      </div>
    </Container>
  );
};

export default PizzaBuilder;