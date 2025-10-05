import React, { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Badge,
  Button,
  Modal,
  Form,
  Alert,
  Spinner,
  InputGroup,
  Tabs,
  Tab,
} from 'react-bootstrap';
import { toast } from 'react-toastify';
import {
  adminAPI,
  InventoryOverview,
  InventoryItem,
  formatCurrency,
} from '../../utils/adminApi';

const InventoryManagement: React.FC = () => {
  const [inventoryData, setInventoryData] = useState<InventoryOverview | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [updating, setUpdating] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('all');
  
  // Form state
  const [formData, setFormData] = useState({
    stock: 0,
    threshold: 0,
    price: 0,
    isAvailable: true,
  });

  useEffect(() => {
    fetchInventoryData();
  }, []);

  const fetchInventoryData = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await adminAPI.getInventoryOverview();
      setInventoryData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch inventory data');
      toast.error('Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (item: InventoryItem) => {
    setSelectedItem(item);
    setFormData({
      stock: item.stock,
      threshold: item.threshold,
      price: item.price,
      isAvailable: item.isAvailable,
    });
    setShowEditModal(true);
  };

  const handleFormChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleUpdateItem = async () => {
    if (!selectedItem) return;

    try {
      setUpdating(true);
      
      await adminAPI.updateInventoryItem(
        selectedItem.type,
        selectedItem._id,
        formData
      );
      
      toast.success(`${selectedItem.name} updated successfully`);
      setShowEditModal(false);
      setSelectedItem(null);
      await fetchInventoryData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update item');
    } finally {
      setUpdating(false);
    }
  };

  const triggerInventoryCheck = async () => {
    try {
      await adminAPI.triggerInventoryCheck();
      toast.success('Inventory check completed');
      await fetchInventoryData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to run inventory check');
    }
  };

  const getStockStatus = (item: InventoryItem): { badge: string; text: string } => {
    if (item.stock === 0) return { badge: 'danger', text: 'Out of Stock' };
    if (item.stock <= item.threshold) return { badge: 'warning', text: 'Low Stock' };
    return { badge: 'success', text: 'In Stock' };
  };

  const getAllItems = (): InventoryItem[] => {
    if (!inventoryData) return [];
    return [
      ...inventoryData.inventory.bases,
      ...inventoryData.inventory.sauces,
      ...inventoryData.inventory.cheeses,
      ...inventoryData.inventory.veggies,
      ...inventoryData.inventory.meats,
    ];
  };

  const getFilteredItems = (): InventoryItem[] => {
    let items = getAllItems();

    // Filter by search term
    if (searchTerm) {
      items = items.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by tab
    if (activeTab !== 'all') {
      switch (activeTab) {
        case 'low-stock':
          items = items.filter(item => item.stock <= item.threshold && item.stock > 0);
          break;
        case 'out-of-stock':
          items = items.filter(item => item.stock === 0);
          break;
        case 'unavailable':
          items = items.filter(item => !item.isAvailable);
          break;
      }
    }

    return items.sort((a, b) => {
      // Sort by stock status (out of stock first, then low stock)
      const aStatus = getStockStatus(a);
      const bStatus = getStockStatus(b);
      
      if (aStatus.badge === 'danger' && bStatus.badge !== 'danger') return -1;
      if (bStatus.badge === 'danger' && aStatus.badge !== 'danger') return 1;
      if (aStatus.badge === 'warning' && bStatus.badge === 'success') return -1;
      if (bStatus.badge === 'warning' && aStatus.badge === 'success') return 1;
      
      return a.name.localeCompare(b.name);
    });
  };

  if (loading) {
    return (
      <Container fluid className=\"py-4\">
        <div className=\"text-center\">
          <Spinner animation=\"border\" role=\"status\" className=\"me-2\" />
          Loading inventory...
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container fluid className=\"py-4\">
        <Alert variant=\"danger\">
          <Alert.Heading>Inventory Error</Alert.Heading>
          <p>{error}</p>
          <button className=\"btn btn-outline-danger\" onClick={fetchInventoryData}>
            Try Again
          </button>
        </Alert>
      </Container>
    );
  }

  if (!inventoryData) {
    return null;
  }

  const { statistics } = inventoryData;
  const filteredItems = getFilteredItems();

  return (
    <Container fluid className=\"py-4\">
      {/* Header */}
      <div className=\"d-flex justify-content-between align-items-center mb-4\">
        <div>
          <h2 className=\"mb-1\">📦 Inventory Management</h2>
          <p className=\"text-muted mb-0\">Monitor and manage ingredient stock levels</p>
        </div>
        <div className=\"d-flex gap-2\">
          <Button variant=\"outline-secondary\" onClick={triggerInventoryCheck}>
            <i className=\"bi bi-search me-1\"></i>
            Run Check
          </Button>
          <Button variant=\"outline-primary\" onClick={fetchInventoryData}>
            <i className=\"bi bi-arrow-clockwise me-1\"></i>
            Refresh
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <Row className=\"mb-4\">
        <Col md={3} className=\"mb-3\">
          <Card className=\"border-0 shadow-sm h-100\">
            <Card.Body className=\"text-center\">
              <div className=\"display-6 text-primary mb-2\">📊</div>
              <h5 className=\"text-muted\">Total Items</h5>
              <h3>{statistics.totalItems}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className=\"mb-3\">
          <Card className=\"border-0 shadow-sm h-100\">
            <Card.Body className=\"text-center\">
              <div className=\"display-6 text-success mb-2\">✅</div>
              <h5 className=\"text-muted\">Available</h5>
              <h3>{statistics.availableItems}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className=\"mb-3\">
          <Card className=\"border-0 shadow-sm h-100\">
            <Card.Body className=\"text-center\">
              <div className=\"display-6 text-warning mb-2\">⚠️</div>
              <h5 className=\"text-muted\">Low Stock</h5>
              <h3>{statistics.lowStockItems}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className=\"mb-3\">
          <Card className=\"border-0 shadow-sm h-100\">
            <Card.Body className=\"text-center\">
              <div className=\"display-6 text-danger mb-2\">🚨</div>
              <h5 className=\"text-muted\">Out of Stock</h5>
              <h3>{statistics.outOfStockItems}</h3>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Search and Filters */}
      <Row className=\"mb-4\">
        <Col lg={6}>
          <InputGroup>
            <InputGroup.Text>
              <i className=\"bi bi-search\"></i>
            </InputGroup.Text>
            <Form.Control
              type=\"text\"
              placeholder=\"Search items by name, category, or type...\"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Col>
        <Col lg={6}>
          <Tabs
            activeKey={activeTab}
            onSelect={(tab) => setActiveTab(tab || 'all')}
            className=\"border-bottom-0\"
          >
            <Tab eventKey=\"all\" title={`All Items (${getAllItems().length})`} />
            <Tab eventKey=\"low-stock\" title={`Low Stock (${statistics.lowStockItems})`} />
            <Tab eventKey=\"out-of-stock\" title={`Out of Stock (${statistics.outOfStockItems})`} />
            <Tab eventKey=\"unavailable\" title=\"Unavailable\" />
          </Tabs>
        </Col>
      </Row>

      {/* Inventory Table */}
      <Card className=\"border-0 shadow-sm\">
        <Card.Body>
          {filteredItems.length > 0 ? (
            <div className=\"table-responsive\">
              <Table hover className=\"mb-0\">
                <thead className=\"table-light\">
                  <tr>
                    <th>Item</th>
                    <th>Type</th>
                    <th>Category</th>
                    <th>Stock</th>
                    <th>Threshold</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Available</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item) => {
                    const stockStatus = getStockStatus(item);
                    return (
                      <tr key={item._id}>
                        <td>
                          <div className=\"fw-medium\">{item.name}</div>
                        </td>
                        <td>
                          <Badge bg=\"secondary\" className=\"text-capitalize\">
                            {item.type.replace('Pizza ', '')}
                          </Badge>
                        </td>
                        <td>{item.category}</td>
                        <td>
                          <span className={`fw-bold ${item.stock === 0 ? 'text-danger' : 
                            item.stock <= item.threshold ? 'text-warning' : 'text-success'}`}>
                            {item.stock}
                          </span>
                        </td>
                        <td>{item.threshold}</td>
                        <td>{formatCurrency(item.price)}</td>
                        <td>
                          <Badge bg={stockStatus.badge}>
                            {stockStatus.text}
                          </Badge>
                        </td>
                        <td>
                          <Badge bg={item.isAvailable ? 'success' : 'secondary'}>
                            {item.isAvailable ? 'Yes' : 'No'}
                          </Badge>
                        </td>
                        <td>
                          <Button
                            size=\"sm\"
                            variant=\"outline-primary\"
                            onClick={() => handleEditClick(item)}
                          >
                            <i className=\"bi bi-pencil\"></i>
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>
          ) : (
            <div className=\"text-center text-muted py-4\">
              <i className=\"bi bi-inbox display-4 mb-2\"></i>
              <p className=\"mb-0\">No items found matching your criteria</p>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Edit Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className=\"bi bi-pencil-square me-2\"></i>
            Edit {selectedItem?.name}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedItem && (
            <Form>
              <Row>
                <Col md={6}>
                  <Form.Group className=\"mb-3\">
                    <Form.Label>Stock Quantity</Form.Label>
                    <Form.Control
                      type=\"number\"
                      min=\"0\"
                      value={formData.stock}
                      onChange={(e) => handleFormChange('stock', parseInt(e.target.value) || 0)}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className=\"mb-3\">
                    <Form.Label>Threshold</Form.Label>
                    <Form.Control
                      type=\"number\"
                      min=\"0\"
                      value={formData.threshold}
                      onChange={(e) => handleFormChange('threshold', parseInt(e.target.value) || 0)}
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <Form.Group className=\"mb-3\">
                <Form.Label>Price (₹)</Form.Label>
                <Form.Control
                  type=\"number\"
                  min=\"0\"
                  step=\"0.01\"
                  value={formData.price}
                  onChange={(e) => handleFormChange('price', parseFloat(e.target.value) || 0)}
                />
              </Form.Group>

              <Form.Group className=\"mb-3\">
                <Form.Check
                  type=\"switch\"
                  id=\"isAvailable\"
                  label=\"Available for ordering\"
                  checked={formData.isAvailable}
                  onChange={(e) => handleFormChange('isAvailable', e.target.checked)}
                />
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant=\"secondary\" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button 
            variant=\"primary\" 
            onClick={handleUpdateItem}
            disabled={updating}
          >
            {updating ? (
              <>
                <Spinner size=\"sm\" className=\"me-2\" />
                Updating...
              </>
            ) : (
              'Update Item'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default InventoryManagement;