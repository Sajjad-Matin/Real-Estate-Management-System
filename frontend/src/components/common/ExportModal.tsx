import { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { Download, FileText, Table } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (format: 'csv' | 'excel') => void;
  title?: string;
}

const ExportModal = ({ isOpen, onClose, onExport, title = 'Export Data' }: ExportModalProps) => {
  const [loading, setLoading] = useState(false);

  const handleExport = async (format: 'csv' | 'excel') => {
    setLoading(true);
    try {
      await onExport(format);
      onClose();
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-4">
        <p className="text-secondary text-sm">
          Choose the format you want to export the data to:
        </p>

        <div className="grid grid-cols-2 gap-4">
          {/* CSV Export */}
          <button
            onClick={() => handleExport('csv')}
            disabled={loading}
            className="flex flex-col items-center gap-3 p-6 border-2 border-primary rounded-lg hover:border-primary-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="p-3 bg-success-100 dark:bg-success-900 rounded-lg">
              <FileText className="w-8 h-8 text-success-600" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-primary">CSV</p>
              <p className="text-xs text-secondary mt-1">Excel, Google Sheets</p>
            </div>
          </button>

          {/* Excel Export */}
          <button
            onClick={() => handleExport('excel')}
            disabled={loading}
            className="flex flex-col items-center gap-3 p-6 border-2 border-primary rounded-lg hover:border-primary-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="p-3 bg-primary-100 dark:bg-primary-900 rounded-lg">
              <Table className="w-8 h-8 text-primary-600" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-primary">Excel</p>
              <p className="text-xs text-secondary mt-1">Microsoft Excel</p>
            </div>
          </button>
        </div>

        <div className="bg-info-50 dark:bg-info-900/20 border border-info-200 dark:border-info-800 text-info-800 dark:text-info-200 px-4 py-3 rounded-lg">
          <p className="text-xs">
            <strong>Note:</strong> The export will include all visible columns and current filter settings.
          </p>
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            variant="secondary"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ExportModal;