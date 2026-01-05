import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { leadService } from '../services/leadService';
import { Modal } from '../components/Modal';
import './Leads.css';

const SECTORS = [
  'Healthcare', 'Real Estate', 'SaaS', 'Education', 'E-commerce',
  'Finance', 'Manufacturing', 'Retail', 'Hospitality', 'Restaurant', 'Technology', 'Other'
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
  const [toast, setToast] = useState(null);
  
  // Modal states
  const [showNewLead, setShowNewLead] = useState(false);
  const [showEditLead, setShowEditLead] = useState(false);
  const [showRemarkModal, setShowRemarkModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [remarkText, setRemarkText] = useState('');
  const [remarkLeadId, setRemarkLeadId] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    company_name: '',
    sector: '',
    website_url: '',
    email: '',
    mobile_number: '',
    full_address: '',
    source: '',
    next_follow_up_date: '',
    latest_reply_notes: '',
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

  const showToast = (message, type = 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleCreateLead = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.company_name) {
      showToast('Please enter company name');
      return;
    }
    if (!formData.sector) {
      showToast('Please select a sector');
      return;
    }
    if (!formData.source) {
      showToast('Please select a source');
      return;
    }

    try {
      const payload = { ...formData };
      if (!payload.next_follow_up_date) delete payload.next_follow_up_date;
      if (!payload.latest_reply_notes) delete payload.latest_reply_notes;
      const newLead = await leadService.createLead(payload);
      setLeads([newLead, ...leads]);
      setFormData({
        company_name: '',
        sector: '',
        website_url: '',
        email: '',
        mobile_number: '',
        full_address: '',
        source: '',
        next_follow_up_date: '',
        latest_reply_notes: '',
      });
      setShowNewLead(false);
      await fetchLeads();
    } catch (error) {
      console.error('Error creating lead:', error);
      const errorMsg = error.response?.data?.detail || error.message || 'Error creating lead';
      showToast('Error creating lead: ' + errorMsg);
    }
  };

  const handleEditLead = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      if (!payload.next_follow_up_date) delete payload.next_follow_up_date;
      if (!payload.latest_reply_notes) delete payload.latest_reply_notes;
      const updated = await leadService.updateLead(selectedLead._id, payload);
      setLeads(leads.map(l => l._id === selectedLead._id ? updated : l));
      setShowEditLead(false);
      setSelectedLead(null);
      await fetchLeads();
    } catch (error) {
      showToast('Error updating lead: ' + error.message);
    }
  };

  const handleDeleteLead = async (leadId) => {
    if (!confirm('Are you sure you want to delete this lead?')) return;
    
    try {
      await leadService.deleteLead(leadId);
      setLeads(leads.filter(l => l._id !== leadId));
      await fetchLeads();
    } catch (error) {
      showToast('Error deleting lead: ' + error.message);
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
      next_follow_up_date: lead.next_follow_up_date ? lead.next_follow_up_date.split('T')[0] : '',
      latest_reply_notes: lead.latest_reply_notes || '',
    });
    setShowEditLead(true);
  };

  const openRemarkModal = (lead) => {
    setRemarkLeadId(lead._id);
    setRemarkText(lead.latest_reply_notes || '');
    setShowRemarkModal(true);
  };

  const handleSaveRemark = async () => {
    if (!remarkLeadId) return;
    try {
      const updated = await leadService.updateLead(remarkLeadId, { latest_reply_notes: remarkText });
      setLeads(leads.map(l => l._id === remarkLeadId ? updated : l));
      setShowRemarkModal(false);
      setRemarkLeadId(null);
      setRemarkText('');
      await fetchLeads();
    } catch (error) {
      showToast('Error saving remark: ' + error.message);
    }
  };

  const handleStatusChange = async (leadId, newStatus) => {
    try {
      console.log('Updating lead status:', leadId, 'to:', newStatus);
      const updated = await leadService.updateLead(leadId, { status: newStatus });
      console.log('Status update response:', updated);
      
      // Update the leads array with the new lead data
      setLeads(leads.map(l => {
        if (l._id === leadId) {
          console.log('Old lead:', l);
          console.log('New lead:', updated);
          return updated;
        }
        return l;
      }));
      
      // Force a refresh of the table
      await fetchLeads();
    } catch (error) {
      console.error('Status change error:', error);
      showToast('Error updating status: ' + error.message);
    }
  };

  const handleReminderChange = async (leadId, dateValue) => {
    try {
      const payload = dateValue ? { next_follow_up_date: dateValue } : { next_follow_up_date: null };
      const updated = await leadService.updateLead(leadId, payload);
      const updatedList = leads.map(l => l._id === leadId ? updated : l);
      setLeads(updatedList);
      setFilteredLeads(updatedList);
      await fetchLeads();
    } catch (error) {
      console.error('Next reminder change error:', error);
      showToast('Error updating next reminder: ' + error.message);
    }
  };

  return (
    <div className="leads-page">
      {/* Toast Notification */}
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.message}
        </div>
      )}

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
              next_follow_up_date: '',
              latest_reply_notes: '',
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
                <th>Next Reminder</th>
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
                    <input
                      type="date"
                      value={lead.next_follow_up_date ? lead.next_follow_up_date.split('T')[0] : ''}
                      onChange={(e) => handleReminderChange(lead._id, e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      onFocus={(e) => e.stopPropagation()}
                      className="inline-date"
                    />
                  </td>
                  <td className="actions-cell">
                    <button
                      className="btn-small"
                      onClick={(e) => {
                        e.stopPropagation();
                        openRemarkModal(lead);
                      }}
                    >
                      Remarks
                    </button>
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

          <div className="form-group">
            <label>Next Reminder</label>
            <input
              type="date"
              name="next_follow_up_date"
              value={formData.next_follow_up_date}
              onChange={handleInputChange}
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

          <div className="form-group">
            <label>Next Reminder</label>
            <input
              type="date"
              name="next_follow_up_date"
              value={formData.next_follow_up_date}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label>Remarks</label>
            <textarea
              name="latest_reply_notes"
              value={formData.latest_reply_notes}
              onChange={handleInputChange}
              rows="3"
              placeholder="Notes, last call summary, next steps"
            />
          </div>
        </form>
      </Modal>

      {/* Remark Modal */}
      <Modal
        isOpen={showRemarkModal}
        title="Remarks"
        onClose={() => setShowRemarkModal(false)}
        footer={
          <div className="modal-actions">
            <button className="btn btn-secondary" onClick={() => setShowRemarkModal(false)}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleSaveRemark}>
              Save Remarks
            </button>
          </div>
        }
      >
        <div className="form-group">
          <label>Remarks / Notes</label>
          <textarea
            value={remarkText}
            onChange={(e) => setRemarkText(e.target.value)}
            rows="5"
            placeholder="Add or edit remarks for this lead"
          />
        </div>
      </Modal>
    </div>
  );
};
