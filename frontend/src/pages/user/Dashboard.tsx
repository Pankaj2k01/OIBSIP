import React from 'react';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <h1 className="display-6">Welcome back, {user?.name}! 👋</h1>
          <p className="text-muted">Ready to create your perfect pizza?</p>
        </Col>
      </Row>

      {!user?.isEmailVerified && (
        <Row className="mb-4">
          <Col>
            <Alert variant="warning">
              <Alert.Heading>Email Verification Required</Alert.Heading>
              <p>
                Please verify your email address to access all features. 
                Check your inbox for the verification email.
              </p>
            </Alert>
          </Col>
        </Row>
      )}

      <Row className="g-4">
        <Col lg={8}>
          <Card className="shadow-sm">
            <Card.Body className="p-4">
              <div className="d-flex align-items-center mb-3">
                <div style={{ fontSize: '2rem' }} className="me-3">🍕</div>
                <div>
                  <h4 className="card-title mb-0">Build Your Pizza</h4>
                  <p className="text-muted mb-0">Create a custom pizza with our pizza builder</p>
                </div>
              </div>
              
              <p className="card-text mb-3">
                Choose from our premium selection of bases, sauces, cheeses, and fresh toppings 
                to create your perfect pizza.
              </p>
              
              <Button 
                as={Link} 
                to="/pizza-builder" 
                variant="primary" 
                size="lg"
                disabled={!user?.isEmailVerified}
              >
                Start Building 🚀
              </Button>
            </Card.Body>
          </Card>

          <Card className="shadow-sm mt-4">
            <Card.Body className="p-4">
              <div className="d-flex align-items-center mb-3">
                <div style={{ fontSize: '2rem' }} className="me-3">📦</div>
                <div>
                  <h4 className="card-title mb-0">Recent Orders</h4>
                  <p className="text-muted mb-0">Track your pizza orders</p>
                </div>
              </div>
              
              <div className="text-center py-4">
                <div style={{ fontSize: '4rem' }} className="text-muted mb-3">📝</div>
                <h5 className="text-muted">No orders yet</h5>
                <p className="text-muted">Your pizza orders will appear here once you place them.</p>
                <Button 
                  as={Link} 
                  to="/pizza-builder" 
                  variant="outline-primary"
                  disabled={!user?.isEmailVerified}
                >
                  Order Your First Pizza
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="shadow-sm">
            <Card.Body className="p-4">
              <h5 className="card-title">Quick Actions</h5>
              
              <div className="d-grid gap-2">
                <Button 
                  as={Link} 
                  to="/pizza-builder" 
                  variant="primary"
                  disabled={!user?.isEmailVerified}
                >
                  🍕 Build Pizza
                </Button>
                
                <Button as={Link} to="/orders" variant="outline-primary">
                  📦 View Orders
                </Button>
                
                <Button as={Link} to="/profile" variant="outline-secondary">
                  👤 Edit Profile
                </Button>
              </div>
            </Card.Body>
          </Card>

          <Card className="shadow-sm mt-4">
            <Card.Body className="p-4">
              <h5 className="card-title">Account Status</h5>
              
              <div className="mb-3">
                <small className="text-muted d-block">Email Status</small>
                {user?.isEmailVerified ? (
                  <span className="text-success">
                    ✅ Verified
                  </span>
                ) : (
                  <span className="text-warning">
                    ⚠️ Not Verified
                  </span>
                )}
              </div>

              <div className="mb-3">
                <small className="text-muted d-block">Account Type</small>
                <span className="text-capitalize">
                  {user?.role === 'admin' ? '👑 Admin' : '👤 User'}
                </span>
              </div>

              <div>
                <small className="text-muted d-block">Member Since</small>
                <span>
                  {user?.createdAt 
                    ? new Date(user.createdAt).toLocaleDateString()
                    : 'Recently'
                  }
                </span>
              </div>
            </Card.Body>
          </Card>

          <Card className="shadow-sm mt-4 border-0" style={{ backgroundColor: '#f8f9fa' }}>
            <Card.Body className="p-4 text-center">
              <div style={{ fontSize: '2rem' }} className="mb-2">🎯</div>
              <h6>Did you know?</h6>
              <p className="text-muted small mb-0">
                You can track your pizza order in real-time from preparation to delivery!
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;