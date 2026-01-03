import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { leadService } from '../services/leadService';
import { Modal } from '../components/Modal';
import './Leads.css';

const SECTORS = [
  'Healthcare', 'Real Estate', 'SaaS', 'Education', 'E-commerce',
  'Finance', 'Manufacturing', 'Retail', 'Hospitality', 'Technology', 'Other'
];

const STATUSES = [
  'New', 'Contacted', 'Interested', 'Not Interested', 'Follow-Up', 'Converted', 'Lost'
];

const SOURCES = [
  'Google Maps', 'LinkedIn', 'Website', 'Referral', 'Cold Email', 'Other'
];

export const Leads = () => {
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredLeads, setFilteredLeads] = useState([]);
  
  // Modal states
  const [showNewLead, setShowNewLead] = useState(false);
  const [showEditLead, setShowEditLead] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    company_name: '',
    sector: '',
    website_url: '',
    email: '',
    mobile_number: '',
    full_address: '',
    source: '',
  });

  // Filter state
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    sector: '',
  });

  useEffect(() => {
    fetchLeads();
  }, [filters]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const data = await leadService.listLeads({
        search: filters.search || undefined,
        status: filters.status || undefined,
        sector: filters.sector || undefined,
        limit: 100,
      });
      setLeads(data.leads);
      setFilteredLeads(data.leads);
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateLead = async (e) => {
    e.preventDefault();
    try {
      const newLead = await leadService.createLead(formData);
      setLeads([newLead, ...leads]);
      setFormData({
        company_name: '',
        sector: '',
        website_url: '',
        email: '',
        mobile_number: '',
        full_address: '',
        source: '',
      });
      setShowNewLead(false);
      alert('Lead created successfully!');
    } catch (error) {
      alert('Error creating lead: ' + error.message);
    }
  };

  const handleEditLead = async (e) => {
    e.preventDefault();
    try {
      const updated = await leadService.updateLead(selectedLead._id, formData);
      setLeads(leads.map(l => l._id === selectedLead._id ? updated : l));
      setShowEditLead(false);
      setSelectedLead(null);
      alert('Lead updated successfully!');
    } catch (error) {
      alert('Error updating lead: ' + error.message);
    }
  };

  const handleDeleteLead = async (leadId) => {
    if (!confirm('Are you sure you want to delete this lead?')) return;
    
    try {
      await leadService.deleteLead(leadId);
      setLeads(leads.filter(l => l._id !== leadId));
      alert('Lead deleted successfully!');
    } catch (error) {
      alert('Error deleting lead: ' + error.message);
    }
  };

  const openEditModal = (lead) => {
    setSelectedLead(lead);
    setFormData({
      company_name: lead.company_name,
      sector: lead.sector,
      website_url: lead.website_url || '',
      email: lead.email || '',
      mobile_number: lead.mobile_number || '',
      full_address: lead.full_address || '',
      source: lead.source,
    });
    setShowEditLead(true);
  };

  const handleStatusChange = async (leadId, newStatus) => {
    try {
      const updated = await leadService.updateLead(leadId, { status: newStatus });
      setLeads(leads.map(l => l._id === leadId ? updated : l));
    } catch (error) {
      alert('Error updating status: ' + error.message);
    }
  };

  return (
    <div className="leads-page">
      <div className="leads-header">
        <h1>Leads</h1>
        <button
          className="btn btn-primary"
          onClick={() => {
            setFormData({
              company_name: '',
              sector: '',
              website_url: '',
              email: '',
              mobile_number: '',
              full_address: '',
              source: '',
            });
            setShowNewLead(true);
          }}
        >
          + New Lead
        </button>
      </div>

      <div className="filters">
        <input
          type="text"
          placeholder="Search by company, email, or phone..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          className="filter-input"
        />
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="filter-select"
        >
          <option value="">All Statuses</option>
          {STATUSES.map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
        <select
          value={filters.sector}
          onChange={(e) => setFilters({ ...filters, sector: e.target.value })}
          className="filter-select"
        >
          <option value="">All Sectors</option>
          {SECTORS.map(sector => (
            <option key={sector} value={sector}>{sector}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <p>Loading leads...</p>
      ) : leads.length === 0 ? (
        <p className="empty-state">No leads found. Create your first lead!</p>
      ) : (
        <div className="leads-table-container">
          <table className="leads-table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Sector</th>
                <th>Contact</th>
                <th>Status</th>
                <th>Owner</th>
                <th>Last Contacted</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map(lead => (
                <tr key={lead._id} onClick={() => openEditModal(lead)} className="lead-row">
                  <td className="company-cell">{lead.company_name}</td>
                  <td>{lead.sector}</td>
                  <td className="contact-cell">
                    {lead.email && <a href={`mailto:${lead.email}`}>{lead.email}</a>}
                    {lead.mobile_number && <p>{lead.mobile_number}</p>}
                  </td>
                  <td>
                    <select
                      className={`status-select status-${lead.status.toLowerCase().replace(/[- ]/g, '')}`}
                      value={lead.status}
                      onChange={(e) => handleStatusChange(lead._id, e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {STATUSES.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </td>
                  <td>{lead.assigned_to}</td>
                  <td>
                    {lead.last_contacted_date 
                      ? new Date(lead.last_contacted_date).toLocaleDateString() 
                      : '-'}
                  </td>
                  <td className="actions-cell">
                    <button
                      className="btn-icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteLead(lead._id);
                      }}
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* New Lead Modal */}
      <Modal
        isOpen={showNewLead}
        title="Create New Lead"
        onClose={() => setShowNewLead(false)}
        footer={
          <div className="modal-actions">
            <button className="btn btn-secondary" onClick={() => setShowNewLead(false)}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleCreateLead}>
              Create Lead
            </button>
          </div>
        }
      >
        <form className="lead-form">
          <div className="form-group">
            <label>Company Name *</label>
            <input
              type="text"
              name="company_name"
              value={formData.company_name}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Sector *</label>
              <select
                name="sector"
                value={formData.sector}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Sector</option>
                {SECTORS.map(sector => (
                  <option key={sector} value={sector}>{sector}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Source *</label>
              <select
                name="source"
                value={formData.source}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Source</option>
                {SOURCES.map(source => (
                  <option key={source} value={source}>{source}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Website URL</label>
            <input
              type="url"
              name="website_url"
              value={formData.website_url}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label>Mobile Number</label>
              <input
                type="tel"
                name="mobile_number"
                value={formData.mobile_number}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Full Address</label>
            <textarea
              name="full_address"
              value={formData.full_address}
              onChange={handleInputChange}
              rows="3"
            />
          </div>
        </form>
      </Modal>

      {/* Edit Lead Modal */}
      <Modal
        isOpen={showEditLead}
        title="Edit Lead"
        onClose={() => setShowEditLead(false)}
        footer={
          <div className="modal-actions">
            <button className="btn btn-secondary" onClick={() => setShowEditLead(false)}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleEditLead}>
              Save Changes
            </button>
          </div>
        }
      >
        <form className="lead-form">
          <div className="form-group">
            <label>Company Name *</label>
            <input
              type="text"
              name="company_name"
              value={formData.company_name}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Sector *</label>
              <select
                name="sector"
                value={formData.sector}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Sector</option>
                {SECTORS.map(sector => (
                  <option key={sector} value={sector}>{sector}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Source *</label>
              <select
                name="source"
                value={formData.source}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Source</option>
                {SOURCES.map(source => (
                  <option key={source} value={source}>{source}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Website URL</label>
            <input
              type="url"
              name="website_url"
              value={formData.website_url}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label>Mobile Number</label>
              <input
                type="tel"
                name="mobile_number"
                value={formData.mobile_number}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Full Address</label>
            <textarea
              name="full_address"
              value={formData.full_address}
              onChange={handleInputChange}
              rows="3"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};
