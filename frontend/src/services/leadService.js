import api from './api';

export const leadService = {
  createLead: async (leadData) => {
    const response = await api.post('/leads', leadData);
    return response.data;
  },

  getLead: async (leadId) => {
    const response = await api.get(`/leads/${leadId}`);
    return response.data;
  },

  listLeads: async (params = {}) => {
    const response = await api.get('/leads', { params });
    return response.data;
  },

  updateLead: async (leadId, leadData) => {
    const response = await api.put(`/leads/${leadId}`, leadData);
    return response.data;
  },

  deleteLead: async (leadId) => {
    const response = await api.delete(`/leads/${leadId}`);
    return response.data;
  },

  addInteraction: async (leadId, action, notes = null) => {
    const response = await api.post(`/leads/${leadId}/interaction`, null, {
      params: { action, notes },
    });
    return response.data;
  },

  getDashboardStats: async (assignedTo = null) => {
    const response = await api.get('/leads/dashboard/stats', {
      params: { assigned_to: assignedTo },
    });
    return response.data;
  },
};
