import React, { useState } from 'react';

const ProfileForm = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    position: '',
    institution: '',
    bio: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log('Photo uploaded:', file.name);
    }
  };

  const handleSave = () => {
    console.log('Saving changes:', formData);
    alert('Changes saved successfully!');
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        
        {/* Profile Picture Section */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Profile Picture</h2>
          <div style={styles.profilePictureContainer}>
            <div style={styles.avatar}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <div>
              <label htmlFor="photo-upload" style={styles.uploadButton}>
                Upload New Photo
              </label>
              <input
                id="photo-upload"
                type="file"
                accept="image/jpeg,image/png,image/gif"
                onChange={handlePhotoUpload}
                style={styles.fileInput}
              />
              <p style={styles.uploadHint}>JPG, PNG or GIF. Max size 2MB.</p>
            </div>
          </div>
        </div>

        {/* Personal Information Section */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Personal Information</h2>
          
          <div style={styles.row}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                style={styles.input}
              />
            </div>
            
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              style={styles.input}
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Position</label>
            <input
              type="text"
              name="position"
              value={formData.position}
              onChange={handleChange}
              style={styles.input}
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Institution</label>
            <input
              type="text"
              name="institution"
              value={formData.institution}
              onChange={handleChange}
              style={styles.input}
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Bio</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              style={styles.textarea}
              rows="3"
            />
          </div>
        </div>


        {/* Save Button */}
        <div style={styles.saveButtonContainer}>
          <button onClick={handleSave} style={styles.saveButton}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#fafafa',
    padding: '40px 20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif'
  },
  card: {
    maxWidth: '1440px',
    margin: '0 auto',
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '48px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e5e7eb'
  },
  section: {
    marginBottom: '48px'
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '24px'
  },
  profilePictureContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px'
  },
  avatar: {
    width: '88px',
    height: '88px',
    borderRadius: '50%',
    backgroundColor: '#6366f1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  uploadButton: {
    display: 'inline-block',
    backgroundColor: '#6366f1',
    color: 'white',
    padding: '10px 24px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    userSelect: 'none'
  },
  fileInput: {
    display: 'none'
  },
  uploadHint: {
    fontSize: '13px',
    color: '#6b7280',
    marginTop: '8px'
  },
  row: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '24px',
    marginBottom: '24px'
  },
  fieldGroup: {
    marginBottom: '24px'
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '8px'
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    fontSize: '15px',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    backgroundColor: '#f9fafb',
    color: '#1f2937',
    outline: 'none',
    transition: 'all 0.2s',
    boxSizing: 'border-box'
  },
  textarea: {
    width: '100%',
    padding: '12px 16px',
    fontSize: '15px',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    backgroundColor: '#f9fafb',
    color: '#1f2937',
    outline: 'none',
    transition: 'all 0.2s',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    resize: 'vertical',
    minHeight: '80px'
  },
  saveButtonContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
    paddingTop: '24px'
  },
  saveButton: {
    backgroundColor: '#6366f1',
    color: 'white',
    padding: '12px 32px',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    border: 'none',
    transition: 'background-color 0.2s',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
  }
};

export default ProfileForm;
