import React from 'react';
import { Row, Col, Card, Form, Badge } from 'react-bootstrap';
import { PizzaBuilderState } from '../../types';

interface PizzaCustomizationProps {
  customizations: PizzaBuilderState['customizations'];
  onUpdateCustomizations: (updates: Partial<PizzaBuilderState['customizations']>) => void;
  sizeMultipliers: Record<string, number>;
  basePrice: number;
}

const PizzaCustomization: React.FC<PizzaCustomizationProps> = ({
  customizations,
  onUpdateCustomizations,
  sizeMultipliers,
  basePrice
}) => {
  const sizes = [
    { 
      value: 'Small', 
      label: 'Small (10")', 
      description: 'Perfect for 1-2 people',
      multiplier: 0.8
    },
    { 
      value: 'Medium', 
      label: 'Medium (12")', 
      description: 'Great for 2-3 people',
      multiplier: 1.0
    },
    { 
      value: 'Large', 
      label: 'Large (14")', 
      description: 'Ideal for 3-4 people',
      multiplier: 1.3
    },
    { 
      value: 'Extra Large', 
      label: 'Extra Large (16")', 
      description: 'Perfect for 4-6 people',
      multiplier: 1.6
    }
  ];

  const crustTypes = [
    { 
      value: 'Thin', 
      label: 'Thin Crust', 
      description: 'Crispy and light'
    },
    { 
      value: 'Thick', 
      label: 'Thick Crust', 
      description: 'Fluffy and filling'
    },
    { 
      value: 'Stuffed', 
      label: 'Stuffed Crust', 
      description: 'Cheese-stuffed edges'
    }
  ];

  const calculateSizePrice = (size: string) => {
    const multiplier = sizeMultipliers[size] || 1;
    return basePrice * multiplier;
  };

  return (
    <div>
      <div className="mb-4 text-center">
        <h4>Customize Your Pizza</h4>
        <p className="text-muted">Choose size, crust type, and add special instructions</p>
      </div>

      <Row className="g-4">
        {/* Size Selection */}
        <Col lg={6}>
          <Card className="h-100">
            <Card.Body>
              <h5 className="card-title mb-3">
                <span className="me-2">📏</span>
                Choose Size
              </h5>
              
              {sizes.map((size) => (
                <div key={size.value} className="mb-3">
                  <div 
                    className={`p-3 border rounded cursor-pointer ${
                      customizations.size === size.value 
                        ? 'border-primary bg-primary bg-opacity-10' 
                        : 'border-light'
                    }`}
                    onClick={() => onUpdateCustomizations({ size: size.value as any })}
                    style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                  >
                    <Form.Check
                      type="radio"
                      name="size"
                      checked={customizations.size === size.value}
                      onChange={() => onUpdateCustomizations({ size: size.value as any })}
                      label={
                        <div className="d-flex justify-content-between align-items-center w-100">
                          <div>
                            <strong>{size.label}</strong>
                            <div className="text-muted small">{size.description}</div>
                          </div>
                          <div>
                            <Badge bg="success">
                              {size.multiplier}x price
                            </Badge>
                            {basePrice > 0 && (
                              <div className="text-muted small mt-1">
                                ≈ ${calculateSizePrice(size.value).toFixed(2)}
                              </div>
                            )}
                          </div>
                        </div>
                      }
                    />
                  </div>
                </div>
              ))}
            </Card.Body>
          </Card>
        </Col>

        {/* Crust Type Selection */}
        <Col lg={6}>
          <Card className="h-100">
            <Card.Body>
              <h5 className="card-title mb-3">
                <span className="me-2">🍞</span>
                Choose Crust Style
              </h5>
              
              {crustTypes.map((crust) => (
                <div key={crust.value} className="mb-3">
                  <div 
                    className={`p-3 border rounded cursor-pointer ${
                      customizations.crustType === crust.value 
                        ? 'border-primary bg-primary bg-opacity-10' 
                        : 'border-light'
                    }`}
                    onClick={() => onUpdateCustomizations({ crustType: crust.value as any })}
                    style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                  >
                    <Form.Check
                      type="radio"
                      name="crustType"
                      checked={customizations.crustType === crust.value}
                      onChange={() => onUpdateCustomizations({ crustType: crust.value as any })}
                      label={
                        <div>
                          <strong>{crust.label}</strong>
                          <div className="text-muted small">{crust.description}</div>
                        </div>
                      }
                    />
                  </div>
                </div>
              ))}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Special Instructions */}
      <Row className="mt-4">
        <Col>
          <Card>
            <Card.Body>
              <h5 className="card-title mb-3">
                <span className="me-2">📝</span>
                Special Instructions
              </h5>
              <Form.Group>
                <Form.Label>Any special requests for your pizza?</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="e.g., Extra crispy, light cheese, well done, etc."
                  value={customizations.specialInstructions}
                  onChange={(e) => onUpdateCustomizations({ 
                    specialInstructions: e.target.value 
                  })}
                  maxLength={500}
                />
                <Form.Text className="text-muted">
                  {customizations.specialInstructions.length}/500 characters
                </Form.Text>
              </Form.Group>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Summary */}
      <div className="mt-4 p-3 bg-light rounded">
        <h6>Your Customizations</h6>
        <Row>
          <Col md={4}>
            <strong>Size:</strong> {customizations.size}
            <br />
            <small className="text-muted">
              {sizes.find(s => s.value === customizations.size)?.description}
            </small>
          </Col>
          <Col md={4}>
            <strong>Crust:</strong> {customizations.crustType}
            <br />
            <small className="text-muted">
              {crustTypes.find(c => c.value === customizations.crustType)?.description}
            </small>
          </Col>
          <Col md={4}>
            <strong>Price Multiplier:</strong> {sizeMultipliers[customizations.size]}x
            <br />
            <small className="text-muted">
              Size affects final price
            </small>
          </Col>
        </Row>
        
        {customizations.specialInstructions && (
          <div className="mt-2">
            <strong>Special Instructions:</strong>
            <div className="text-muted">{customizations.specialInstructions}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PizzaCustomization;