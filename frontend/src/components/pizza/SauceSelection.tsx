import React from 'react';
import { Row, Col, Card, Badge } from 'react-bootstrap';
import { PizzaSauce } from '../../types';

interface SauceSelectionProps {
  sauces: PizzaSauce[];
  selectedSauce: PizzaSauce | null;
  onSelectSauce: (sauce: PizzaSauce) => void;
}

const SauceSelection: React.FC<SauceSelectionProps> = ({ sauces, selectedSauce, onSelectSauce }) => {
  const formatPrice = (price: number) => `$${price.toFixed(2)}`;

  const getSpiceBadgeColor = (spiceLevel: string) => {
    switch (spiceLevel) {
      case 'Mild': return 'success';
      case 'Medium': return 'warning';
      case 'Hot': return 'danger';
      case 'Extra Hot': return 'dark';
      default: return 'secondary';
    }
  };

  const getSpiceIcon = (spiceLevel: string) => {
    switch (spiceLevel) {
      case 'Mild': return '🟢';
      case 'Medium': return '🟡';
      case 'Hot': return '🔥';
      case 'Extra Hot': return '🌶️';
      default: return '⚪';
    }
  };

  return (
    <div>
      <div className="mb-4 text-center">
        <h4>Choose Your Sauce</h4>
        <p className="text-muted">Pick the perfect sauce to complement your pizza</p>
      </div>

      <Row className="g-4">
        {sauces.map((sauce) => (
          <Col md={6} lg={4} key={sauce._id}>
            <Card 
              className={`h-100 cursor-pointer border-2 ${
                selectedSauce?._id === sauce._id 
                  ? 'border-primary shadow-lg' 
                  : 'border-light hover-shadow'
              }`}
              onClick={() => onSelectSauce(sauce)}
              style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
            >
              <Card.Body className="d-flex flex-column">
                <div className="mb-2">
                  <Card.Title className="d-flex justify-content-between align-items-center">
                    <span>{sauce.name}</span>
                    <Badge bg="success">{formatPrice(sauce.price)}</Badge>
                  </Card.Title>
                </div>
                
                <Card.Text className="flex-grow-1">
                  {sauce.description}
                </Card.Text>

                <div className="mb-2">
                  <Badge bg={getSpiceBadgeColor(sauce.spiceLevel)} className="me-2">
                    {getSpiceIcon(sauce.spiceLevel)} {sauce.spiceLevel}
                  </Badge>
                </div>

                {sauce.ingredients && sauce.ingredients.length > 0 && (
                  <div className="mb-2">
                    <small className="text-muted">
                      <strong>Ingredients:</strong> {sauce.ingredients.join(', ')}
                    </small>
                  </div>
                )}

                <div className="mt-auto">
                  <small className="text-muted">
                    Stock: {sauce.stock} available
                  </small>
                </div>

                {selectedSauce?._id === sauce._id && (
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

      {selectedSauce && (
        <div className="mt-4 p-3 bg-light rounded">
          <h6>
            Selected Sauce: {selectedSauce.name} 
            <Badge bg={getSpiceBadgeColor(selectedSauce.spiceLevel)} className="ms-2">
              {getSpiceIcon(selectedSauce.spiceLevel)} {selectedSauce.spiceLevel}
            </Badge>
          </h6>
          <p className="mb-0">
            <strong>{formatPrice(selectedSauce.price)}</strong> - {selectedSauce.description}
          </p>
          {selectedSauce.ingredients && selectedSauce.ingredients.length > 0 && (
            <small className="text-muted">
              Ingredients: {selectedSauce.ingredients.join(', ')}
            </small>
          )}
        </div>
      )}
    </div>
  );
};

export default SauceSelection;