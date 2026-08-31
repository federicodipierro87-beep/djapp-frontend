import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, X, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { adminApi } from '../services/api';
import { logout } from '../services/session';
import AppHeader from '../components/AppHeader';
import Surface from '../components/ui/Surface';
import Button from '../components/ui/Button';
import Label from '../components/ui/Label';
import StatusDot from '../components/ui/StatusDot';
import EmptyState from '../components/ui/EmptyState';
import type { BadgeTone } from '../components/ui/Badge';

const STATUS: Record<string, { tone: BadgeTone; label: string }> = {
  PENDING: { tone: 'warn', label: 'In attesa' },
  APPROVED: { tone: 'ok', label: 'Approvato' },
  REJECTED: { tone: 'muted', label: 'Respinto' },
};

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'pending' | 'all'>('pending');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: pendingDJs = [], isLoading: loadingPending } = useQuery({
    queryKey: ['admin', 'djs', 'pending'],
    queryFn: adminApi.getPendingDJs,
  });

  const { data: allDJs = [], isLoading: loadingAll } = useQuery({
    queryKey: ['admin', 'djs', 'all'],
    queryFn: adminApi.getAllDJs,
    enabled: activeTab === 'all',
  });

  const approveMutation = useMutation({
    mutationFn: adminApi.approveDJ,
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ['admin', 'djs'] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || 'Errore nell\'approvazione';
      toast.error(message);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: adminApi.rejectDJ,
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ['admin', 'djs'] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || 'Errore nel respingere';
      toast.error(message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: adminApi.deleteDJ,
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ['admin', 'djs'] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || 'Errore nella cancellazione';
      toast.error(message);
    },
  });

  const handleApprove = (djId: string) => {
    if (window.confirm('Sei sicuro di voler approvare questo DJ?')) {
      approveMutation.mutate(djId);
    }
  };

  const handleReject = (djId: string) => {
    if (window.confirm('Sei sicuro di voler respingere questo DJ?')) {
      rejectMutation.mutate(djId);
    }
  };

  const handleDelete = (djId: string, djName: string) => {
    if (window.confirm(`Sei sicuro di voler CANCELLARE DEFINITIVAMENTE il DJ "${djName}"?\n\nQuesta azione non può essere annullata e cancellerà:\n- Account DJ\n- Tutte le richieste\n- Tutti gli eventi\n- Tutte le statistiche\n\nDigita "CANCELLA" per confermare.`)) {
      const confirmation = window.prompt(`Per confermare la cancellazione di "${djName}", digita "CANCELLA" (tutto maiuscolo):`);
      if (confirmation === 'CANCELLA') {
        deleteMutation.mutate(djId);
      } else {
        toast.error('Cancellazione annullata - testo di conferma non corretto');
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isLoading = loadingPending || loadingAll;

  /**
   * Una riga vale per entrambe le schede: cambiano solo le azioni disponibili,
   * che dipendono comunque dallo stato del DJ e non dalla scheda aperta.
   */
  const renderDJ = (dj: {
    id: string;
    name: string;
    email: string;
    status: string;
    eventCode?: string | null;
    createdAt: string;
  }) => {
    const status = STATUS[dj.status];

    return (
      <Surface key={dj.id}>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="min-w-0 flex-1">
            {status && (
              <div className="flex items-center gap-2">
                <StatusDot tone={status.tone} />
                <Label as="div" tone={status.tone === 'warn' ? 'live' : 'dim'}>
                  {status.label}
                </Label>
              </div>
            )}

            <h3 className="mt-2 font-display text-lg font-semibold leading-snug truncate">
              {dj.name}
            </h3>

            <p className="mt-0.5 text-[13px] text-bone-dim truncate">{dj.email}</p>

            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-bone-faint">
              {dj.eventCode && (
                <>
                  <span className="num tracking-[0.15em]">{dj.eventCode}</span>
                  <span>·</span>
                </>
              )}
              <span className="num">{formatDate(dj.createdAt)}</span>
            </div>
          </div>

          {/* Approva e respingi stanno vicine perché si scelgono insieme; la
              cancellazione è un'altra categoria di gesto e resta staccata. */}
          <div className="flex items-center gap-2 shrink-0">
            {dj.status === 'PENDING' && (
              <>
                <Button
                  size="sm"
                  onClick={() => handleApprove(dj.id)}
                  disabled={approveMutation.isPending}
                >
                  <Check className="h-4 w-4" />
                  Approva
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleReject(dj.id)}
                  disabled={rejectMutation.isPending}
                >
                  <X className="h-4 w-4" />
                  Respingi
                </Button>
              </>
            )}
            <button
              type="button"
              onClick={() => handleDelete(dj.id, dj.name)}
              disabled={deleteMutation.isPending}
              title="Cancella definitivamente"
              aria-label="Cancella definitivamente"
              className="ml-2 p-2 rounded-md text-bone-faint hover:text-live hover:bg-white/[0.06]
                         transition-colors disabled:opacity-40"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </Surface>
    );
  };

  const list = activeTab === 'pending' ? pendingDJs : allDJs;

  return (
    <div className="min-h-screen bg-ink-950">
      <AppHeader
        back="/"
        eyebrow="Amministrazione"
        title="DJ registrati"
        width="xl"
        actions={
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            Esci
          </Button>
        }
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-6 border-b border-white/[0.08]">
          {([
            { id: 'pending', label: 'In attesa', count: pendingDJs.length },
            { id: 'all', label: 'Tutti i DJ', count: null },
          ] as const).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`-mb-px pb-3 text-sm border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-bone text-bone font-medium'
                  : 'border-transparent text-bone-dim hover:text-bone'
              }`}
            >
              {tab.label}
              {tab.count !== null && tab.count > 0 && (
                <span className="num ml-1.5 text-bone-faint">{tab.count}</span>
              )}
            </button>
          ))}
        </div>

        <div className="mt-6">
          {isLoading ? (
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-[116px] rounded-lg bg-ink-900 animate-pulse" />
              ))}
            </div>
          ) : list.length === 0 ? (
            <div className="border border-white/[0.08] rounded-lg">
              <EmptyState
                title={
                  activeTab === 'pending'
                    ? 'Nessuna richiesta in attesa'
                    : 'Nessun DJ registrato'
                }
                description={
                  activeTab === 'pending'
                    ? 'Non c\'è nessun DJ da approvare al momento.'
                    : undefined
                }
              />
            </div>
          ) : (
            <div className="space-y-3">{list.map(renderDJ)}</div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
