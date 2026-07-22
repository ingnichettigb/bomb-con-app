/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { TankInput, HeadType, HeadConfig, ReportMeta } from '../types';
import { Settings2, ShieldCheck, HelpCircle, Layers, Check, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';
import { Language, translations } from '../utils/translations';

interface TankInputFormProps {
  key?: React.Key | number;
  initialInput: TankInput;
  onSubmit: (input: TankInput) => void;
  lang?: Language;
}

export default function TankInputForm({ initialInput, onSubmit, lang = 'it' }: TankInputFormProps) {
  const t = translations[lang];
  // Main dimensions
  const [dInt, setDInt] = useState<number>(initialInput.dInt);
  const [lCil, setLCil] = useState<number>(initialInput.lCil);
  const [rho, setRho] = useState<number>(initialInput.rho);

  // Spin animation trigger count
  const [spinCount, setSpinCount] = useState<number>(0);

  // Fondo State (sempre CONICO)
  const [fondoSp, setFondoSp] = useState<number>(initialInput.fondo.sp);
  const [fondoColletto, setFondoColletto] = useState<number>(initialInput.fondo.hColletto);
  const [fondoHCono, setFondoHCono] = useState<number>(initialInput.fondo.hCono ?? Math.round(initialInput.dInt / 2));
  const [fondoCollettoConfirmed, setFondoCollettoConfirmed] = useState<boolean>(true);
  // Costante: fondo sempre conico
  const fondoType: HeadType = 'conico';
  const fondoRCustom = 0;
  const fondoRCustomVal = 0;

  // Coperchio State (sempre BOMBATO)
  const [coperchioType, setCoperchioType] = useState<HeadType>(
    initialInput.coperchio.type === 'conico' ? 'pseudoellittico' : initialInput.coperchio.type
  );
  const [coperchioSp, setCoperchioSp] = useState<number>(initialInput.coperchio.sp);
  const [coperchioColletto, setCoperchioColletto] = useState<number>(initialInput.coperchio.hColletto);
  const [coperchioRCustom, setCoperchioRCustom] = useState<number>(initialInput.coperchio.R_custom ?? initialInput.dInt);
  const [coperchioRCustomVal, setCoperchioRCustomVal] = useState<number>(initialInput.coperchio.r_custom ?? (initialInput.dInt / 10));
  const [coperchioCollettoConfirmed, setCoperchioCollettoConfirmed] = useState<boolean>(true);
  const coperchioUgualeAlFondo = false;
  const setCoperchioUgualeAlFondo = (_: boolean) => {};

  // Report Meta State
  const [cliente, setCliente] = useState(initialInput.report.cliente);
  const [riferimento, setRiferimento] = useState(initialInput.report.riferimento);
  const [nomeSerbatoio, setNomeSerbatoio] = useState(initialInput.report.nomeSerbatoio);
  const [numeroDisegno, setNumeroDisegno] = useState(initialInput.report.numeroDisegno);
  const [dataReport, setDataReport] = useState(initialInput.report.data);

  // Accordion controls
  const [activeTab, setActiveTab] = useState<'dims' | 'fondo' | 'coperchio' | 'report'>('dims');

  // Load external initial values when they change (e.g. loaded from localStorage/sidebar)
  useEffect(() => {
    setCliente(initialInput.report.cliente);
    setRiferimento(initialInput.report.riferimento);
    setNomeSerbatoio(initialInput.report.nomeSerbatoio);
    setNumeroDisegno(initialInput.report.numeroDisegno);
    setDataReport(initialInput.report.data);
  }, [initialInput.report]);

  // Synchronize coperchio with fondo when active
  useEffect(() => {
    if (coperchioUgualeAlFondo) {
      setCoperchioType(fondoType);
      setCoperchioSp(fondoSp);
      setCoperchioColletto(fondoColletto);
      setCoperchioRCustom(fondoRCustom);
      setCoperchioRCustomVal(fondoRCustomVal);
      setCoperchioCollettoConfirmed(true);
    }
  }, [coperchioUgualeAlFondo, fondoType, fondoSp, fondoColletto, fondoRCustom, fondoRCustomVal]);

  // Effect to handle automatic proposal of colletto height when spessore changes
  const handleFondoSpChange = (val: number) => {
    setFondoSp(val);
    const calculatedColletto = val * 5;
    setFondoColletto(calculatedColletto);
    setFondoCollettoConfirmed(false); // prompt to confirm
  };

  const handleCoperchioSpChange = (val: number) => {
    setCoperchioSp(val);
    const calculatedColletto = val * 5;
    setCoperchioColletto(calculatedColletto);
    setCoperchioCollettoConfirmed(false); // prompt to confirm
  };

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();

    // Compile values
    const finalInput: TankInput = {
      dInt: dInt || 1000,
      lCil: lCil || 2000,
      rho: rho || 1,
      fondo: {
        type: 'conico',
        sp: fondoSp || 5,
        hColletto: fondoColletto || 25,
        hCono: fondoHCono || Math.round((dInt || 1000) / 2),
      },
      coperchio: {
        type: coperchioType,
        sp: coperchioSp || 5,
        hColletto: coperchioColletto || 25,
        ...(coperchioType === 'custom' ? { R_custom: coperchioRCustom, r_custom: coperchioRCustomVal } : {})
      },
      report: {
        ...initialInput.report,
        cliente,
        riferimento,
        nomeSerbatoio,
        numeroDisegno,
        data: dataReport
      }
    };

    // Auto mark as confirmed when submit is clicked
    setFondoCollettoConfirmed(true);
    setCoperchioCollettoConfirmed(true);

    // Trigger spin animation
    setSpinCount(prev => prev + 1);

    onSubmit(finalInput);
  };

  return (
    <form onSubmit={handleCalculate} className="space-y-4">
      {/* Tab Selectors */}
      <div className="flex bg-sky-50/90 p-1.5 border-4 border-double border-emerald-800 rounded-xl text-xs font-bold gap-1.5 shadow-inner">
        <button
          type="button"
          onClick={() => setActiveTab('dims')}
          className={`flex-1 py-1.5 px-2.5 rounded-md transition-all border ${
            activeTab === 'dims' 
              ? 'bg-sky-300 text-sky-950 border-sky-400 shadow-xs font-extrabold' 
              : 'bg-sky-100/80 text-sky-900 border-sky-200 hover:bg-sky-200/90 hover:text-sky-950'
          }`}
        >
          Dimensioni
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('fondo')}
          className={`flex-1 py-1.5 px-2.5 rounded-md transition-all flex items-center justify-center gap-1 border ${
            activeTab === 'fondo' 
              ? 'bg-sky-300 text-sky-950 border-sky-400 shadow-xs font-extrabold' 
              : 'bg-sky-100/80 text-sky-900 border-sky-200 hover:bg-sky-200/90 hover:text-sky-950'
          }`}
        >
          Fondo conico
          {!fondoCollettoConfirmed && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('coperchio')}
          className={`flex-1 py-1.5 px-2.5 rounded-md transition-all flex items-center justify-center gap-1 border ${
            activeTab === 'coperchio' 
              ? 'bg-sky-300 text-sky-950 border-sky-400 shadow-xs font-extrabold' 
              : 'bg-sky-100/80 text-sky-900 border-sky-200 hover:bg-sky-200/90 hover:text-sky-950'
          }`}
        >
          Coperchio bombato
          {!coperchioCollettoConfirmed && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('report')}
          className={`flex-1 py-1.5 px-2.5 rounded-md transition-all border ${
            activeTab === 'report' 
              ? 'bg-sky-300 text-sky-950 border-sky-400 shadow-xs font-extrabold' 
              : 'bg-sky-100/80 text-sky-900 border-sky-200 hover:bg-sky-200/90 hover:text-sky-950'
          }`}
        >
          Report
        </button>
      </div>

      {/* Tab Panels */}
      <div className="bg-white border-4 border-double border-emerald-800 rounded-xl p-5 shadow-xs">
        {activeTab === 'dims' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-neutral-950 pb-2 border-b border-neutral-200 flex items-center gap-1.5">
              <Settings2 className="w-4 h-4 text-emerald-800" />
              Dimensioni Generali Serbatoio
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-900 mb-1 flex items-center gap-1 uppercase tracking-wide">
                  Diametro Interno (D_int)
                  <span className="text-[10px] text-neutral-700 font-bold">(mm)</span>
                </label>
                <input
                  type="number"
                  min="100"
                  max="10000"
                  required
                  value={dInt || ''}
                  onChange={(e) => setDInt(Math.max(1, parseInt(e.target.value) || 0))}
                  className="w-full text-sm bg-[#d7ecd7]/80 border-2 border-emerald-300/80 rounded-lg px-3 py-2 text-emerald-950 font-bold focus:bg-[#cde9cd] focus:ring-2 focus:ring-emerald-800 focus:outline-hidden transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-900 mb-1 flex items-center gap-1 uppercase tracking-wide">
                  Altezza Parte Cilindrica (L_cil)
                  <span className="text-[10px] text-neutral-700 font-bold">(mm)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  max="50000"
                  required
                  value={lCil || ''}
                  onChange={(e) => setLCil(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full text-sm bg-[#d7ecd7]/80 border-2 border-emerald-300/80 rounded-lg px-3 py-2 text-emerald-950 font-bold focus:bg-[#cde9cd] focus:ring-2 focus:ring-emerald-800 focus:outline-hidden transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-900 mb-1 flex items-center gap-1 uppercase tracking-wide">
                Peso Specifico del Contenuto (rho)
                <span className="text-[10px] text-neutral-700 font-bold">(kg/dm³)</span>
              </label>
              <div className="relative rounded-lg shadow-xs">
                <input
                  type="number"
                  step="0.001"
                  min="0.01"
                  max="5.0"
                  required
                  value={rho || ''}
                  onChange={(e) => setRho(parseFloat(e.target.value) || 1)}
                  className="w-full text-sm bg-[#d7ecd7]/80 border-2 border-emerald-300/80 rounded-lg px-3 py-2 text-emerald-950 font-bold focus:bg-[#cde9cd] focus:ring-2 focus:ring-emerald-800 focus:outline-hidden transition-colors"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <span className="text-xs text-neutral-700 font-bold">Default: 1.0 (acqua)</span>
                </div>
              </div>
            </div>
            
            <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-200 flex items-start gap-2.5 text-xs text-neutral-800 mt-2">
              <HelpCircle className="w-4 h-4 text-emerald-800 shrink-0 mt-0.5" />
              <p className="font-medium">
                Il serbatoio "Bomb-Bomb" è composto da un mantello cilindrico centrale e due teste bombate (fondo e coperchio) calcolate secondo il profilo torosferico prescelto.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'fondo' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-neutral-950 pb-2 border-b border-neutral-200 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-emerald-800" />
              Geometria Fondo Conico
            </h3>

            <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-lg text-[11px] text-emerald-950 font-medium">
              Il fondo è un <strong>cono retto</strong> con vertice rivolto verso il basso. Definire l'altezza del cono (dalla base cilindrica al vertice).
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-900 mb-1 flex items-center gap-1 uppercase tracking-wide">
                Altezza Cono (h_cono)
                <span className="text-[10px] text-neutral-700 font-bold">(mm)</span>
              </label>
              <input
                type="number"
                min="1"
                max="10000"
                required
                value={fondoHCono || ''}
                onChange={(e) => setFondoHCono(Math.max(1, parseInt(e.target.value) || 0))}
                className="w-full text-sm bg-[#d7ecd7]/80 border-2 border-emerald-300/80 rounded-lg px-3 py-2 text-emerald-950 font-bold focus:bg-[#cde9cd] focus:ring-2 focus:ring-emerald-800 focus:outline-hidden transition-colors"
              />
              <span className="text-[10px] text-neutral-600 mt-1 block">Altezza verticale dal piano di attacco al vertice del cono.</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-900 mb-1 flex items-center gap-1 uppercase tracking-wide">
                  Spessore Lamiera (Sp)
                  <span className="text-[10px] text-neutral-700 font-bold">(mm)</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  required
                  value={fondoSp || ''}
                  onChange={(e) => handleFondoSpChange(Math.max(1, parseInt(e.target.value) || 0))}
                  className="w-full text-sm bg-[#d7ecd7]/80 border-2 border-emerald-300/80 rounded-lg px-3 py-2 text-emerald-950 font-bold focus:bg-[#cde9cd] focus:ring-2 focus:ring-emerald-800 focus:outline-hidden transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-900 mb-1 flex items-center gap-1 uppercase tracking-wide">
                  Altezza Colletto (h_colletto)
                  <span className="text-[10px] text-neutral-700 font-bold">(mm)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  max="1000"
                  required
                  value={fondoColletto ?? ''}
                  onChange={(e) => {
                    setFondoColletto(Math.max(0, parseInt(e.target.value) || 0));
                    setFondoCollettoConfirmed(true);
                  }}
                  className="w-full text-sm bg-[#d7ecd7]/80 border-2 border-emerald-300/80 rounded-lg px-3 py-2 text-emerald-950 font-bold focus:bg-[#cde9cd] focus:ring-2 focus:ring-emerald-800 focus:outline-hidden transition-colors"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'coperchio' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-neutral-950 pb-2 border-b border-neutral-200 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-emerald-800" />
              Geometria Coperchio Bombato
            </h3>

            <div>
              <label className="block text-xs font-bold text-neutral-900 mb-2 flex items-center gap-1.5 uppercase tracking-wide">
                Tipologia Testa Coperchio
                {coperchioUgualeAlFondo && <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-1.5 py-0.5 rounded-sm uppercase">Sincronizzato</span>}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'decinormale', label: 'Decinormale', desc: 'R=1×D, r=D/10' },
                  { id: 'pseudoellittico', label: 'Pseudoellittico', desc: 'R=0.833×D, r=0.156×D' },
                  { id: 'custom', label: 'Custom', desc: 'Misure non std.' },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    disabled={coperchioUgualeAlFondo}
                    onClick={() => !coperchioUgualeAlFondo && setCoperchioType(t.id as HeadType)}
                    className={`flex flex-col items-center justify-center p-3 border-2 rounded-xl text-center transition-all ${
                      coperchioUgualeAlFondo ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                    } ${
                      coperchioType === t.id
                        ? 'border-emerald-800 bg-emerald-50 text-emerald-950 font-extrabold ring-1 ring-emerald-800'
                        : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300'
                    }`}
                  >
                    <span className="text-xs font-bold block">{t.label}</span>
                    <span className="text-[9px] text-neutral-700 mt-0.5 leading-tight font-medium">{t.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-900 mb-1 flex items-center gap-1 uppercase tracking-wide">
                  Spessore Lamiera (Sp)
                  <span className="text-[10px] text-neutral-700 font-bold">(mm)</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  required
                  disabled={coperchioUgualeAlFondo}
                  value={coperchioSp || ''}
                  onChange={(e) => handleCoperchioSpChange(Math.max(1, parseInt(e.target.value) || 0))}
                  className={`w-full text-sm border-2 rounded-lg px-3 py-2 text-emerald-950 font-bold focus:ring-2 focus:ring-emerald-800 focus:outline-hidden ${
                    coperchioUgualeAlFondo
                      ? 'bg-neutral-100 text-neutral-500 border-neutral-300 cursor-not-allowed'
                      : 'bg-[#d7ecd7]/80 border-emerald-300/80 focus:bg-[#cde9cd]'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-900 mb-1 flex items-center gap-1 uppercase tracking-wide">
                  Altezza Colletto (h_colletto)
                  <span className="text-[10px] text-neutral-700 font-bold">(mm)</span>
                </label>
                <div className="relative rounded-md shadow-xs">
                  <input
                    type="number"
                    min="0"
                    max="1000"
                    required
                    disabled={coperchioUgualeAlFondo}
                    value={coperchioColletto ?? ''}
                    onChange={(e) => {
                      setCoperchioColletto(Math.max(0, parseInt(e.target.value) || 0));
                      setCoperchioCollettoConfirmed(true);
                    }}
                    className={`w-full text-sm border-2 rounded-lg px-3 py-2 text-emerald-950 font-bold focus:ring-2 focus:ring-emerald-800 focus:outline-hidden ${
                      coperchioUgualeAlFondo
                        ? 'bg-neutral-100 text-neutral-500 border-neutral-300 cursor-not-allowed'
                        : !coperchioCollettoConfirmed
                        ? 'bg-amber-100 border-amber-400 ring-2 ring-amber-200'
                        : 'bg-[#d7ecd7]/80 border-emerald-300/80 focus:bg-[#cde9cd]'
                    }`}
                  />
                  {coperchioColletto === coperchioSp * 5 && (
                    <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-[10px] text-emerald-900 font-bold italic">
                      5 × Sp
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Colletto Confirmation Prompt */}
            {!coperchioCollettoConfirmed && !coperchioUgualeAlFondo && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between gap-2 animate-fade-in">
                <div className="flex items-start gap-2 text-xs text-amber-800">
                  <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block">Nuovo Colletto Proposto: {coperchioSp * 5} mm</span>
                    <span className="text-[11px] opacity-80">Calcolato automaticamente (5 × Spessore).</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setCoperchioCollettoConfirmed(true)}
                  className="bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-bold py-1 px-2.5 rounded-md transition-colors flex items-center gap-1 shadow-xs"
                >
                  <Check className="w-3 h-3" />
                  Conferma
                </button>
              </div>
            )}

            {coperchioType === 'custom' && (
              <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200 space-y-3 animate-fade-in">
                <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider block">Misure Non Standard (Coperchio)</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-900 mb-1 uppercase tracking-wide">
                      Roggio Bombatura (R_custom) (mm)
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      disabled={coperchioUgualeAlFondo}
                      value={coperchioRCustom || ''}
                      onChange={(e) => setCoperchioRCustom(Math.max(1, parseInt(e.target.value) || 0))}
                      className={`w-full text-sm border-2 rounded-lg px-3 py-1.5 text-emerald-950 font-bold focus:ring-2 focus:ring-emerald-800 focus:outline-hidden ${
                        coperchioUgualeAlFondo
                          ? 'bg-neutral-100 text-neutral-500 border-neutral-300 cursor-not-allowed'
                          : 'bg-[#d7ecd7]/80 border-emerald-300/80 focus:bg-[#cde9cd]'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-900 mb-1 uppercase tracking-wide">
                      Raggio Toro Raccordo (r_custom) (mm)
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      disabled={coperchioUgualeAlFondo}
                      value={coperchioRCustomVal || ''}
                      onChange={(e) => setCoperchioRCustomVal(Math.max(1, parseInt(e.target.value) || 0))}
                      className={`w-full text-sm border-2 rounded-lg px-3 py-1.5 text-emerald-950 font-bold focus:ring-2 focus:ring-emerald-800 focus:outline-hidden ${
                        coperchioUgualeAlFondo
                          ? 'bg-neutral-100 text-neutral-500 border-neutral-300 cursor-not-allowed'
                          : 'bg-[#d7ecd7]/80 border-emerald-300/80 focus:bg-[#cde9cd]'
                      }`}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'report' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-neutral-950 pb-2 border-b border-neutral-200 uppercase tracking-wide">
              Dati Anagrafici Report (Opzionali)
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-neutral-900 mb-1 uppercase tracking-wide">Cliente</label>
                <input
                  type="text"
                  placeholder="es. Eni S.p.A. - Raffineria Sannazzaro"
                  value={cliente}
                  onChange={(e) => setCliente(e.target.value)}
                  className="w-full text-sm bg-[#d7ecd7]/80 border-2 border-emerald-300/80 rounded-lg px-3 py-2 text-emerald-950 font-bold focus:bg-[#cde9cd] focus:ring-2 focus:ring-emerald-800 focus:outline-hidden transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-900 mb-1 uppercase tracking-wide">Riferimento / Commessa</label>
                <input
                  type="text"
                  placeholder="es. Commessa B-349_2026"
                  value={riferimento}
                  onChange={(e) => setRiferimento(e.target.value)}
                  className="w-full text-sm bg-[#d7ecd7]/80 border-2 border-emerald-300/80 rounded-lg px-3 py-2 text-emerald-950 font-bold focus:bg-[#cde9cd] focus:ring-2 focus:ring-emerald-800 focus:outline-hidden transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-900 mb-1 uppercase tracking-wide">Serbatoio Codice/Tag</label>
                  <input
                    type="text"
                    placeholder="es. TK-01 / V-502"
                    value={nomeSerbatoio}
                    onChange={(e) => setNomeSerbatoio(e.target.value)}
                    className="w-full text-sm bg-[#d7ecd7]/80 border-2 border-emerald-300/80 rounded-lg px-3 py-2 text-emerald-950 font-bold focus:bg-[#cde9cd] focus:ring-2 focus:ring-emerald-800 focus:outline-hidden transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-900 mb-1 uppercase tracking-wide">Numero Disegno</label>
                  <input
                    type="text"
                    placeholder="es. DWG-BOMB-01-A"
                    value={numeroDisegno}
                    onChange={(e) => setNumeroDisegno(e.target.value)}
                    className="w-full text-sm bg-[#d7ecd7]/80 border-2 border-emerald-300/80 rounded-lg px-3 py-2 text-emerald-950 font-bold focus:bg-[#cde9cd] focus:ring-2 focus:ring-emerald-800 focus:outline-hidden transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-900 mb-1 uppercase tracking-wide">Data del Rilievo / Report</label>
                <input
                  type="date"
                  value={dataReport}
                  onChange={(e) => setDataReport(e.target.value)}
                  className="w-full text-sm bg-[#d7ecd7]/80 border-2 border-emerald-300/80 rounded-lg px-3 py-2 text-emerald-950 font-bold focus:bg-[#cde9cd] focus:ring-2 focus:ring-emerald-800 focus:outline-hidden transition-colors"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Calculate Button */}
      <button
        type="submit"
        className="w-full bg-emerald-900 hover:bg-emerald-950 text-white font-extrabold py-3.5 px-4 rounded-xl shadow-md transition-colors cursor-pointer flex items-center justify-center gap-2 text-sm uppercase tracking-wide"
      >
        <motion.div
          animate={{ rotate: spinCount * 1080 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="inline-flex shrink-0"
        >
          <RefreshCw className="w-4 h-4 text-emerald-300" />
        </motion.div>
        Esegui Calcolo Taratura e Volumi
      </button>
    </form>
  );
}
