'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import QRCode from 'react-qr-code';
import { getPrintQueueItem, updatePrintQueueItem } from '@/lib/firebase';
import type { PrintQueueItem } from '@/lib/types';

export default function PrintPage() {
  const { queueId } = useParams<{ queueId: string }>();
  const [item, setItem] = useState<PrintQueueItem | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getPrintQueueItem(queueId).then(async q => {
      if (!q) { setError('Tiquet no trobat.'); return; }
      setItem(q);
      await updatePrintQueueItem(queueId, { status: 'printing' });

      // Trigger print after short render delay
      setTimeout(() => {
        window.print();
      }, 300);

      // After print dialog closes → mark printed and close tab
      window.onafterprint = async () => {
        await updatePrintQueueItem(queueId, { status: 'printed', printedAt: Date.now() });
        window.close();
      };
    }).catch(() => setError('Error carregant el tiquet.'));
  }, [queueId]);

  if (error) return <div style={{ padding: 16, fontFamily: 'Arial', color: '#dc2626' }}>{error}</div>;
  if (!item) return <div style={{ padding: 16, fontFamily: 'Arial' }}>Carregant...</div>;

  const parts = item.tasca?.split(' · ') ?? [];
  const hasCards = parts.length >= 5;

  return (
    <>
      <style>{`
        @media print {
          @page { size: 80mm auto; margin: 3mm 4mm; }
          body { background: white !important; margin: 0; padding: 0; }
        }
        body { font-family: Arial, sans-serif; font-size: 11px; color: #000; background: #fff; }
      `}</style>

      {/* Thermal receipt */}
      <div style={{ width: '100%', maxWidth: 280, margin: '0 auto', padding: 8 }}>

        {/* Header */}
        <div style={{ textAlign: 'center', paddingBottom: 10, marginBottom: 8, borderBottom: '3px solid #000' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 4 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/mschools-ia-lab.png" alt="mSchools IA Lab" style={{ height: 20, width: 'auto' }} />
          </div>
          <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase' }}>Vibe Coding · mSchools 2026</div>
        </div>

        {/* Group name */}
        <div style={{ textAlign: 'center', padding: '8px 0', marginBottom: 10, borderBottom: '1px solid #000' }}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 2 }}>Grup</div>
          <div style={{ fontWeight: 900, fontSize: 22 }}>{item.pairName || '—'}</div>
        </div>

        {/* QR */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6 }}>
          <QRCode value={item.appUrl} size={200} />
        </div>
        <div style={{ textAlign: 'center', fontSize: 8, marginBottom: 10, color: '#444', wordBreak: 'break-all' }}>
          {item.appUrl}
        </div>

        {/* Cards */}
        <div style={{ borderTop: '3px solid #000', paddingTop: 8 }}>
          <div style={{ fontWeight: 800, fontSize: 9, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 6 }}>El nostre recurs</div>
          {hasCards ? (
            <>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 8 }}>
                <tbody>
                  {[['Eix', parts[0]], ['Usuari', parts[1]], ['Acció', parts[2]], ['Repte', parts[3]], ['Estil', parts[4]]].map(([label, value]) => (
                    <tr key={label} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ fontWeight: 700, padding: '3px 8px 3px 0', width: 44, fontSize: 9, textTransform: 'uppercase', color: '#555' }}>{label}</td>
                      <td style={{ padding: '3px 0', fontWeight: 600 }}>{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ borderTop: '1px dashed #ccc', paddingTop: 6, fontSize: 9, lineHeight: 1.6, fontStyle: 'italic', color: '#333' }}>
                &ldquo;Crea una aplicació web emmarcada dins de l&apos;eix de <strong>{parts[0]}</strong>, pensada perquè la utilitzi <strong>{parts[1]}</strong>, serveixi per <strong>{parts[3]}</strong>, a través de <strong>{parts[2]}</strong>, amb un estil <strong>{parts[4]}</strong>, que resulti coherent i fàcil d&apos;usar.&rdquo;
              </div>
              {item.refinements && item.refinements.length > 0 && (
                <div style={{ borderTop: '1px dashed #ccc', marginTop: 6, paddingTop: 6, fontSize: 9 }}>
                  <div style={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 3 }}>Millores aplicades</div>
                  {item.refinements.map((r, i) => (
                    <div key={i} style={{ lineHeight: 1.5 }}>{i + 1}. {r}</div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div style={{ fontSize: 10, fontStyle: 'italic', lineHeight: 1.5 }}>{item.tasca}</div>
          )}
        </div>

        {/* Footer */}
        <div style={{ borderTop: '3px solid #000', marginTop: 10, paddingTop: 6, textAlign: 'center', fontSize: 9, color: '#555' }}>
          mschools-vibecoding.vercel.app
        </div>
      </div>
    </>
  );
}
