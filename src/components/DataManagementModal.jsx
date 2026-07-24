// src/components/DataManagementModal.jsx
import { useState, useRef } from 'react';
import { useSheetStore } from '../store';
import {
  X,
  Download,
  Upload,
  RotateCcw,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  FileJson,
  Database,
  HardDriveUpload,
} from 'lucide-react';

export function DataManagementModal({ isOpen, onClose }) {
  const { data, dailyGoal, importData, resetData } = useSheetStore();

  const [notification, setNotification] = useState(null); // { type: 'success'|'error', text: '' }
  const [confirmState, setConfirmState] = useState(null); // null | 'reset' | 'import'
  const [pendingImportPayload, setPendingImportPayload] = useState(null);
  const [importSummary, setImportSummary] = useState(null);

  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const showNotify = (type, text) => {
    setNotification({ type, text });
    setTimeout(() => setNotification(null), 4000);
  };

  /* ── 1. Export JSON ────────── */
  const handleExport = () => {
    try {
      const backupObj = {
        app: "Hasnain's DSA Tracker",
        version: "1.0",
        exportDate: new Date().toISOString(),
        dailyGoal,
        data,
      };

      const dataStr = JSON.stringify(backupObj, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const dateStr = new Date().toISOString().split('T')[0];
      const link = document.createElement('a');
      link.href = url;
      link.download = `hasnain_dsa_tracker_backup_${dateStr}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

    } catch {
      showNotify('error', 'Failed to export backup file.');
    }
  };

  /* ── 2. Import JSON File Picker & Validation ────────── */
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result;
        if (!text) throw new Error('File is empty.');

        const parsed = JSON.parse(text);

        // Validation: handle raw topics array or full backup object
        let topicList = null;
        let goal = dailyGoal;

        if (Array.isArray(parsed)) {
          topicList = parsed;
        } else if (parsed && typeof parsed === 'object') {
          if (Array.isArray(parsed.data)) {
            topicList = parsed.data;
          }
          if (parsed.dailyGoal) {
            goal = parsed.dailyGoal;
          }
        }

        if (!topicList || !Array.isArray(topicList) || topicList.length === 0) {
          throw new Error('Invalid schema: Missing valid topics list.');
        }

        // Validate first topic structure
        const sampleTopic = topicList[0];
        if (!sampleTopic || typeof sampleTopic !== 'object' || !sampleTopic.title || !Array.isArray(sampleTopic.subTopics)) {
          throw new Error('Invalid topic structure in JSON backup file.');
        }

        // Count items for preview
        let totalQ = 0;
        topicList.forEach(t => t.subTopics?.forEach(s => totalQ += s.questions?.length || 0));

        setPendingImportPayload({ data: topicList, dailyGoal: goal });
        setImportSummary({ topics: topicList.length, questions: totalQ });
        setConfirmState('import');
      } catch (err) {
        showNotify('error', `Validation Error: ${err.message}`);
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };

    reader.onerror = () => {
      showNotify('error', 'Could not read selected file.');
    };

    reader.readAsText(file);
  };

  /* ── 3. Confirm Import ────────── */
  const confirmImport = () => {
    if (pendingImportPayload) {
      importData(pendingImportPayload);
      setPendingImportPayload(null);
      setImportSummary(null);
      setConfirmState(null);
      showNotify('success', 'Data successfully imported & restored!');
    }
  };

  /* ── 4. Confirm Reset ────────── */
  const confirmResetAction = () => {
    resetData();
    setConfirmState(null);
    showNotify('success', 'Sheet data reset to default initial state.');
  };

  return (
    <>
      <div className="dm-backdrop" onClick={onClose} />

      <div className="dm-modal" role="dialog" aria-label="Data Management">
        {/* Header */}
        <div className="dm-header">
          <div className="dm-header-title">
            <Database size={20} style={{ color: '#ff5e00' }} />
            <div>
              <h5>Data Management</h5>
              <p>Export, import, or reset your local progress data safely</p>
            </div>
          </div>
          <button className="dm-close-btn" onClick={onClose} title="Close (Esc)">
            <X size={18} />
          </button>
        </div>

        {/* Banner Alert Notification */}
        {notification && (
          <div className={`dm-alert dm-alert-${notification.type}`}>
            {notification.type === 'success' ? (
              <CheckCircle2 size={16} />
            ) : (
              <AlertTriangle size={16} />
            )}
            <span>{notification.text}</span>
          </div>
        )}

        {/* Content */}
        <div className="dm-body">

          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            accept=".json"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />

          {/* Action Cards */}
          <div className="dm-cards">
            {/* Card 1: Export */}
            <div className="dm-action-card">
              <div className="dm-card-icon export">
                <Download size={22} />
              </div>
              <div className="dm-card-info">
                <h6>Export Backup (JSON)</h6>
                <p>Download a complete local JSON backup of all your progress, notes, stars, and tags.</p>
              </div>
              <button className="dm-btn dm-btn-export" onClick={handleExport}>
                <FileJson size={15} /> Export
              </button>
            </div>

            {/* Card 2: Import */}
            <div className="dm-action-card">
              <div className="dm-card-icon import">
                <HardDriveUpload size={22} />
              </div>
              <div className="dm-card-info">
                <h6>Import Backup (JSON)</h6>
                <p>Restore progress from a previously exported JSON backup file with auto-validation.</p>
              </div>
              <button className="dm-btn dm-btn-import" onClick={() => fileInputRef.current?.click()}>
                <Upload size={15} /> Import
              </button>
            </div>

            {/* Card 3: Reset */}
            <div className="dm-action-card danger">
              <div className="dm-card-icon reset">
                <RotateCcw size={22} />
              </div>
              <div className="dm-card-info">
                <h6>Reset All Data</h6>
                <p>Reset all solved statuses, custom topics, notes, and tags back to initial default sheet state.</p>
              </div>
              <button className="dm-btn dm-btn-reset" onClick={() => setConfirmState('reset')}>
                <ShieldAlert size={15} /> Reset
              </button>
            </div>
          </div>

        </div>

        {/* Confirmation Modal Overlays */}
        {confirmState === 'import' && (
          <div className="dm-confirm-overlay">
            <div className="dm-confirm-box">
              <AlertTriangle size={36} color="#fdcb6e" />
              <h4>Overwrite Current Data?</h4>
              <p>
                Found valid backup with <strong>{importSummary?.topics} topics</strong> and{' '}
                <strong>{importSummary?.questions} questions</strong>.
              </p>
              <p className="dm-confirm-sub">
                Importing will overwrite your current progress. Make sure you exported a backup if needed.
              </p>
              <div className="dm-confirm-actions">
                <button
                  className="dm-btn-cancel"
                  onClick={() => {
                    setConfirmState(null);
                    setPendingImportPayload(null);
                  }}
                >
                  Cancel
                </button>
                <button className="dm-btn-confirm-import" onClick={confirmImport}>
                  Confirm & Import
                </button>
              </div>
            </div>
          </div>
        )}

        {confirmState === 'reset' && (
          <div className="dm-confirm-overlay">
            <div className="dm-confirm-box danger">
              <ShieldAlert size={36} color="#ff7675" />
              <h4>Reset All Data to Default?</h4>
              <p>
                This will wipe all custom questions, solved statuses, notes, and mistake tags.
              </p>
              <p className="dm-confirm-sub">This action cannot be undone unless you have a JSON backup.</p>
              <div className="dm-confirm-actions">
                <button className="dm-btn-cancel" onClick={() => setConfirmState(null)}>
                  Cancel
                </button>
                <button className="dm-btn-confirm-reset" onClick={confirmResetAction}>
                  Yes, Reset Everything
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="dm-footer">
          <span>🔒 All data management happens strictly <strong>offline</strong> inside your browser local storage.</span>
        </div>
      </div>
    </>
  );
}
