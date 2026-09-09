import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import PermissionGate from '../components/PermissionGate.jsx';
import RoleBadge from '../components/RoleBadge.jsx';
import { PERMISSIONS } from '../config/permissions.js';

export default function Content() {
  const { sessionToken, role, hasPermission } = useAuth();
  const [contentList, setContentList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);

  // Form state for Create / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    category: 'Engineering',
    status: 'Published',
  });

  // Fetch content from backend API
  const fetchContent = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/content', {
        headers: {
          Authorization: `Bearer ${sessionToken}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setContentList(data.content || []);
      } else {
        setFeedback({ type: 'danger', message: data.message || 'Failed to fetch content' });
      }
    } catch (err) {
      setFeedback({ type: 'danger', message: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, [sessionToken]);

  // Open Create Modal
  const openCreateModal = () => {
    setModalMode('create');
    setEditingId(null);
    setFormData({
      title: '',
      author: '',
      category: 'Engineering',
      status: 'Published',
    });
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (item) => {
    setModalMode('edit');
    setEditingId(item.id);
    setFormData({
      title: item.title,
      author: item.author,
      category: item.category || 'General',
      status: item.status,
    });
    setIsModalOpen(true);
  };

  // Handle Form Submit (Create or Edit)
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFeedback(null);

    const isCreate = modalMode === 'create';
    const url = isCreate ? '/api/content' : `/api/content/${editingId}`;
    const method = isCreate ? 'POST' : 'PUT';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${sessionToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setFeedback({
          type: 'success',
          message: `Success: Content ${isCreate ? 'created' : 'updated'} successfully (HTTP ${res.status}).`,
        });
        setIsModalOpen(false);
        fetchContent();
      } else {
        setFeedback({
          type: 'danger',
          message: `Backend Rejected (${res.status} ${res.statusText}): ${data.message}`,
        });
      }
    } catch (err) {
      setFeedback({ type: 'danger', message: err.message });
    }
  };

  // Handle Delete
  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    setFeedback(null);

    try {
      const res = await fetch(`/api/content/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${sessionToken}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        setFeedback({
          type: 'success',
          message: `Success: "${title}" was deleted (HTTP 200).`,
        });
        fetchContent();
      } else {
        setFeedback({
          type: 'danger',
          message: `Delete Blocked (${res.status} ${res.statusText}): ${data.message}`,
        });
      }
    } catch (err) {
      setFeedback({ type: 'danger', message: err.message });
    }
  };

  // Direct Bypass Test: Send unauthorized action to prove backend guards
  const attemptDirectUnauthorizedAction = async (actionType) => {
    setFeedback(null);
    try {
      let res, data;
      if (actionType === 'create') {
        res = await fetch('/api/content', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${sessionToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: 'Bypassed Item',
            author: 'Unauthorized Attempt',
            category: 'Hacking',
            status: 'Draft',
          }),
        });
        data = await res.json();
      } else if (actionType === 'delete') {
        res = await fetch('/api/content/1', {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${sessionToken}`,
          },
        });
        data = await res.json();
      }

      if (res.ok) {
        setFeedback({
          type: 'warning',
          message: `Action allowed: HTTP ${res.status}. Server authorized this operation for ${role}.`,
        });
        fetchContent();
      } else {
        setFeedback({
          type: 'danger',
          message: `🛡️ Backend Security Enforced (HTTP ${res.status}): ${data.message}. Even though the client triggered this request, backend authorization blocked it!`,
        });
      }
    } catch (err) {
      setFeedback({ type: 'danger', message: err.message });
    }
  };

  return (
    <div className="content-page-container">
      <div className="page-header-row">
        <div>
          <h2>Content Management System</h2>
          <p className="page-sub">
            Demonstrating granular UI gating via <code>PermissionGate</code> alongside strict backend API authorization.
          </p>
        </div>

        <div className="header-actions">
          {/* Create Button Protected by PermissionGate */}
          <PermissionGate
            permission={PERMISSIONS.CREATE_CONTENT}
            fallback={
              <span className="badge badge-subtle" title="Create is restricted for Viewer role">
                🔒 Create Restricted (Viewer)
              </span>
            }
          >
            <button onClick={openCreateModal} className="btn btn-primary">
              + Create New Content
            </button>
          </PermissionGate>
        </div>
      </div>

      {/* Role Capabilities Summary Banner */}
      <div className="role-permissions-banner">
        <div className="banner-left">
          <span>Active Session Role:</span>
          <RoleBadge role={role} size="small" />
        </div>
        <div className="banner-badges">
          <span className={`perm-chip ${hasPermission(PERMISSIONS.CREATE_CONTENT) ? 'granted' : 'denied'}`}>
            Create: {hasPermission(PERMISSIONS.CREATE_CONTENT) ? '✓' : '✗'}
          </span>
          <span className={`perm-chip ${hasPermission(PERMISSIONS.EDIT_CONTENT) ? 'granted' : 'denied'}`}>
            Edit: {hasPermission(PERMISSIONS.EDIT_CONTENT) ? '✓' : '✗'}
          </span>
          <span className={`perm-chip ${hasPermission(PERMISSIONS.DELETE_CONTENT) ? 'granted' : 'denied'}`}>
            Delete: {hasPermission(PERMISSIONS.DELETE_CONTENT) ? '✓' : '✗'}
          </span>
        </div>
      </div>

      {/* Security Testing Box: Trigger Backend Enforcement */}
      <div className="backend-enforcement-test-strip">
        <span className="strip-title">🧪 Educational Backend Test:</span>
        <span className="strip-desc">
          Test direct API requests to demonstrate that frontend gating is not the only barrier:
        </span>
        <button
          onClick={() => attemptDirectUnauthorizedAction('create')}
          className="btn btn-sm btn-outline"
        >
          Direct POST /api/content
        </button>
        <button
          onClick={() => attemptDirectUnauthorizedAction('delete')}
          className="btn btn-sm btn-danger-outline"
        >
          Direct DELETE /api/content/1
        </button>
      </div>

      {/* Feedback Message */}
      {feedback && (
        <div className={`alert alert-${feedback.type}`}>
          <span className="alert-icon">
            {feedback.type === 'success' ? '✅' : feedback.type === 'warning' ? '⚠️' : '🛡️'}
          </span>
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Content Items List */}
      {isLoading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading content items from server...</p>
        </div>
      ) : contentList.length === 0 ? (
        <div className="empty-state">
          <p>No content items found.</p>
        </div>
      ) : (
        <div className="content-cards-grid">
          {contentList.map((item) => (
            <div key={item.id} className="content-card">
              <div className="content-card-header">
                <span className="content-category">{item.category || 'General'}</span>
                <span className={`status-pill status-${item.status?.toLowerCase()}`}>
                  {item.status}
                </span>
              </div>

              <h3 className="content-title">{item.title}</h3>

              <div className="content-meta">
                <span className="meta-author">✍️ {item.author}</span>
                <span className="meta-date">
                  📅 {new Date(item.createdAt).toLocaleDateString()}
                </span>
              </div>

              {/* Action Buttons wrapped in PermissionGate */}
              <div className="content-card-actions">
                {/* Edit Button: Admin & Editor */}
                <PermissionGate
                  permission={PERMISSIONS.EDIT_CONTENT}
                  fallback={
                    <span className="action-disabled" title="Edit is only available for Admin & Editor">
                      🔒 Edit Disabled
                    </span>
                  }
                >
                  <button
                    onClick={() => openEditModal(item)}
                    className="btn btn-sm btn-outline"
                  >
                    ✏️ Edit
                  </button>
                </PermissionGate>

                {/* Delete Button: Admin ONLY */}
                <PermissionGate
                  permission={PERMISSIONS.DELETE_CONTENT}
                  fallback={
                    <span className="action-disabled" title="Delete is restricted to Admin role only">
                      🔒 Delete Disabled ({role})
                    </span>
                  }
                >
                  <button
                    onClick={() => handleDelete(item.id, item.title)}
                    className="btn btn-sm btn-danger-outline"
                  >
                    🗑️ Delete
                  </button>
                </PermissionGate>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <h3>{modalMode === 'create' ? 'Create Content Item' : 'Edit Content Item'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="modal-close-btn">
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="modal-form">
              <div className="form-group">
                <label>Content Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Microservices Architecture Guide"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Author</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Category / Platform</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Security">Security</option>
                    <option value="Architecture">Architecture</option>
                    <option value="DevOps">DevOps</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="Published">Published</option>
                    <option value="Draft">Draft</option>
                    <option value="Review">Review</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {modalMode === 'create' ? 'Create Item' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
