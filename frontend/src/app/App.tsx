import React, { useState } from 'react';
import { Radio, Layers, ShieldCheck, ClipboardList, BookOpen, ExternalLink, Sparkles } from 'lucide-react';
import RealtimePage from '../pages/realtime/RealtimePage';
import PatternsPage from '../pages/patterns/PatternsPage';
import SolidPage from '../pages/solid/SolidPage';
import FormsPage from '../pages/forms/FormsPage';

type Tab = 'realtime' | 'patterns' | 'solid' | 'forms';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('realtime');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'realtime':
        return <RealtimePage />;
      case 'patterns':
        return <PatternsPage />;
      case 'solid':
        return <SolidPage />;
      case 'forms':
        return <FormsPage />;
    }
  };

  return (
    <div>
      {/* Top Banner */}
      <header style={{ borderBottom: '1px solid var(--border-glass)', background: 'rgba(15, 23, 42, 0.8)', sticky: 'top', backdropFilter: 'blur(10px)', zIndex: 10 }}>
        <div className="container" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '24px' }}>🚀</span>
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: '800', letterSpacing: '-0.03em' }} className="gradient-text">
                Платформа Практики PDP
              </h1>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Всё по пунктам плана развития фронтендера</p>
            </div>
          </div>

          {/* Tab Navigation buttons */}
          <nav style={{ display: 'flex', gap: '8px', background: 'rgba(0,0,0,0.2)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border-glass)' }}>
            <button
              onClick={() => setActiveTab('realtime')}
              className="btn"
              style={{
                background: activeTab === 'realtime' ? 'var(--accent-primary)' : 'transparent',
                color: activeTab === 'realtime' ? 'white' : 'var(--text-muted)',
                padding: '8px 16px',
                fontSize: '13px',
                borderRadius: '8px'
              }}
            >
              <Radio size={14} /> 1. Realtime
            </button>
            <button
              onClick={() => setActiveTab('patterns')}
              className="btn"
              style={{
                background: activeTab === 'patterns' ? 'var(--accent-primary)' : 'transparent',
                color: activeTab === 'patterns' ? 'white' : 'var(--text-muted)',
                padding: '8px 16px',
                fontSize: '13px',
                borderRadius: '8px'
              }}
            >
              <Layers size={14} /> 2. Patterns
            </button>
            <button
              onClick={() => setActiveTab('solid')}
              className="btn"
              style={{
                background: activeTab === 'solid' ? 'var(--accent-primary)' : 'transparent',
                color: activeTab === 'solid' ? 'white' : 'var(--text-muted)',
                padding: '8px 16px',
                fontSize: '13px',
                borderRadius: '8px'
              }}
            >
              <ShieldCheck size={14} /> 4. SOLID
            </button>
            <button
              onClick={() => setActiveTab('forms')}
              className="btn"
              style={{
                background: activeTab === 'forms' ? 'var(--accent-primary)' : 'transparent',
                color: activeTab === 'forms' ? 'white' : 'var(--text-muted)',
                padding: '8px 16px',
                fontSize: '13px',
                borderRadius: '8px'
              }}
            >
              <ClipboardList size={14} /> 6. Forms
            </button>
          </nav>
        </div>
      </header>

      {/* Main Workspace container */}
      <main className="container" style={{ minHeight: 'calc(100vh - 220px)' }}>
        {renderTabContent()}
      </main>

      {/* Documentation footer linking to .md files */}
      <footer style={{ borderTop: '1px solid var(--border-glass)', background: 'rgba(15, 23, 42, 0.9)', padding: '30px 20px', marginTop: '60px' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <h4 style={{ fontSize: '14px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <BookOpen size={16} color="var(--accent-secondary)" /> Теоретические модули (Markdown файлы)
            </h4>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Темы монолитов/микросервисов, стратегий тестирования и Feature-Sliced Design подробно описаны в документации.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <a
              href="file:///d:/practice/pdp/docs/03-monolith-microservices.md"
              target="_blank"
              rel="noreferrer"
              className="btn btn-secondary"
              style={{ fontSize: '12px', padding: '6px 12px', display: 'flex', gap: '6px', textDecoration: 'none' }}
            >
              <span>03. Monorepo vs Polyrepo / Monolith vs Microservices</span>
              <ExternalLink size={12} />
            </a>
            <a
              href="file:///d:/practice/pdp/docs/07-testing-strategy.md"
              target="_blank"
              rel="noreferrer"
              className="btn btn-secondary"
              style={{ fontSize: '12px', padding: '6px 12px', display: 'flex', gap: '6px', textDecoration: 'none' }}
            >
              <span>07. Testing Strategy</span>
              <ExternalLink size={12} />
            </a>
            <a
              href="file:///d:/practice/pdp/docs/08-fsd-architecture.md"
              target="_blank"
              rel="noreferrer"
              className="btn btn-secondary"
              style={{ fontSize: '12px', padding: '6px 12px', display: 'flex', gap: '6px', textDecoration: 'none' }}
            >
              <span>08. FSD & Alternatives</span>
              <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
