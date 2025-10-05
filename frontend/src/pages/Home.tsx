import React from 'react';
import { Container, Row, Col, Card, Button, Jumbotron } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home: React.FC = () => {
  const { user } = useAuth();

  return (
    <div>
      {/* Hero Section */}
      <div className="bg-primary text-white py-5">
        <Container>
          <Row className="align-items-center">
            <Col lg={6}>
              <h1 className="display-4 fw-bold mb-3">
                Welcome to Pizza Palace 🍕
              </h1>
              <p className="lead mb-4">
                Create your perfect pizza with our customizable options. 
                Choose from premium bases, sauces, cheeses, and fresh toppings!
              </p>
              {user ? (
                <Button as={Link} to="/dashboard" variant="light" size="lg">
                  Start Building Your Pizza
                </Button>
              ) : (
                <div>
                  <Button as={Link} to="/register" variant="light" size="lg" className="me-3">
                    Get Started
                  </Button>
                  <Button as={Link} to="/login" variant="outline-light" size="lg">
                    Sign In
                  </Button>
                </div>
              )}
            </Col>
            <Col lg={6} className="text-center">
              <div style={{ fontSize: '200px' }}>🍕</div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Features Section */}
      <Container className="py-5">
        <Row className="text-center mb-5">
          <Col>
            <h2 className="display-5 fw-bold mb-3">Why Choose Pizza Palace?</h2>
            <p className="lead text-muted">
              Experience the ultimate pizza customization with our premium ingredients
            </p>
          </Col>
        </Row>

        <Row className="g-4">
          <Col md={4}>
            <Card className="h-100 shadow-sm border-0">
              <Card.Body className="text-center p-4">
                <div style={{ fontSize: '3rem' }} className="mb-3">🍞</div>
                <h5 className="card-title">Premium Bases</h5>
                <p className="card-text text-muted">
                  Choose from 5 delicious base options including thin crust, 
                  thick crust, stuffed crust, and more.
                </p>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={4}>
            <Card className="h-100 shadow-sm border-0">
              <Card.Body className="text-center p-4">
                <div style={{ fontSize: '3rem' }} className="mb-3">🍅</div>
                <h5 className="card-title">Gourmet Sauces</h5>
                <p className="card-text text-muted">
                  From classic marinara to spicy arrabbiata, 
                  we have 5 amazing sauce varieties.
                </p>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={4}>
            <Card className="h-100 shadow-sm border-0">
              <Card.Body className="text-center p-4">
                <div style={{ fontSize: '3rem' }} className="mb-3">🧀</div>
                <h5 className="card-title">Fresh Toppings</h5>
                <p className="card-text text-muted">
                  Premium cheeses and fresh vegetables 
                  to make your pizza exactly how you like it.
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row className="g-4 mt-4">
          <Col md={4}>
            <Card className="h-100 shadow-sm border-0">
              <Card.Body className="text-center p-4">
                <div style={{ fontSize: '3rem' }} className="mb-3">💳</div>
                <h5 className="card-title">Secure Payment</h5>
                <p className="card-text text-muted">
                  Safe and secure payment processing with Razorpay. 
                  Multiple payment options available.
                </p>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={4}>
            <Card className="h-100 shadow-sm border-0">
              <Card.Body className="text-center p-4">
                <div style={{ fontSize: '3rem' }} className="mb-3">🚚</div>
                <h5 className="card-title">Fast Delivery</h5>
                <p className="card-text text-muted">
                  Track your order in real-time from preparation 
                  to delivery at your doorstep.
                </p>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={4}>
            <Card className="h-100 shadow-sm border-0">
              <Card.Body className="text-center p-4">
                <div style={{ fontSize: '3rem' }} className="mb-3">📧</div>
                <h5 className="card-title">Order Updates</h5>
                <p className="card-text text-muted">
                  Get instant notifications about your order status 
                  and delivery updates via email.
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {!user && (
          <Row className="mt-5">
            <Col className="text-center">
              <h3 className="mb-3">Ready to Get Started?</h3>
              <p className="text-muted mb-4">Join thousands of satisfied customers</p>
              <Button as={Link} to="/register" variant="primary" size="lg" className="me-3">
                Create Account
              </Button>
              <Button as={Link} to="/login" variant="outline-primary" size="lg">
                Sign In
              </Button>
            </Col>
          </Row>
        )}
      </Container>
    </div>
  );
};

export default Home;