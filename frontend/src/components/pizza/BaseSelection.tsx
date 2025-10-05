import React from 'react';
import { Row, Col, Card, Badge } from 'react-bootstrap';
import { PizzaBase } from '../../types';

interface BaseSelectionProps {
  bases: PizzaBase[];
  selectedBase: PizzaBase | null;
  onSelectBase: (base: PizzaBase) => void;
}

const BaseSelection: React.FC<BaseSelectionProps> = ({ bases, selectedBase, onSelectBase }) => {
  const formatPrice = (price: number) => `$${price.toFixed(2)}`;

  return (
    <div>
      <div className="mb-4 text-center">
        <h4>Choose Your Pizza Base</h4>
        <p className="text-muted">Select the perfect crust for your pizza</p>
      </div>

      <Row className="g-4">
        {bases.map((base) => (
          <Col md={6} lg={4} key={base._id}>
            <Card 
              className={`h-100 cursor-pointer border-2 ${
                selectedBase?._id === base._id 
                  ? 'border-primary shadow-lg' 
                  : 'border-light hover-shadow'
              }`}
              onClick={() => onSelectBase(base)}
              style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
            >
              <Card.Img 
                variant="top" 
                src={base.image} 
                alt={base.name}
                style={{ height: '200px', objectFit: 'cover' }}
              />
              <Card.Body className="d-flex flex-column">
                <div className="mb-2">
                  <Card.Title className="d-flex justify-content-between align-items-center">
                    <span>{base.name}</span>
                    <Badge bg="success">{formatPrice(base.price)}</Badge>
                  </Card.Title>
                </div>
                
                <Card.Text className="flex-grow-1">
                  {base.description}
                </Card.Text>

                {base.nutritionalInfo && (
                  <div className="mt-auto">
                    <small className="text-muted">
                      <strong>Per serving:</strong> {base.nutritionalInfo.calories} cal, 
                      {base.nutritionalInfo.protein}g protein, 
                      {base.nutritionalInfo.carbs}g carbs
                    </small>
                  </div>
                )}

                <div className="mt-2">
                  <small className="text-muted">
                    Stock: {base.stock} available
                  </small>
                </div>

                {selectedBase?._id === base._id && (
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

      {selectedBase && (
        <div className="mt-4 p-3 bg-light rounded">
          <h6>Selected Base: {selectedBase.name}</h6>
          <p className="mb-0">
            <strong>{formatPrice(selectedBase.price)}</strong> - {selectedBase.description}
          </p>
        </div>
      )}
    </div>
  );
};

export default BaseSelection;