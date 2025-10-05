import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Alert,
  Spinner,
  Badge,
  Button,
  Form,
  InputGroup,
  Pagination,
  Dropdown,
} from 'react-bootstrap';
import { toast } from 'react-toastify';
import {
  orderAPI,
  OrderSummary,
  OrderStatus,
  formatCurrency,
  formatDate,
  formatRelativeTime,
  formatOrderStatus,
  getOrderStatusColor,
  getOrderStatusIcon,
} from '../../utils/orderApi';

const UserOrders: React.FC = () => {
  const navigate = useNavigate();
  
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalOrders, setTotalOrders] = useState<number>(0);
  const [hasNextPage, setHasNextPage] = useState<boolean>(false);
  const [hasPrevPage, setHasPrevPage] = useState<boolean>(false);
  
  const itemsPerPage = 10;

  useEffect(() => {
    fetchOrders();
  }, [currentPage, statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params: any = {
        page: currentPage,
        limit: itemsPerPage,
      };
      
      if (statusFilter) {
        params.status = statusFilter;
      }

      const response = await orderAPI.getUserOrders(params);
      
      setOrders(response.orders);
      setCurrentPage(response.pagination.currentPage);
      setTotalPages(response.pagination.totalPages);
      setTotalOrders(response.pagination.totalOrders);
      setHasNextPage(response.pagination.hasNextPage);
      setHasPrevPage(response.pagination.hasPrevPage);
      
    } catch (err: any) {
      setError(err.message || 'Failed to fetch orders');
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleStatusFilter = (status: OrderStatus | '') => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleOrderClick = (orderId: string) => {
    navigate(`/orders/${orderId}/track`);
  };

  const handleNewOrder = () => {
    navigate('/customize');
  };

  const getFilteredOrders = (): OrderSummary[] => {
    if (!searchTerm) return orders;
    
    return orders.filter(order =>
      order.orderId.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const getStatusOptions = (): { value: OrderStatus | ''; label: string }[] => [
    { value: '', label: 'All Orders' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'preparing', label: 'Preparing' },
    { value: 'baking', label: 'Baking' },
    { value: 'ready', label: 'Ready' },
    { value: 'out-for-delivery', label: 'Out for Delivery' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Pagination.Item
          key={i}
          active={i === currentPage}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </Pagination.Item>
      );
    }

    return (
      <Pagination className=\"justify-content-center mb-0\">
        <Pagination.First 
          disabled={!hasPrevPage} 
          onClick={() => handlePageChange(1)}
        />
        <Pagination.Prev 
          disabled={!hasPrevPage} 
          onClick={() => handlePageChange(currentPage - 1)}
        />
        
        {startPage > 1 && (
          <>
            <Pagination.Item onClick={() => handlePageChange(1)}>1</Pagination.Item>
            {startPage > 2 && <Pagination.Ellipsis />}
          </>
        )}
        
        {pages}
        
        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <Pagination.Ellipsis />}
            <Pagination.Item onClick={() => handlePageChange(totalPages)}>
              {totalPages}
            </Pagination.Item>
          </>
        )}
        
        <Pagination.Next 
          disabled={!hasNextPage} 
          onClick={() => handlePageChange(currentPage + 1)}
        />
        <Pagination.Last 
          disabled={!hasNextPage} 
          onClick={() => handlePageChange(totalPages)}
        />
      </Pagination>
    );
  };

  if (loading) {
    return (
      <Container className=\"py-5\">
        <div className=\"text-center\">
          <Spinner animation=\"border\" role=\"status\" className=\"me-2\" />
          Loading your orders...
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className=\"py-5\">
        <Alert variant=\"danger\">
          <Alert.Heading>Orders Error</Alert.Heading>
          <p>{error}</p>
          <div>
            <Button variant=\"outline-danger\" className=\"me-2\" onClick={fetchOrders}>
              Try Again
            </Button>
            <Button variant=\"secondary\" onClick={handleNewOrder}>
              Order New Pizza
            </Button>
          </div>
        </Alert>
      </Container>
    );
  }

  const filteredOrders = getFilteredOrders();

  return (
    <Container className=\"py-4\">
      {/* Header */}
      <div className=\"d-flex justify-content-between align-items-center mb-4\">
        <div>
          <h2 className=\"mb-1\">🍕 My Orders</h2>
          <p className=\"text-muted mb-0\">
            {totalOrders > 0 
              ? `You have ${totalOrders} order${totalOrders !== 1 ? 's' : ''}`
              : 'No orders found'
            }
          </p>
        </div>
        <Button variant=\"primary\" onClick={handleNewOrder}>
          <i className=\"bi bi-plus-lg me-2\"></i>
          Order New Pizza
        </Button>
      </div>

      {/* Filters and Search */}
      <Card className=\"mb-4 border-0 shadow-sm\">
        <Card.Body>
          <Row className=\"align-items-end\">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Search Orders</Form.Label>
                <InputGroup>
                  <InputGroup.Text>
                    <i className=\"bi bi-search\"></i>
                  </InputGroup.Text>
                  <Form.Control
                    type=\"text\"
                    placeholder=\"Search by Order ID...\"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </InputGroup>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Filter by Status</Form.Label>
                <Form.Select
                  value={statusFilter}
                  onChange={(e) => handleStatusFilter(e.target.value as OrderStatus | '')}
                >
                  {getStatusOptions().map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={2}>
              <Button variant=\"outline-secondary\" onClick={fetchOrders} className=\"w-100\">
                <i className=\"bi bi-arrow-clockwise me-2\"></i>
                Refresh
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Orders Table */}
      <Card className=\"border-0 shadow-sm\">
        <Card.Body>
          {filteredOrders.length > 0 ? (
            <>
              <div className=\"table-responsive\">
                <Table hover className=\"mb-0\">
                  <thead className=\"table-light\">
                    <tr>
                      <th>Order ID</th>
                      <th>Status</th>
                      <th>Items</th>
                      <th>Total</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order) => (
                      <tr key={order._id} style={{ cursor: 'pointer' }}>
                        <td onClick={() => handleOrderClick(order._id)}>
                          <div>
                            <code className=\"text-primary\">{order.orderId}</code>
                          </div>
                        </td>
                        <td onClick={() => handleOrderClick(order._id)}>
                          <div className=\"d-flex align-items-center\">
                            <i className={`bi bi-${getOrderStatusIcon(order.status)} me-2 text-${getOrderStatusColor(order.status)}`}></i>
                            <Badge bg={getOrderStatusColor(order.status)}>
                              {formatOrderStatus(order.status)}
                            </Badge>
                          </div>
                        </td>
                        <td onClick={() => handleOrderClick(order._id)}>
                          <div>
                            <span className=\"fw-medium\">{order.itemsCount}</span>
                            <span className=\"text-muted ms-1\">
                              item{order.itemsCount !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </td>
                        <td onClick={() => handleOrderClick(order._id)}>
                          <strong>{formatCurrency(order.totalAmount)}</strong>
                        </td>
                        <td onClick={() => handleOrderClick(order._id)}>
                          <div>
                            <div className=\"small\">{formatDate(order.createdAt)}</div>
                            <div className=\"text-muted small\">{formatRelativeTime(order.createdAt)}</div>
                          </div>
                        </td>
                        <td>
                          <div className=\"d-flex gap-1\">
                            <Button
                              variant=\"outline-primary\"
                              size=\"sm\"
                              onClick={() => handleOrderClick(order._id)}
                            >
                              <i className=\"bi bi-eye\"></i>
                            </Button>
                            <Dropdown>
                              <Dropdown.Toggle
                                variant=\"outline-secondary\"
                                size=\"sm\"
                                id={`dropdown-${order._id}`}
                              >
                                <i className=\"bi bi-three-dots\"></i>
                              </Dropdown.Toggle>
                              <Dropdown.Menu>
                                <Dropdown.Item onClick={() => handleOrderClick(order._id)}>
                                  <i className=\"bi bi-eye me-2\"></i>
                                  View Details
                                </Dropdown.Item>
                                <Dropdown.Item onClick={() => navigate(`/orders/${order._id}/track`)}>
                                  <i className=\"bi bi-geo-alt me-2\"></i>
                                  Track Order
                                </Dropdown.Item>
                                <Dropdown.Divider />
                                <Dropdown.Item onClick={() => window.print()}>
                                  <i className=\"bi bi-printer me-2\"></i>
                                  Print Receipt
                                </Dropdown.Item>
                              </Dropdown.Menu>
                            </Dropdown>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
              
              {totalPages > 1 && (
                <div className=\"d-flex justify-content-between align-items-center mt-4\">
                  <div className=\"text-muted small\">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to{' '}
                    {Math.min(currentPage * itemsPerPage, totalOrders)} of {totalOrders} orders
                  </div>
                  {renderPagination()}
                </div>
              )}
            </>
          ) : (
            <div className=\"text-center py-5\">
              <div className=\"mb-4\">
                <i className=\"bi bi-inbox display-1 text-muted\"></i>
              </div>
              <h4 className=\"text-muted\">No orders found</h4>
              <p className=\"text-muted mb-4\">
                {searchTerm || statusFilter 
                  ? 'Try adjusting your search or filter criteria'
                  : \"You haven't placed any orders yet. Ready to order your first delicious pizza?\"
                }
              </p>
              {!searchTerm && !statusFilter && (
                <Button variant=\"primary\" onClick={handleNewOrder}>
                  <i className=\"bi bi-plus-lg me-2\"></i>
                  Order Your First Pizza
                </Button>
              )}
            </div>
          )}
        </Card.Body>
      </Card>

      {orders.length > 0 && (
        <div className=\"mt-4 text-center\">
          <p className=\"text-muted small mb-0\">
            <i className=\"bi bi-info-circle me-1\"></i>
            Click on any order to view detailed tracking information
          </p>
        </div>
      )}
    </Container>
  );
};

export default UserOrders;