import { useState, useEffect } from 'react';
import { leadService } from '../services/leadService';
import './Dashboard.css';

export const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await leadService.getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div className="dashboard"><p>Loading...</p></div>;
  }

  if (!stats) {
    return <div className="dashboard"><p>Error loading dashboard</p></div>;
  }

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.total_leads}</div>
          <div className="stat-label">Total Leads</div>
        </div>

        {Object.entries(stats.leads_by_status).map(([status, count]) => (
          <div key={status} className="stat-card">
            <div className="stat-value">{count}</div>
            <div className="stat-label">{status}</div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-section">
          <h2>Upcoming Calls</h2>
          {stats.upcoming_calls.length > 0 ? (
            <div className="leads-list">
              {stats.upcoming_calls.map((lead) => (
                <div key={lead._id} className="lead-item">
                  <div>
                    <strong>{lead.company_name}</strong>
                    <p>{lead.sector}</p>
                  </div>
                  <div className="call-date">
                    {new Date(lead.call_schedule_date).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-state">No upcoming calls</p>
          )}
        </div>

        <div className="dashboard-section">
          <h2>Leads by Sector</h2>
          <div className="sector-breakdown">
            {Object.entries(stats.leads_by_sector).map(([sector, count]) => (
              <div key={sector} className="sector-item">
                <span>{sector}</span>
                <span className="sector-count">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="dashboard-section full-width">
        <h2>Recently Updated</h2>
        {stats.recent_updates.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Company</th>
                <th>Sector</th>
                <th>Status</th>
                <th>Owner</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {stats.recent_updates.map((lead) => (
                <tr key={lead._id}>
                  <td>{lead.company_name}</td>
                  <td>{lead.sector}</td>
                  <td>
                    <span className={`status-badge status-${lead.status.toLowerCase().replace(/[- ]/g, '')}`}>
                      {lead.status}
                    </span>
                  </td>
                  <td>{lead.assigned_to}</td>
                  <td>{new Date(lead.updated_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="empty-state">No recent updates</p>
        )}
      </div>
    </div>
  );
};
