import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Alert, Spinner, Badge, Table } from 'react-bootstrap';
import { toast } from 'react-toastify';
import {
  adminAPI,
  DashboardOverview,
  formatCurrency,
  formatDate,
  formatOrderStatus,
  getStatusColor,
} from '../../utils/adminApi';

const AdminDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardOverview | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await adminAPI.getDashboardOverview();
      setDashboardData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch dashboard data');
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const refreshDashboard = () => {
    fetchDashboardData();
    toast.info('Dashboard refreshed');
  };

  if (loading) {
    return (
      <Container fluid className=\"py-4\">
        <div className=\"text-center\">
          <Spinner animation=\"border\" role=\"status\" className=\"me-2\" />
          Loading dashboard...
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container fluid className=\"py-4\">
        <Alert variant=\"danger\">
          <Alert.Heading>Dashboard Error</Alert.Heading>
          <p>{error}</p>
          <button className=\"btn btn-outline-danger\" onClick={refreshDashboard}>
            Try Again
          </button>
        </Alert>
      </Container>
    );
  }

  if (!dashboardData) {
    return null;
  }

  const { overview, orderStatusDistribution, lowStockItems, recentOrders } = dashboardData;

  return (
    <Container fluid className=\"py-4\">
      {/* Dashboard Header */}\n      <div className=\"d-flex justify-content-between align-items-center mb-4\">
        <div>
          <h2 className=\"mb-1\">🍕 Admin Dashboard</h2>
          <p className=\"text-muted mb-0\">Monitor your pizza ordering system</p>
        </div>
        <button className=\"btn btn-outline-primary\" onClick={refreshDashboard}>
          <i className=\"bi bi-arrow-clockwise me-2\"></i>
          Refresh
        </button>
      </div>

      {/* Key Metrics Cards */}
      <Row className=\"mb-4\">
        <Col md={6} lg={3} className=\"mb-3\">
          <Card className=\"h-100 border-0 shadow-sm\">
            <Card.Body className=\"text-center\">
              <div className=\"display-6 text-primary mb-2\">👥</div>
              <h5 className=\"card-title text-muted\">Total Users</h5>
              <h3 className=\"mb-0\">{overview.totalUsers.toLocaleString()}</h3>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} lg={3} className=\"mb-3\">
          <Card className=\"h-100 border-0 shadow-sm\">
            <Card.Body className=\"text-center\">
              <div className=\"display-6 text-success mb-2\">📦</div>
              <h5 className=\"card-title text-muted\">Total Orders</h5>
              <h3 className=\"mb-0\">{overview.totalOrders.toLocaleString()}</h3>
              <small className=\"text-success\">
                {overview.todaysOrders} today
              </small>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} lg={3} className=\"mb-3\">
          <Card className=\"h-100 border-0 shadow-sm\">
            <Card.Body className=\"text-center\">
              <div className=\"display-6 text-warning mb-2\">💰</div>
              <h5 className=\"card-title text-muted\">Total Revenue</h5>
              <h3 className=\"mb-0\">{formatCurrency(overview.totalRevenue)}</h3>
              <small className=\"text-warning\">
                {formatCurrency(overview.todaysRevenue)} today
              </small>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} lg={3} className=\"mb-3\">
          <Card className=\"h-100 border-0 shadow-sm\">
            <Card.Body className=\"text-center\">
              <div className=\"display-6 text-info mb-2\">📊</div>
              <h5 className=\"card-title text-muted\">Avg Order Value</h5>
              <h3 className=\"mb-0\">{formatCurrency(overview.averageOrderValue)}</h3>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        {/* Order Status Distribution */}
        <Col lg={6} className=\"mb-4\">
          <Card className=\"h-100 border-0 shadow-sm\">
            <Card.Header className=\"bg-white border-bottom-0 pb-0\">
              <Card.Title className=\"mb-0\">📈 Order Status Distribution</Card.Title>
            </Card.Header>
            <Card.Body>
              {orderStatusDistribution.length > 0 ? (
                <div className=\"row g-2\">
                  {orderStatusDistribution.map((status) => (
                    <div key={status._id} className=\"col-md-6 mb-2\">
                      <div className=\"d-flex justify-content-between align-items-center p-2 rounded\" 
                           style={{backgroundColor: '#f8f9fa'}}>
                        <div>
                          <Badge bg={getStatusColor(status._id)} className=\"me-2\">
                            {formatOrderStatus(status._id)}
                          </Badge>
                        </div>
                        <strong>{status.count}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className=\"text-center text-muted py-3\">
                  No order data available
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Low Stock Alert */}
        <Col lg={6} className=\"mb-4\">
          <Card className=\"h-100 border-0 shadow-sm\">
            <Card.Header className=\"bg-white border-bottom-0 pb-0\">
              <Card.Title className=\"mb-0 d-flex align-items-center\">
                ⚠️ Low Stock Alert
                {lowStockItems.length > 0 && (
                  <Badge bg=\"warning\" className=\"ms-2\">
                    {lowStockItems.length}
                  </Badge>
                )}
              </Card.Title>
            </Card.Header>
            <Card.Body>
              {lowStockItems.length > 0 ? (
                <div className=\"list-group list-group-flush\">
                  {lowStockItems.slice(0, 5).map((item) => (
                    <div key={item._id} className=\"list-group-item px-0 border-0\">
                      <div className=\"d-flex justify-content-between align-items-center\">
                        <div>
                          <h6 className=\"mb-1\">{item.name}</h6>
                          <small className=\"text-muted\">{item.type} • {item.category}</small>
                        </div>
                        <div className=\"text-end\">
                          <Badge bg={item.stock === 0 ? 'danger' : 'warning'}>
                            {item.stock} / {item.threshold}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                  {lowStockItems.length > 5 && (
                    <div className=\"text-center mt-2\">
                      <small className=\"text-muted\">
                        ...and {lowStockItems.length - 5} more items
                      </small>
                    </div>
                  )}
                </div>
              ) : (
                <div className=\"text-center text-success py-3\">
                  <i className=\"bi bi-check-circle display-4 mb-2\"></i>
                  <p className=\"mb-0\">All items are well stocked!</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Recent Orders */}
      <Row>
        <Col lg={12}>
          <Card className=\"border-0 shadow-sm\">
            <Card.Header className=\"bg-white border-bottom-0 pb-0\">
              <Card.Title className=\"mb-0\">📋 Recent Orders</Card.Title>
            </Card.Header>
            <Card.Body>
              {recentOrders.length > 0 ? (
                <div className=\"table-responsive\">
                  <Table hover className=\"mb-0\">
                    <thead className=\"table-light\">
                      <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map((order) => (
                        <tr key={order._id}>
                          <td>
                            <code className=\"text-primary\">{order.orderId}</code>
                          </td>
                          <td>
                            <div>
                              <div className=\"fw-medium\">{order.userId.name}</div>
                              <small className=\"text-muted\">{order.userId.email}</small>
                            </div>
                          </td>
                          <td>
                            <strong>{formatCurrency(order.totalAmount)}</strong>
                          </td>
                          <td>
                            <Badge bg={getStatusColor(order.status)}>
                              {formatOrderStatus(order.status)}
                            </Badge>
                          </td>
                          <td>
                            <small>{formatDate(order.createdAt)}</small>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              ) : (
                <div className=\"text-center text-muted py-4\">
                  <i className=\"bi bi-inbox display-4 mb-2\"></i>
                  <p className=\"mb-0\">No recent orders</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminDashboard;