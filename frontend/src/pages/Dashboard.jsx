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

        // Ensure upcoming calls are sorted soonest-first and valid
        const upcoming = (data.upcoming_calls || [])
          .filter((lead) => lead.next_follow_up_date)
          .sort((a, b) => new Date(a.next_follow_up_date) - new Date(b.next_follow_up_date));

        setStats({ ...data, upcoming_calls: upcoming });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className="dashboard"><p>Loading...</p></div>;
  }

  if (!stats) {
    return <div className="dashboard"><p>Error loading dashboard</p></div>;
  }

  return (
    <div className="dashboard">
      <h1><span className="title-text">Dashboard</span></h1>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="shimmer"></div>
          <div className="particles">
            <div className="particle"></div>
            <div className="particle"></div>
            <div className="particle"></div>
            <div className="particle"></div>
          </div>
          <div className="stat-value">{stats.total_leads}</div>
          <div className="stat-label">Total Leads</div>
        </div>

        {Object.entries(stats.leads_by_status).map(([status, count]) => (
          <div key={status} className="stat-card">
            <div className="shimmer"></div>
            <div className="particles">
              <div className="particle"></div>
              <div className="particle"></div>
              <div className="particle"></div>
              <div className="particle"></div>
            </div>
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
              {stats.upcoming_calls.map((lead) => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const dateVal = lead.next_follow_up_date ? new Date(lead.next_follow_up_date) : null;
                const isOverdue = dateVal && dateVal < today;
                
                const formatDate = (date) => {
                  if (!date) return '-';
                  const d = new Date(date);
                  const day = String(d.getDate()).padStart(2, '0');
                  const month = String(d.getMonth() + 1).padStart(2, '0');
                  const year = d.getFullYear();
                  return `${day}/${month}/${year}`;
                };

                return (
                  <div key={lead._id} className="lead-item">
                    <div>
                      <strong>{lead.company_name}</strong>
                      <p>{lead.sector}</p>
                    </div>
                    <div className={`call-date ${isOverdue ? 'call-date-overdue' : ''}`}>
                      {formatDate(lead.next_follow_up_date)}
                    </div>
                  </div>
                );
              })}
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
          <div className="recent-updates-list">
            {stats.recent_updates.map((lead) => (
              <div key={lead._id} className="recent-update-item">
                <div className="update-company">{lead.company_name}</div>
                <div className="update-sector">{lead.sector || 'N/A'}</div>
                <span className={`status-badge status-${lead.status.toLowerCase().replace(/[- ]/g, '')}`}>
                  {lead.status}
                </span>
                <div className="founder-initial">{lead.assigned_to ? lead.assigned_to.charAt(0).toUpperCase() : '-'}</div>
                <div className="update-date">{new Date(lead.updated_at).toLocaleDateString()}</div>
              </div>
            ))}
          </div>
        ) : (
          <p className="empty-state">No recent updates</p>
        )}
      </div>
    </div>
  );
};
