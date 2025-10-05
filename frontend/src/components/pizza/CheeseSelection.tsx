import React from 'react';
import { Row, Col, Card, Badge } from 'react-bootstrap';
import { PizzaCheese } from '../../types';

interface CheeseSelectionProps {
  cheeses: PizzaCheese[];
  selectedCheese: PizzaCheese | null;
  onSelectCheese: (cheese: PizzaCheese) => void;
}

const CheeseSelection: React.FC<CheeseSelectionProps> = ({ cheeses, selectedCheese, onSelectCheese }) => {
  const formatPrice = (price: number) => `$${price.toFixed(2)}`;

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'Fresh': return 'success';
      case 'Aged': return 'warning';
      case 'Processed': return 'info';
      case 'Organic': return 'primary';
      default: return 'secondary';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Fresh': return '🧀';
      case 'Aged': return '🧈';
      case 'Processed': return '📦';
      case 'Organic': return '🌱';
      default: return '🧀';
    }
  };

  return (
    <div>
      <div className="mb-4 text-center">
        <h4>Choose Your Cheese</h4>
        <p className="text-muted">Select the cheese that makes your pizza perfect</p>
      </div>

      <Row className="g-4">
        {cheeses.map((cheese) => (
          <Col md={6} lg={4} key={cheese._id}>
            <Card 
              className={`h-100 cursor-pointer border-2 ${
                selectedCheese?._id === cheese._id 
                  ? 'border-primary shadow-lg' 
                  : 'border-light hover-shadow'
              }`}
              onClick={() => onSelectCheese(cheese)}
              style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
            >
              <Card.Body className="d-flex flex-column">
                <div className="mb-2">
                  <Card.Title className="d-flex justify-content-between align-items-center">
                    <span>{cheese.name}</span>
                    <Badge bg="success">{formatPrice(cheese.price)}</Badge>
                  </Card.Title>
                </div>
                
                <Card.Text className="flex-grow-1">
                  {cheese.description}
                </Card.Text>

                <div className="mb-2">
                  <Badge bg={getTypeBadgeColor(cheese.type)} className="me-2">
                    {getTypeIcon(cheese.type)} {cheese.type}
                  </Badge>
                  {cheese.origin && (
                    <Badge bg="outline-secondary" text="dark">
                      📍 {cheese.origin}
                    </Badge>
                  )}
                </div>

                {cheese.nutritionalInfo && (
                  <div className="mb-2">
                    <small className="text-muted">
                      <strong>Per serving:</strong> {cheese.nutritionalInfo.calories} cal, 
                      {cheese.nutritionalInfo.protein}g protein, 
                      {cheese.nutritionalInfo.calcium}mg calcium
                    </small>
                  </div>
                )}

                <div className="mt-auto">
                  <small className="text-muted">
                    Stock: {cheese.stock} available
                  </small>
                </div>

                {selectedCheese?._id === cheese._id && (
                  <div className="mt-2">
                    <Badge bg="primary" className="w-100">
                      ✓ Selected
                    </Badge>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {selectedCheese && (
        <div className="mt-4 p-3 bg-light rounded">
          <h6>
            Selected Cheese: {selectedCheese.name} 
            <Badge bg={getTypeBadgeColor(selectedCheese.type)} className="ms-2">
              {getTypeIcon(selectedCheese.type)} {selectedCheese.type}
            </Badge>
            {selectedCheese.origin && (
              <Badge bg="outline-secondary" text="dark" className="ms-2">
                📍 {selectedCheese.origin}
              </Badge>
            )}
          </h6>
          <p className="mb-0">
            <strong>{formatPrice(selectedCheese.price)}</strong> - {selectedCheese.description}
          </p>
          {selectedCheese.nutritionalInfo && (
            <small className="text-muted">
              {selectedCheese.nutritionalInfo.calories} cal, 
              {selectedCheese.nutritionalInfo.protein}g protein per serving
            </small>
          )}
        </div>
      )}
    </div>
  );
};

export default CheeseSelection;