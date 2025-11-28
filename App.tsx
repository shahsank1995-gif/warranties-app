import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { ReceiptScanner } from './components/ReceiptScanner';
import { WarrantyForm } from './components/WarrantyForm';
import { Alerts } from './components/Alerts';
import { Modal } from './components/Modal';
import { LoginPage } from './components/LoginPage';
import { calculateWarrantyStatus, calculateExpiryDate, formatDateForInput } from './utils/dateUtils';
import type { WarrantyItem, ExtractedData, ExpiringWarranty } from './types';
import { AddWarrantyChoice } from './components/AddWarrantyChoice';
import { AddWarrantySuccess } from './components/AddWarrantySuccess';
import { ConfirmDuplicateModal } from './components/ConfirmDuplicateModal';
import { fetchWarranties, createWarranty, deleteWarranty } from './services/api';
import { AlertSettings } from './components/AlertSettings';
import { pushNotificationService } from './src/services/pushNotificationService';
import { Analytics } from '@vercel/analytics/react';

type ModalContent = 'closed' | 'choice' | 'scanner' | 'form' | 'success' | 'confirm_duplicate' | 'alert_settings';
type ScannerAction = 'camera' | 'upload';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('isAuthenticated') === 'true';
  });
  const [warranties, setWarranties] = useState<WarrantyItem[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isSavingWarranty, setIsSavingWarranty] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAlertsVisible, setIsAlertsVisible] = useState(true);
  const [modalContent, setModalContent] = useState<ModalContent>('closed');
  const [scannerAction, setScannerAction] = useState<ScannerAction>('camera');
  const [lastAddedItemName, setLastAddedItemName] = useState<string>('');
  const [pendingWarranty, setPendingWarranty] = useState<WarrantyItem | null>(null);
  const [alertThreshold, setAlertThreshold] = useState<number>(() => {
    const saved = localStorage.getItem('alertThreshold');
    return saved ? parseInt(saved, 10) : 30;
  });


  useEffect(() => {
    localStorage.setItem('isAuthenticated', String(isAuthenticated));
    if (isAuthenticated) {
      loadWarranties();
      // Initialize push notifications on login
      pushNotificationService.initialize().catch(err => {
        console.error('Failed to initialize push notifications:', err);
      });
    } else {
      setWarranties([]);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    localStorage.setItem('alertThreshold', String(alertThreshold));
  }, [alertThreshold]);

  const loadWarranties = async () => {
    try {
      const data = await fetchWarranties();
      setWarranties(data);
    } catch (e) {
      console.error("Failed to load warranties", e);
      setError("Could not load warranties from server.");
    }
  };

  const handleLogin = useCallback(() => {
    setIsAuthenticated(true);
  }, []);

  const handleLogout = useCallback(() => {
    setIsAuthenticated(false);
  }, []);

  const expiringWarranties = useMemo((): ExpiringWarranty[] => {
    return warranties
      .map(w => ({ item: w, statusInfo: calculateWarrantyStatus(w, alertThreshold) }))
      .filter(({ statusInfo }) => statusInfo.status === 'expiring-soon')
      .sort((a, b) => (a.statusInfo.daysRemaining ?? 999) - (b.statusInfo.daysRemaining ?? 999));
  }, [warranties, alertThreshold]);

  const handleOpenModal = useCallback(() => {
    setError(null);
    setExtractedData(null);
    setIsScanning(false);
    setModalContent('choice');
  }, []);

  const handleChooseScannerAction = useCallback((action: ScannerAction) => {
    setScannerAction(action);
    setModalContent('scanner');
  }, []);

  const handleManualAdd = useCallback(() => {
    setError(null);
    setExtractedData({
      productName: '',
      purchaseDate: formatDateForInput(new Date()),
      warrantyPeriod: '',
      retailer: '',
      expiryDate: '',
    });
    setIsScanning(false);
    setModalContent('form');
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalContent('closed');
    setExtractedData(null);
    setPendingWarranty(null);
  }, []);

  const handleScanSuccess = useCallback((data: ExtractedData) => {
    const calculatedExpiry = calculateExpiryDate(data.purchaseDate, data.warrantyPeriod);
    const expiryDateString = calculatedExpiry ? formatDateForInput(calculatedExpiry) : (data.expiryDate || undefined);

    setExtractedData({ ...data, expiryDate: expiryDateString });
    setIsScanning(false);
    setIsAlertsVisible(true);
    setModalContent('form');
  }, []);

  const handleScanStart = useCallback(() => {
    setIsScanning(true);
    setError(null);
    setExtractedData(null);
  }, []);

  const handleScanError = useCallback((message: string) => {
    setError(message);
    setIsScanning(false);
  }, []);

  const handleSaveWarranty = useCallback(async (item: WarrantyItem) => {
    if (isSavingWarranty) return; // Prevent multiple saves

    const isDuplicate = warranties.some(w => {
      // Check for exact image match
      if (item.receiptImage && w.receiptImage) {
        if (item.receiptImage === w.receiptImage) {
          console.log('Duplicate found by image match');
          return true;
        }
      }

      // Check for name and date match
      const nameMatch = w.productName.trim().toLowerCase() === item.productName.trim().toLowerCase();
      const dateMatch = w.purchaseDate === item.purchaseDate;

      if (nameMatch && dateMatch) {
        console.log('Duplicate found by name and date match');
        return true;
      }

      return false;
    });

    if (isDuplicate) {
      setPendingWarranty(item);
      setModalContent('confirm_duplicate');
    } else {
      setIsSavingWarranty(true);
      try {
        const newItem = await createWarranty({ ...item, id: Date.now().toString() });
        setWarranties(prev => [newItem, ...prev]);
        setExtractedData(null);
        setLastAddedItemName(item.productName);
        setModalContent('success');
        setIsAlertsVisible(true);
      } catch (e) {
        console.error("Failed to save warranty", e);
        setError("Could not save warranty.");
      } finally {
        setIsSavingWarranty(false);
      }
    }
  }, [warranties, isSavingWarranty]);

  const handleConfirmDuplicateSave = useCallback(async () => {
    if (!pendingWarranty) return;

    try {
      const newItem = await createWarranty({ ...pendingWarranty, id: Date.now().toString() });
      setWarranties(prev => [newItem, ...prev]);
      setExtractedData(null);
      setLastAddedItemName(pendingWarranty.productName);
      setModalContent('success');
      setIsAlertsVisible(true);
      setPendingWarranty(null);
    } catch (e) {
      console.error("Failed to save duplicate warranty", e);
      setError("Could not save warranty.");
    }
  }, [pendingWarranty]);

  const handleCancelDuplicateSave = useCallback(() => {
    setPendingWarranty(null);
    setModalContent('form'); // Go back to the form
  }, []);

  const handleDeleteWarranty = useCallback(async (id: string) => {
    try {
      await deleteWarranty(id);
      setWarranties(prev => prev.filter(w => w.id !== id));
    } catch (e) {
      console.error("Failed to delete warranty", e);
      setError("Could not delete warranty.");
    }
  }, []);

  const handleDismissAlerts = useCallback(() => {
    setIsAlertsVisible(false);
  }, []);

  const renderModalContent = () => {
    switch (modalContent) {
      case 'choice':
        return <AddWarrantyChoice onScan={() => handleChooseScannerAction('camera')} onUpload={() => handleChooseScannerAction('upload')} onManual={handleManualAdd} />;
      case 'scanner':
        return <ReceiptScanner
          onScanStart={handleScanStart}
          onScanSuccess={handleScanSuccess}
          onScanError={handleScanError}
          isScanning={isScanning}
          initialAction={scannerAction}
        />;
      case 'form':
        if (extractedData) {
          return <WarrantyForm
            initialData={extractedData}
            onSave={handleSaveWarranty}
            onCancel={handleCloseModal}
            isSaving={isSavingWarranty}
          />
        }
        return null;
      case 'success':
        return <AddWarrantySuccess productName={lastAddedItemName} onDone={handleCloseModal} />;
      case 'confirm_duplicate':
        return pendingWarranty ? (
          <ConfirmDuplicateModal
            item={pendingWarranty}
            onConfirm={handleConfirmDuplicateSave}
            onCancel={handleCancelDuplicateSave}
          />
        ) : null;
      case 'alert_settings':
        return (
          <AlertSettings
            alertThreshold={alertThreshold}
            onThresholdChange={setAlertThreshold}
            onClose={handleCloseModal}
          />
        );
      default:
        return null;
    }
  }

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="bg-charcoal-black min-h-screen text-off-white">
      <Header onAddClick={handleOpenModal} onLogout={handleLogout} />
      <main className="container mx-auto p-6 md:p-8 animate-fade-in-stagger">
        {error && (
          <div className="bg-alert-red/10 border border-alert-red/30 text-red-300 px-4 py-3 rounded-xl relative mb-6" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
            <span className="absolute top-0 bottom-0 right-0 px-4 py-3 cursor-pointer" onClick={() => setError(null)}>
              <svg className="fill-current h-6 w-6 text-alert-red" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" /></svg>
            </span>
          </div>
        )}

        {isAlertsVisible && (
          <Alerts
            expiringItems={expiringWarranties}
            onDismiss={handleDismissAlerts}
            onOpenSettings={() => setModalContent('alert_settings')}
            alertThreshold={alertThreshold}
          />
        )}

        <Dashboard
          warranties={warranties}
          onDelete={handleDeleteWarranty}
          onAddClick={handleOpenModal}
          onOpenSettings={() => setModalContent('alert_settings')}
          alertThreshold={alertThreshold}
        />

        <Modal isOpen={modalContent !== 'closed'} onClose={handleCloseModal}>
          {renderModalContent()}
        </Modal>

      </main>
      <Analytics />
    </div>
  );
};

export default App;