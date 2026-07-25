import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [leads, setLeads] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [expandedMessageId, setExpandedMessageId] = useState(null);
  const navigate = useNavigate();

  const toggleMessage = (id) => {
    setExpandedMessageId(expandedMessageId === id ? null : id);
  };

  const fetchLeads = async (searchQuery = '') => {
    try {
      const response = await axios.get(`http://localhost:5000/api/leads?search=${searchQuery}`);
      setLeads(response.data);
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        navigate('/login');
      }
      console.error('Failed to fetch leads', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [navigate]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchLeads(search);
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await axios.patch(`http://localhost:5000/api/leads/${id}/status`, { status: newStatus });
      
      // Update local state
      setLeads(leads.map(lead => lead.id === id ? { ...lead, status: newStatus } : lead));
    } catch (error) {
      console.error('Failed to update status', error);
      alert('Failed to update status');
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:5000/api/auth/logout');
    } catch (e) {
      console.error('Logout failed', e);
    }
    navigate('/login');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'NEW': return 'status-new';
      case 'CONTACTED': return 'status-contacted';
      case 'CLOSED': return 'status-closed';
      default: return '';
    }
  };

  const getAnalytics = () => {
    const statusCounts = leads.reduce((acc, lead) => {
      acc[lead.status] = (acc[lead.status] || 0) + 1;
      return acc;
    }, { NEW: 0, CONTACTED: 0, CLOSED: 0 });

    const budgetCounts = leads.reduce((acc, lead) => {
      if (lead.budget_range === '<$5k' || lead.budget_range === '$5k-$10k') {
        acc['Under $10k'] = (acc['Under $10k'] || 0) + 1;
      } else {
        acc['Over $10k'] = (acc['Over $10k'] || 0) + 1;
      }
      return acc;
    }, { 'Under $10k': 0, 'Over $10k': 0 });

    return { statusCounts, budgetCounts };
  };

  if (loading) {
    return <div className="loading-state">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard-container animate-fade-in">
      <div className="dashboard-header">
        <div>
          <h1>LeadDesk Mini</h1>
          <p>Manage your incoming consultation requests</p>
        </div>
        <button onClick={handleLogout} className="btn-secondary">Logout</button>
      </div>

      <div className="analytics-grid">
        <div className="glass-panel analytics-card">
          <h3>Lead Funnel</h3>
          <div className="stats-row">
            <div className="stat-item">
              <span className="stat-value">{getAnalytics().statusCounts.NEW}</span>
              <span className="stat-label status-new">New</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{getAnalytics().statusCounts.CONTACTED}</span>
              <span className="stat-label status-contacted">Contacted</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{getAnalytics().statusCounts.CLOSED}</span>
              <span className="stat-label status-closed">Closed</span>
            </div>
          </div>
        </div>
        
        <div className="glass-panel analytics-card">
          <h3>Pipeline Value</h3>
          <div className="stats-row">
            <div className="stat-item">
              <span className="stat-value">{getAnalytics().budgetCounts['Under $10k']}</span>
              <span className="stat-label">Under $10k</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{getAnalytics().budgetCounts['Over $10k']}</span>
              <span className="stat-label">Over $10k</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{leads.length}</span>
              <span className="stat-label">Total Leads</span>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-panel dashboard-content">
        <div className="dashboard-controls">
          <form onSubmit={handleSearch} className="search-form">
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="btn-primary">Search</button>
          </form>
          <div className="stats-pill">
            Total Leads: {leads.length}
          </div>
        </div>

        <div className="table-responsive">
          <table className="leads-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Name</th>
                <th>Email</th>
                <th>Source</th>
                <th>Budget</th>
                <th>Message</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {leads.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty-state">No leads found.</td>
                </tr>
              ) : (
                leads.map(lead => (
                  <tr key={lead.id}>
                    <td className="date-cell">
                      {new Date(lead.created_at).toLocaleDateString()}
                    </td>
                    <td className="font-medium">{lead.name}</td>
                    <td>{lead.email}</td>
                    <td>{lead.source || '-'}</td>
                    <td><span className="budget-pill">{lead.budget_range}</span></td>
                    <td 
                      className={`message-cell ${expandedMessageId === lead.id ? 'expanded' : ''}`} 
                      onClick={() => toggleMessage(lead.id)}
                    >
                      {expandedMessageId === lead.id || lead.message.length <= 50 ? (
                        lead.message
                      ) : (
                        <>
                          {lead.message.substring(0, 50)}...
                          <span className="read-more">read more</span>
                        </>
                      )}
                    </td>
                    <td>
                      <select 
                        value={lead.status} 
                        onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                        className={`status-select ${getStatusColor(lead.status)}`}
                      >
                        <option value="NEW">New</option>
                        <option value="CONTACTED">Contacted</option>
                        <option value="CLOSED">Closed</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
