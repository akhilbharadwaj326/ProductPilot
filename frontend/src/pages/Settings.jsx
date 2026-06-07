import React, { useState } from 'react';
import { User, Shield, Building2, Users as UsersIcon, Save, Trash2, Key, Bell, Moon, Sun, Monitor, Plus, Mail, X, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Settings = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  
  // Modals state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  // Password Form State
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });

  // Mock Data States
  const [profile, setProfile] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@productpilot.com',
    jobTitle: 'Product Manager',
    theme: 'system',
    timeZone: 'UTC'
  });
  
  const [workspace, setWorkspace] = useState({
    name: 'Acme Corp',
    description: 'Enterprise B2B Software',
    sprintDuration: '2 Weeks',
    visibility: 'Private'
  });

  const [team, setTeam] = useState([
    { id: 1, name: 'John Doe', email: 'john@productpilot.com', role: 'Owner', status: 'Active' },
    { id: 2, name: 'Alice Smith', email: 'alice@productpilot.com', role: 'Admin', status: 'Active' },
    { id: 3, name: 'Bob Johnson', email: 'bob@productpilot.com', role: 'Developer', status: 'Pending' }
  ]);

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Developer');

  const handleSave = (e) => {
    e.preventDefault();
    alert('Settings saved successfully!');
  };

  const handleInvite = (e) => {
    e.preventDefault();
    if (inviteEmail) {
      setTeam([...team, { id: Date.now(), name: 'Pending User', email: inviteEmail, role: inviteRole, status: 'Pending' }]);
      setInviteEmail('');
    }
  };

  const removeMember = (id) => {
    if (confirm('Remove this team member?')) {
      setTeam(team.filter(m => m.id !== id));
    }
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (passwordForm.new !== passwordForm.confirm) {
      alert("Passwords do not match!");
      return;
    }
    alert("Password updated successfully!");
    setShowPasswordModal(false);
    setPasswordForm({ current: '', new: '', confirm: '' });
  };

  const handleEnable2FA = (e) => {
    e.preventDefault();
    setTwoFactorEnabled(true);
    setShow2FAModal(false);
    alert("Two-Factor Authentication has been enabled!");
  };

  const handleDeleteAccount = (e) => {
    e.preventDefault();
    if (deleteConfirmation === 'DELETE') {
      alert("Account deleted. Logging out...");
      navigate('/login');
    } else {
      alert("Please type DELETE to confirm.");
    }
  };

  return (
    <div className="content-area animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto', position: 'relative' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1>Settings</h1>
        <p>Manage your profile, workspace, team, and security preferences.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '32px', alignItems: 'start' }}>
        {/* Settings Sidebar */}
        <div style={{ background: 'var(--bg-panel)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button 
            className={`btn ${activeTab === 'profile' ? 'primary' : 'btn-secondary'}`} 
            style={{ justifyContent: 'flex-start', background: activeTab === 'profile' ? 'var(--primary-color)' : 'transparent', border: 'none', color: activeTab === 'profile' ? 'white' : 'var(--text-primary)' }}
            onClick={() => setActiveTab('profile')}
          >
            <User size={18} /> Profile & Preferences
          </button>
          
          <button 
            className={`btn ${activeTab === 'account' ? 'primary' : 'btn-secondary'}`} 
            style={{ justifyContent: 'flex-start', background: activeTab === 'account' ? 'var(--primary-color)' : 'transparent', border: 'none', color: activeTab === 'account' ? 'white' : 'var(--text-primary)' }}
            onClick={() => setActiveTab('account')}
          >
            <Shield size={18} /> Account & Security
          </button>
          
          <button 
            className={`btn ${activeTab === 'workspace' ? 'primary' : 'btn-secondary'}`} 
            style={{ justifyContent: 'flex-start', background: activeTab === 'workspace' ? 'var(--primary-color)' : 'transparent', border: 'none', color: activeTab === 'workspace' ? 'white' : 'var(--text-primary)' }}
            onClick={() => setActiveTab('workspace')}
          >
            <Building2 size={18} /> Workspace
          </button>
          
          <button 
            className={`btn ${activeTab === 'team' ? 'primary' : 'btn-secondary'}`} 
            style={{ justifyContent: 'flex-start', background: activeTab === 'team' ? 'var(--primary-color)' : 'transparent', border: 'none', color: activeTab === 'team' ? 'white' : 'var(--text-primary)' }}
            onClick={() => setActiveTab('team')}
          >
            <UsersIcon size={18} /> Team Management
          </button>
        </div>

        {/* Settings Content */}
        <div className="glass-card" style={{ padding: '32px' }}>
          
          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSave} className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <h2 style={{ margin: 0, borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>Profile Information</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div><label className="input-label">First Name</label><input className="input-field" value={profile.firstName} onChange={e => setProfile({...profile, firstName: e.target.value})} required /></div>
                <div><label className="input-label">Last Name</label><input className="input-field" value={profile.lastName} onChange={e => setProfile({...profile, lastName: e.target.value})} required /></div>
                <div><label className="input-label">Email Address</label><input className="input-field" type="email" value={profile.email} onChange={e => setProfile({...profile, email: e.target.value})} required /></div>
                <div><label className="input-label">Job Title</label><input className="input-field" value={profile.jobTitle} onChange={e => setProfile({...profile, jobTitle: e.target.value})} /></div>
              </div>
              
              <h2 style={{ margin: '16px 0 0 0', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>Preferences</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label className="input-label">Theme</label>
                  <select className="input-field" value={profile.theme} onChange={e => setProfile({...profile, theme: e.target.value})}>
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="system">System Default</option>
                  </select>
                </div>
                <div>
                  <label className="input-label">Time Zone</label>
                  <select className="input-field" value={profile.timeZone} onChange={e => setProfile({...profile, timeZone: e.target.value})}>
                    <option value="UTC">UTC (Coordinated Universal Time)</option>
                    <option value="EST">EST (Eastern Standard Time)</option>
                    <option value="PST">PST (Pacific Standard Time)</option>
                  </select>
                </div>
              </div>
              
              <button type="submit" className="btn" style={{ alignSelf: 'flex-start', marginTop: '16px' }}><Save size={18}/> Save Changes</button>
            </form>
          )}

          {/* ACCOUNT TAB */}
          {activeTab === 'account' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <h2 style={{ margin: 0, borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>Authentication</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <button className="btn btn-secondary" style={{ alignSelf: 'flex-start', background: 'var(--bg-panel)' }} onClick={() => setShowPasswordModal(true)}>
                  <Key size={18}/> Change Password
                </button>
                <div style={{ padding: '16px', background: 'var(--bg-panel)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ margin: '0 0 4px 0' }}>Two-Factor Authentication (2FA)</h4>
                      <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Add an extra layer of security to your account.</p>
                    </div>
                    {twoFactorEnabled ? (
                      <span className="badge success" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><CheckCircle2 size={14}/> Enabled</span>
                    ) : (
                      <button className="btn" onClick={() => setShow2FAModal(true)}>Enable 2FA</button>
                    )}
                  </div>
                </div>
              </div>

              <h2 style={{ margin: '16px 0 0 0', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', color: 'var(--danger)' }}>Danger Zone</h2>
              <div style={{ padding: '16px', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '8px', border: '1px solid var(--danger)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ margin: '0 0 4px 0', color: 'var(--danger)' }}>Delete Account</h4>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Permanently remove your account and all data.</p>
                  </div>
                  <button className="btn btn-secondary" style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={() => setShowDeleteModal(true)}>
                    <Trash2 size={18}/> Delete Account
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* WORKSPACE TAB */}
          {activeTab === 'workspace' && (
            <form onSubmit={handleSave} className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <h2 style={{ margin: 0, borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>Workspace Settings</h2>
              
              <label className="input-label">Workspace Name</label>
              <input className="input-field" value={workspace.name} onChange={e => setWorkspace({...workspace, name: e.target.value})} required />
              
              <label className="input-label">Description</label>
              <textarea className="input-field" rows="3" value={workspace.description} onChange={e => setWorkspace({...workspace, description: e.target.value})} />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label className="input-label">Default Sprint Duration</label>
                  <select className="input-field" value={workspace.sprintDuration} onChange={e => setWorkspace({...workspace, sprintDuration: e.target.value})}>
                    <option value="1 Week">1 Week</option>
                    <option value="2 Weeks">2 Weeks</option>
                    <option value="3 Weeks">3 Weeks</option>
                    <option value="4 Weeks">4 Weeks</option>
                  </select>
                </div>
                <div>
                  <label className="input-label">Visibility</label>
                  <select className="input-field" value={workspace.visibility} onChange={e => setWorkspace({...workspace, visibility: e.target.value})}>
                    <option value="Private">Private</option>
                    <option value="Invite Only">Invite Only</option>
                    <option value="Public">Public (Read-Only)</option>
                  </select>
                </div>
              </div>
              
              <button type="submit" className="btn" style={{ alignSelf: 'flex-start', marginTop: '16px' }}><Save size={18}/> Save Workspace</button>
            </form>
          )}

          {/* TEAM TAB */}
          {activeTab === 'team' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <h2 style={{ margin: 0, borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>Invite New Member</h2>
              
              <form onSubmit={handleInvite} style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
                <div style={{ flex: 1 }}>
                  <label className="input-label">Email Address</label>
                  <input type="email" className="input-field" placeholder="colleague@company.com" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} required />
                </div>
                <div style={{ width: '200px' }}>
                  <label className="input-label">Role</label>
                  <select className="input-field" value={inviteRole} onChange={e => setInviteRole(e.target.value)}>
                    <option value="Admin">Admin</option>
                    <option value="Product Manager">Product Manager</option>
                    <option value="Developer">Developer</option>
                    <option value="Viewer">Viewer</option>
                  </select>
                </div>
                <button type="submit" className="btn"><Mail size={18}/> Send Invite</button>
              </form>

              <h2 style={{ margin: '16px 0 0 0', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>Active Members</h2>
              <div style={{ background: 'var(--bg-panel)', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-card)' }}>
                      <th style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>User</th>
                      <th style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>Role</th>
                      <th style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>Status</th>
                      <th style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {team.map((member, i) => (
                      <tr key={member.id} style={{ borderBottom: i === team.length - 1 ? 'none' : '1px solid var(--border-color)' }}>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ fontWeight: 'bold' }}>{member.name}</div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{member.email}</div>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <select 
                            className="input-field" 
                            style={{ padding: '4px 8px', fontSize: '0.9rem' }} 
                            value={member.role}
                            onChange={(e) => {
                              const newTeam = [...team];
                              newTeam[i].role = e.target.value;
                              setTeam(newTeam);
                            }}
                            disabled={member.role === 'Owner'}
                          >
                            <option value="Owner">Owner</option>
                            <option value="Admin">Admin</option>
                            <option value="Product Manager">Product Manager</option>
                            <option value="Developer">Developer</option>
                            <option value="Viewer">Viewer</option>
                          </select>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span className={`badge ${member.status === 'Active' ? 'success' : 'warning'}`}>{member.status}</span>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          {member.role !== 'Owner' && (
                            <button className="btn btn-secondary" style={{ padding: '4px 8px', color: 'var(--danger)' }} onClick={() => removeMember(member.id)}>
                              Remove
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODALS */}
      
      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="glass-card animate-scale-in" style={{ width: '400px', position: 'relative' }}>
            <button className="btn btn-secondary" style={{ position: 'absolute', top: '16px', right: '16px', padding: '4px' }} onClick={() => setShowPasswordModal(false)}>
              <X size={18} />
            </button>
            <h2 style={{ marginTop: 0 }}>Change Password</h2>
            <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div><label className="input-label">Current Password</label><input type="password" className="input-field" value={passwordForm.current} onChange={e => setPasswordForm({...passwordForm, current: e.target.value})} required /></div>
              <div><label className="input-label">New Password</label><input type="password" className="input-field" value={passwordForm.new} onChange={e => setPasswordForm({...passwordForm, new: e.target.value})} required /></div>
              <div><label className="input-label">Confirm New Password</label><input type="password" className="input-field" value={passwordForm.confirm} onChange={e => setPasswordForm({...passwordForm, confirm: e.target.value})} required /></div>
              <button type="submit" className="btn" style={{ marginTop: '8px' }}>Update Password</button>
            </form>
          </div>
        </div>
      )}

      {/* Enable 2FA Modal */}
      {show2FAModal && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="glass-card animate-scale-in" style={{ width: '400px', position: 'relative', textAlign: 'center' }}>
            <button className="btn btn-secondary" style={{ position: 'absolute', top: '16px', right: '16px', padding: '4px' }} onClick={() => setShow2FAModal(false)}>
              <X size={18} />
            </button>
            <h2 style={{ marginTop: 0 }}>Enable 2FA</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Scan this QR code with your authenticator app (Google Authenticator, Authy, etc).</p>
            
            <div style={{ width: '200px', height: '200px', background: 'white', margin: '0 auto 24px auto', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px' }}>
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=otpauth://totp/ProductPilot:john@productpilot.com?secret=JBSWY3DPEHPK3PXP&issuer=ProductPilot" alt="2FA QR Code" />
            </div>

            <form onSubmit={handleEnable2FA} style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
              <div><label className="input-label">Verification Code</label><input type="text" placeholder="123456" className="input-field" required style={{ textAlign: 'center', letterSpacing: '4px', fontSize: '1.2rem' }} maxLength={6} /></div>
              <button type="submit" className="btn" style={{ width: '100%' }}>Verify & Enable</button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="glass-card animate-scale-in" style={{ width: '400px', position: 'relative', border: '1px solid var(--danger)' }}>
            <button className="btn btn-secondary" style={{ position: 'absolute', top: '16px', right: '16px', padding: '4px' }} onClick={() => setShowDeleteModal(false)}>
              <X size={18} />
            </button>
            <h2 style={{ marginTop: 0, color: 'var(--danger)' }}>Delete Account</h2>
            <p style={{ color: 'var(--text-secondary)' }}>This action is <strong>permanent</strong> and cannot be undone. All of your workspaces, PRDs, and settings will be erased.</p>
            
            <form onSubmit={handleDeleteAccount} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '24px' }}>
              <div><label className="input-label">Type DELETE to confirm</label><input type="text" className="input-field" value={deleteConfirmation} onChange={e => setDeleteConfirmation(e.target.value)} required /></div>
              <button type="submit" className="btn" style={{ background: 'var(--danger)', border: 'none', color: 'white' }}>Permanently Delete Account</button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
