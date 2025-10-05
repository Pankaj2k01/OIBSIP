import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Row,
  Col,
  Card,
  Alert,
  Spinner,
  Badge,
  Button,
  Modal,
  Form,
  ProgressBar,
} from 'react-bootstrap';
import { toast } from 'react-toastify';
import {
  orderAPI,
  UserOrder,
  OrderTrackingStep,
  formatCurrency,
  formatDate,
  formatRelativeTime,
  formatOrderStatus,
  getOrderStatusColor,
  getOrderStatusIcon,
  canCancelOrder,
  canRateOrder,
} from '../../utils/orderApi';

interface OrderTrackingData {
  order: UserOrder;
  trackingSteps: OrderTrackingStep[];
  estimatedDelivery: string;
  currentStep: number;
}

const OrderTracking: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  
  const [trackingData, setTrackingData] = useState<OrderTrackingData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [refreshing, setRefreshing] = useState<boolean>(false);
  
  // Modal states
  const [showCancelModal, setShowCancelModal] = useState<boolean>(false);
  const [showRatingModal, setShowRatingModal] = useState<boolean>(false);
  const [cancelling, setCancelling] = useState<boolean>(false);
  const [rating, setRating] = useState<number>(5);
  const [review, setReview] = useState<string>('');
  const [cancelReason, setCancelReason] = useState<string>('');

  useEffect(() => {
    if (orderId) {
      fetchTrackingData();
      
      // Set up auto-refresh every 30 seconds for active orders
      const interval = setInterval(() => {
        if (trackingData && !['delivered', 'cancelled'].includes(trackingData.order.status)) {
          refreshTrackingData();
        }
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [orderId]);

  const fetchTrackingData = async () => {
    if (!orderId) return;
    
    try {
      setLoading(true);
      setError('');
      const data = await orderAPI.trackOrder(orderId);
      setTrackingData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch order tracking data');
      toast.error('Failed to load order tracking');
    } finally {
      setLoading(false);
    }
  };

  const refreshTrackingData = async () => {
    if (!orderId) return;
    
    try {
      setRefreshing(true);
      const data = await orderAPI.trackOrder(orderId);
      setTrackingData(data);
    } catch (err: any) {
      console.error('Failed to refresh tracking data:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!orderId || !trackingData) return;
    
    try {
      setCancelling(true);
      await orderAPI.cancelOrder(orderId, cancelReason);
      toast.success('Order cancelled successfully');
      setShowCancelModal(false);
      await fetchTrackingData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  const handleRateOrder = async () => {
    if (!orderId) return;
    
    try {
      await orderAPI.rateOrder(orderId, rating, review);
      toast.success('Thank you for your feedback!');
      setShowRatingModal(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit rating');
    }
  };

  const getProgressPercentage = (): number => {
    if (!trackingData) return 0;
    if (trackingData.order.status === 'cancelled') return 0;
    if (trackingData.order.status === 'delivered') return 100;
    
    return Math.round(((trackingData.currentStep + 1) / trackingData.trackingSteps.length) * 100);
  };

  const getEstimatedDeliveryTime = (): string => {
    if (!trackingData) return '';
    
    const estimatedTime = new Date(trackingData.estimatedDelivery);
    return estimatedTime.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <Container className=\"py-5\">
        <div className=\"text-center\">
          <Spinner animation=\"border\" role=\"status\" className=\"me-2\" />
          Loading order tracking...
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className=\"py-5\">
        <Alert variant=\"danger\">
          <Alert.Heading>Tracking Error</Alert.Heading>
          <p>{error}</p>
          <div>
            <Button variant=\"outline-danger\" className=\"me-2\" onClick={fetchTrackingData}>
              Try Again
            </Button>
            <Button variant=\"secondary\" onClick={() => navigate('/orders')}>
              Back to Orders
            </Button>
          </div>
        </Alert>
      </Container>
    );
  }

  if (!trackingData) {
    return null;
  }

  const { order, trackingSteps, estimatedDelivery } = trackingData;

  return (
    <Container className=\"py-4\">
      {/* Header */}
      <div className=\"d-flex justify-content-between align-items-center mb-4\">
        <div>
          <h2 className=\"mb-1\">🍕 Track Your Order</h2>
          <p className=\"text-muted mb-0\">Order ID: <code>{order.orderId}</code></p>
        </div>
        <div className=\"d-flex gap-2\">
          <Button
            variant=\"outline-secondary\"
            size=\"sm\"
            onClick={refreshTrackingData}
            disabled={refreshing}
          >
            {refreshing ? (
              <Spinner size=\"sm\" className=\"me-1\" />
            ) : (
              <i className=\"bi bi-arrow-clockwise me-1\"></i>
            )}
            Refresh
          </Button>
          <Button
            variant=\"outline-primary\"
            size=\"sm\"
            onClick={() => navigate('/orders')}
          >
            <i className=\"bi bi-arrow-left me-1\"></i>
            Back to Orders
          </Button>
        </div>
      </div>

      <Row>
        <Col lg={8}>
          {/* Order Status Card */}
          <Card className=\"mb-4 border-0 shadow-sm\">
            <Card.Header className=\"bg-white border-0\">
              <div className=\"d-flex justify-content-between align-items-center\">
                <div className=\"d-flex align-items-center\">
                  <i className={`bi bi-${getOrderStatusIcon(order.status)} fs-4 text-${getOrderStatusColor(order.status)} me-3`}></i>
                  <div>
                    <h5 className=\"mb-1\">{formatOrderStatus(order.status)}</h5>
                    <small className=\"text-muted\">
                      {order.status === 'delivered' 
                        ? `Delivered ${formatRelativeTime(order.actualDeliveryTime || order.updatedAt)}`
                        : `Updated ${formatRelativeTime(order.updatedAt)}`}
                    </small>
                  </div>
                </div>
                <Badge bg={getOrderStatusColor(order.status)} className=\"fs-6\">
                  {formatOrderStatus(order.status)}
                </Badge>
              </div>
            </Card.Header>
            <Card.Body>
              {order.status !== 'cancelled' && order.status !== 'delivered' && (
                <div className=\"mb-4\">
                  <div className=\"d-flex justify-content-between align-items-center mb-2\">
                    <small className=\"text-muted\">Estimated delivery</small>
                    <small className=\"fw-medium\">{getEstimatedDeliveryTime()}</small>
                  </div>
                  <ProgressBar 
                    now={getProgressPercentage()} 
                    variant={getOrderStatusColor(order.status)}
                    style={{ height: '8px' }}
                    className=\"mb-2\"
                  />
                  <div className=\"text-center\">
                    <small className=\"text-muted\">{getProgressPercentage()}% Complete</small>
                  </div>
                </div>
              )}

              {/* Tracking Steps */}
              <div className=\"tracking-timeline\">
                {trackingSteps.map((step, index) => (
                  <div 
                    key={step.status} 
                    className={`tracking-step ${step.isCompleted ? 'completed' : ''} ${step.isActive ? 'active' : ''}`}
                  >
                    <div className=\"step-indicator\">
                      <div className=\"step-icon\">
                        <i className={`bi bi-${getOrderStatusIcon(step.status)}`}></i>
                      </div>
                      {index < trackingSteps.length - 1 && (
                        <div className=\"step-line\"></div>
                      )}
                    </div>
                    <div className=\"step-content\">
                      <div className=\"step-title\">{formatOrderStatus(step.status)}</div>
                      <div className=\"step-message\">{step.message}</div>
                      {step.timestamp && (
                        <div className=\"step-time text-muted\">
                          {formatDate(step.timestamp)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>

          {/* Order Actions */}
          <Card className=\"mb-4 border-0 shadow-sm\">
            <Card.Body>
              <h6 className=\"mb-3\">Order Actions</h6>
              <div className=\"d-flex gap-2 flex-wrap\">
                {canCancelOrder(order.status) && (
                  <Button
                    variant=\"outline-danger\"
                    size=\"sm\"
                    onClick={() => setShowCancelModal(true)}
                  >
                    <i className=\"bi bi-x-circle me-1\"></i>
                    Cancel Order
                  </Button>
                )}
                
                {canRateOrder(order.status) && (
                  <Button
                    variant=\"outline-primary\"
                    size=\"sm\"
                    onClick={() => setShowRatingModal(true)}
                  >
                    <i className=\"bi bi-star me-1\"></i>
                    Rate Order
                  </Button>
                )}
                
                <Button
                  variant=\"outline-secondary\"
                  size=\"sm\"
                  onClick={() => window.print()}
                >
                  <i className=\"bi bi-printer me-1\"></i>
                  Print Receipt
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          {/* Order Summary */}
          <Card className=\"mb-4 border-0 shadow-sm\">
            <Card.Header className=\"bg-white border-0\">
              <h6 className=\"mb-0\">Order Summary</h6>
            </Card.Header>
            <Card.Body>
              <div className=\"mb-3\">
                <div className=\"d-flex justify-content-between text-muted mb-2\">
                  <span>Order Date:</span>
                  <span>{formatDate(order.createdAt)}</span>
                </div>
                <div className=\"d-flex justify-content-between text-muted mb-2\">
                  <span>Payment Status:</span>
                  <Badge bg={order.paymentStatus === 'paid' ? 'success' : 'warning'}>
                    {order.paymentStatus.toUpperCase()}
                  </Badge>
                </div>
                <div className=\"d-flex justify-content-between fw-bold\">
                  <span>Total Amount:</span>
                  <span>{formatCurrency(order.totalAmount)}</span>
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* Delivery Address */}
          <Card className=\"mb-4 border-0 shadow-sm\">
            <Card.Header className=\"bg-white border-0\">
              <h6 className=\"mb-0\">
                <i className=\"bi bi-geo-alt me-2\"></i>
                Delivery Address
              </h6>
            </Card.Header>
            <Card.Body>
              <address className=\"mb-0\">
                {order.deliveryAddress.street}<br />
                {order.deliveryAddress.city}, {order.deliveryAddress.state}<br />
                {order.deliveryAddress.zipCode}
                {order.deliveryAddress.landmark && (
                  <><br /><small className=\"text-muted\">Near: {order.deliveryAddress.landmark}</small></>
                )}
              </address>
              {order.deliveryInstructions && (
                <div className=\"mt-2 pt-2 border-top\">
                  <small className=\"text-muted\">
                    <strong>Instructions:</strong> {order.deliveryInstructions}
                  </small>
                </div>
              )}
            </Card.Body>
          </Card>

          {/* Order Items */}
          <Card className=\"border-0 shadow-sm\">
            <Card.Header className=\"bg-white border-0\">
              <h6 className=\"mb-0\">Items Ordered</h6>
            </Card.Header>
            <Card.Body>
              {order.items.map((item, index) => (
                <div key={index} className={`${index > 0 ? 'pt-3 mt-3 border-top' : ''}`}>
                  <div className=\"d-flex justify-content-between align-items-start mb-2\">
                    <div className=\"flex-grow-1\">
                      <h6 className=\"mb-1\">Custom Pizza</h6>
                      <div className=\"text-muted small\">
                        <div>{item.pizza.customizations.size} • {item.pizza.customizations.crustType} Crust</div>
                        <div className=\"mt-1\">
                          <strong>Base:</strong> {item.pizza.selectedIngredients.bases.map(b => b.name).join(', ')}
                        </div>
                        <div>
                          <strong>Sauce:</strong> {item.pizza.selectedIngredients.sauces.map(s => s.name).join(', ')}
                        </div>
                        <div>
                          <strong>Cheese:</strong> {item.pizza.selectedIngredients.cheeses.map(c => c.name).join(', ')}
                        </div>
                        {item.pizza.selectedIngredients.veggies.length > 0 && (
                          <div>
                            <strong>Veggies:</strong> {item.pizza.selectedIngredients.veggies.map(v => v.name).join(', ')}
                          </div>
                        )}
                        {item.pizza.selectedIngredients.meats.length > 0 && (
                          <div>
                            <strong>Meat:</strong> {item.pizza.selectedIngredients.meats.map(m => m.name).join(', ')}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className=\"text-end\">
                      <div className=\"fw-medium\">{formatCurrency(item.totalPrice)}</div>
                      <small className=\"text-muted\">Qty: {item.quantity}</small>
                    </div>
                  </div>
                </div>
              ))}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Cancel Order Modal */}
      <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Cancel Order</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant=\"warning\">
            Are you sure you want to cancel this order? This action cannot be undone.
          </Alert>
          <Form.Group>
            <Form.Label>Reason for cancellation (optional)</Form.Label>
            <Form.Control
              as=\"textarea\"
              rows={3}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder=\"Tell us why you're cancelling...\"
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant=\"secondary\" onClick={() => setShowCancelModal(false)}>
            Keep Order
          </Button>
          <Button 
            variant=\"danger\" 
            onClick={handleCancelOrder}
            disabled={cancelling}
          >
            {cancelling ? (
              <>
                <Spinner size=\"sm\" className=\"me-2\" />
                Cancelling...
              </>
            ) : (
              'Cancel Order'
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Rating Modal */}
      <Modal show={showRatingModal} onHide={() => setShowRatingModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Rate Your Order</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className=\"mb-3\">
              <Form.Label>Rating</Form.Label>
              <div className=\"d-flex gap-1\">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type=\"button\"
                    className={`btn btn-link p-0 fs-3 ${star <= rating ? 'text-warning' : 'text-muted'}`}
                    onClick={() => setRating(star)}
                  >
                    <i className=\"bi bi-star-fill\"></i>
                  </button>
                ))}
              </div>
            </Form.Group>
            <Form.Group>
              <Form.Label>Review (optional)</Form.Label>
              <Form.Control
                as=\"textarea\"
                rows={3}
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder=\"Tell us about your experience...\"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant=\"secondary\" onClick={() => setShowRatingModal(false)}>
            Skip
          </Button>
          <Button variant=\"primary\" onClick={handleRateOrder}>
            Submit Rating
          </Button>
        </Modal.Footer>
      </Modal>

      <style jsx>{`
        .tracking-timeline {
          position: relative;
        }

        .tracking-step {
          display: flex;
          margin-bottom: 2rem;
          position: relative;
        }

        .tracking-step:last-child {
          margin-bottom: 0;
        }

        .step-indicator {
          flex-shrink: 0;
          margin-right: 1rem;
          position: relative;
        }

        .step-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #e9ecef;
          color: #6c757d;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 3px solid #e9ecef;
          font-size: 1rem;
        }

        .tracking-step.completed .step-icon {
          background: #198754;
          color: white;
          border-color: #198754;
        }

        .tracking-step.active .step-icon {
          background: #0d6efd;
          color: white;
          border-color: #0d6efd;
          animation: pulse 2s infinite;
        }

        .step-line {
          position: absolute;
          top: 40px;
          left: 50%;
          transform: translateX(-50%);
          width: 3px;
          height: 32px;
          background: #e9ecef;
        }

        .tracking-step.completed .step-line {
          background: #198754;
        }

        .step-content {
          flex: 1;
          padding-top: 0.5rem;
        }

        .step-title {
          font-weight: 600;
          margin-bottom: 0.25rem;
        }

        .step-message {
          color: #6c757d;
          margin-bottom: 0.5rem;
        }

        .step-time {
          font-size: 0.875rem;
        }

        .tracking-step.completed .step-title {
          color: #198754;
        }

        .tracking-step.active .step-title {
          color: #0d6efd;
          font-weight: 700;
        }

        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
      `}</style>
    </Container>
  );
};

export default OrderTracking;