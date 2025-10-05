import React, { useState } from 'react';
import { Row, Col, Card, Badge, Nav, Button } from 'react-bootstrap';
import { PizzaVeggie, PizzaMeat } from '../../types';

interface ToppingsSelectionProps {
  veggies: PizzaVeggie[];
  meats: PizzaMeat[];
  selectedVeggies: PizzaVeggie[];
  selectedMeats: PizzaMeat[];
  onToggleVeggie: (veggie: PizzaVeggie) => void;
  onToggleMeat: (meat: PizzaMeat) => void;
}

const ToppingsSelection: React.FC<ToppingsSelectionProps> = ({
  veggies,
  meats,
  selectedVeggies,
  selectedMeats,
  onToggleVeggie,
  onToggleMeat
}) => {
  const [activeTab, setActiveTab] = useState<'veggies' | 'meats'>('veggies');
  const formatPrice = (price: number) => `$${price.toFixed(2)}`;

  const isVeggieSelected = (veggie: PizzaVeggie) => 
    selectedVeggies.some(v => v._id === veggie._id);

  const isMeatSelected = (meat: PizzaMeat) => 
    selectedMeats.some(m => m._id === meat._id);

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case 'Leafy Greens': return 'success';
      case 'Peppers': return 'danger';
      case 'Mushrooms': return 'secondary';
      case 'Onions': return 'warning';
      case 'Tomatoes': return 'danger';
      default: return 'info';
    }
  };

  const getMeatTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'Poultry': return 'warning';
      case 'Pork': return 'danger';
      case 'Beef': return 'dark';
      case 'Seafood': return 'info';
      case 'Processed': return 'secondary';
      default: return 'secondary';
    }
  };

  const renderVeggieCard = (veggie: PizzaVeggie) => {
    const selected = isVeggieSelected(veggie);
    
    return (
      <Col md={6} lg={4} key={veggie._id}>
        <Card 
          className={`h-100 cursor-pointer border-2 ${
            selected ? 'border-success shadow-lg' : 'border-light hover-shadow'
          }`}
          onClick={() => onToggleVeggie(veggie)}
          style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
        >
          <Card.Body className="d-flex flex-column">
            <div className="mb-2">
              <Card.Title className="d-flex justify-content-between align-items-center">
                <span>{veggie.name}</span>
                <Badge bg="success">{formatPrice(veggie.price)}</Badge>
              </Card.Title>
            </div>
            
            <Card.Text className="flex-grow-1">
              {veggie.description}
            </Card.Text>

            <div className="mb-2">
              <Badge bg={getCategoryBadgeColor(veggie.category)} className="me-2">
                {veggie.category}
              </Badge>
              {veggie.isOrganic && (
                <Badge bg="success">🌱 Organic</Badge>
              )}
            </div>

            {veggie.nutritionalInfo && veggie.nutritionalInfo.vitamins && (
              <div className="mb-2">
                <small className="text-muted">
                  <strong>Rich in:</strong> {veggie.nutritionalInfo.vitamins.join(', ')}
                </small>
              </div>
            )}

            <div className="mt-auto">
              <small className="text-muted">
                Stock: {veggie.stock} available
              </small>
            </div>

            <div className="mt-2">
              <Button
                variant={selected ? 'success' : 'outline-success'}
                size="sm"
                className="w-100"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleVeggie(veggie);
                }}
              >
                {selected ? '✓ Added' : '+ Add Topping'}
              </Button>
            </div>
          </Card.Body>
        </Card>
      </Col>
    );
  };

  const renderMeatCard = (meat: PizzaMeat) => {
    const selected = isMeatSelected(meat);
    
    return (
      <Col md={6} lg={4} key={meat._id}>
        <Card 
          className={`h-100 cursor-pointer border-2 ${
            selected ? 'border-danger shadow-lg' : 'border-light hover-shadow'
          }`}
          onClick={() => onToggleMeat(meat)}
          style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
        >
          <Card.Body className="d-flex flex-column">
            <div className="mb-2">
              <Card.Title className="d-flex justify-content-between align-items-center">
                <span>{meat.name}</span>
                <Badge bg="success">{formatPrice(meat.price)}</Badge>
              </Card.Title>
            </div>
            
            <Card.Text className="flex-grow-1">
              {meat.description}
            </Card.Text>

            <div className="mb-2">
              <Badge bg={getMeatTypeBadgeColor(meat.type)} className="me-2">
                {meat.type}
              </Badge>
              {meat.isHalal && (
                <Badge bg="info">✓ Halal</Badge>
              )}
              {meat.spiceLevel !== 'None' && (
                <Badge bg="warning" className="ms-1">
                  🌶️ {meat.spiceLevel}
                </Badge>
              )}
            </div>

            <div className="mb-2">
              <small className="text-muted">
                <strong>Cooking:</strong> {meat.cookingMethod}
              </small>
            </div>

            {meat.nutritionalInfo && (
              <div className="mb-2">
                <small className="text-muted">
                  <strong>Per serving:</strong> {meat.nutritionalInfo.protein}g protein, 
                  {meat.nutritionalInfo.calories} cal
                </small>
              </div>
            )}

            <div className="mt-auto">
              <small className="text-muted">
                Stock: {meat.stock} available
              </small>
            </div>

            <div className="mt-2">
              <Button
                variant={selected ? 'danger' : 'outline-danger'}
                size="sm"
                className="w-100"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleMeat(meat);
                }}
              >
                {selected ? '✓ Added' : '+ Add Topping'}
              </Button>
            </div>
          </Card.Body>
        </Card>
      </Col>
    );
  };

  const getTotalToppingsPrice = () => {
    const veggiePrice = selectedVeggies.reduce((sum, v) => sum + v.price, 0);
    const meatPrice = selectedMeats.reduce((sum, m) => sum + m.price, 0);
    return veggiePrice + meatPrice;
  };

  return (
    <div>
      <div className="mb-4 text-center">
        <h4>Choose Your Toppings</h4>
        <p className="text-muted">Select your favorite vegetables and meats (optional)</p>
      </div>

      <Nav variant="tabs" className="mb-4">
        <Nav.Item>
          <Nav.Link 
            active={activeTab === 'veggies'}
            onClick={() => setActiveTab('veggies')}
            style={{ cursor: 'pointer' }}
          >
            🥬 Vegetables ({selectedVeggies.length})
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link 
            active={activeTab === 'meats'}
            onClick={() => setActiveTab('meats')}
            style={{ cursor: 'pointer' }}
          >
            🥓 Meats ({selectedMeats.length})
          </Nav.Link>
        </Nav.Item>
      </Nav>

      <Row className="g-4">
        {activeTab === 'veggies' && veggies.map(renderVeggieCard)}
        {activeTab === 'meats' && meats.map(renderMeatCard)}
      </Row>

      {(selectedVeggies.length > 0 || selectedMeats.length > 0) && (
        <div className="mt-4 p-3 bg-light rounded">
          <h6>Selected Toppings ({selectedVeggies.length + selectedMeats.length})</h6>
          
          {selectedVeggies.length > 0 && (
            <div className="mb-2">
              <strong>Vegetables:</strong>
              {selectedVeggies.map((veggie, index) => (
                <Badge key={veggie._id} bg="success" className="ms-2">
                  {veggie.name} ({formatPrice(veggie.price)})
                </Badge>
              ))}
            </div>
          )}
          
          {selectedMeats.length > 0 && (
            <div className="mb-2">
              <strong>Meats:</strong>
              {selectedMeats.map((meat, index) => (
                <Badge key={meat._id} bg="danger" className="ms-2">
                  {meat.name} ({formatPrice(meat.price)})
                </Badge>
              ))}
            </div>
          )}
          
          <p className="mb-0">
            <strong>Toppings Total: {formatPrice(getTotalToppingsPrice())}</strong>
          </p>
        </div>
      )}

      {selectedVeggies.length === 0 && selectedMeats.length === 0 && (
        <div className="mt-4 p-3 bg-info bg-opacity-10 border border-info rounded">
          <div className="text-center">
            <h6 className="text-info">No toppings selected</h6>
            <p className="mb-0 text-muted">
              Toppings are optional, but they make your pizza extra delicious! 
              Switch between vegetables and meats tabs to explore our options.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ToppingsSelection;