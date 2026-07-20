import React, { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Send, CheckCircle2, AlertTriangle, Cpu, Radio, Network, Wifi, Activity, Sparkles } from 'lucide-react';
import { Todo, RealtimeEvent } from '../../../../backend/src/contracts/api-contract';

interface ProtocolMetrics {
  status: 'connected' | 'connecting' | 'disconnected';
  eventCount: number;
  lastEvent: string;
  logs: string[];
}

export default function RealtimePage() {
  // Input for adding a new todo through REST
  const [todoTitle, setTodoTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Status for each protocol
  const [wsMetrics, setWsMetrics] = useState<ProtocolMetrics>({ status: 'disconnected', eventCount: 0, lastEvent: '-', logs: [] });
  const [ioMetrics, setIoMetrics] = useState<ProtocolMetrics>({ status: 'disconnected', eventCount: 0, lastEvent: '-', logs: [] });
  const [sseMetrics, setSseMetrics] = useState<ProtocolMetrics>({ status: 'disconnected', eventCount: 0, lastEvent: '-', logs: [] });

  // System status metrics from server
  const [systemStatus, setSystemStatus] = useState({ uptime: 0, clientsCount: 0, memoryUsage: 0 });

  // Connections refs
  const wsRef = useRef<WebSocket | null>(null);
  const ioRef = useRef<Socket | null>(null);
  const sseRef = useRef<EventSource | null>(null);

  // Helper to add logs
  const logMessage = (protocol: 'WS' | 'IO' | 'SSE', message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const formatted = `[${timestamp}] ${message}`;

    const updateLogs = (prev: ProtocolMetrics): ProtocolMetrics => ({
      ...prev,
      logs: [formatted, ...prev.logs].slice(0, 15),
      eventCount: prev.eventCount + 1,
      lastEvent: message
    });

    if (protocol === 'WS') setWsMetrics(prev => updateLogs(prev));
    if (protocol === 'IO') setIoMetrics(prev => updateLogs(prev));
    if (protocol === 'SSE') setSseMetrics(prev => updateLogs(prev));
  };

  useEffect(() => {
    // 1. Setup SSE
    setSseMetrics(p => ({ ...p, status: 'connecting' }));
    const sse = new EventSource('http://localhost:3001/api/realtime/sse');
    sseRef.current = sse;

    sse.onopen = () => {
      setSseMetrics(p => ({ ...p, status: 'connected' }));
      logMessage('SSE', 'SSE Connection established');
    };

    sse.onmessage = (event) => {
      try {
        const data: RealtimeEvent = JSON.parse(event.data);
        if (data.type === 'SYSTEM_STATUS') {
          setSystemStatus(data.payload);
        } else {
          logMessage('SSE', `Received Event: ${data.type} (${JSON.stringify(data.payload)})`);
        }
      } catch (err) {
        logMessage('SSE', 'Failed to parse incoming event');
      }
    };

    sse.onerror = () => {
      setSseMetrics(p => ({ ...p, status: 'disconnected' }));
      logMessage('SSE', 'SSE connection failed / re-connecting...');
    };

    // 2. Setup Socket.IO
    setIoMetrics(p => ({ ...p, status: 'connecting' }));
    const socket = io('http://localhost:3001');
    ioRef.current = socket;

    socket.on('connect', () => {
      setIoMetrics(p => ({ ...p, status: 'connected' }));
      logMessage('IO', 'Socket.IO Connection established');
    });

    socket.on('realtime-event', (data: RealtimeEvent) => {
      if (data.type === 'SYSTEM_STATUS') {
        setSystemStatus(data.payload);
      } else {
        logMessage('IO', `Received Event: ${data.type} (${JSON.stringify(data.payload)})`);
      }
    });

    socket.on('disconnect', () => {
      setIoMetrics(p => ({ ...p, status: 'disconnected' }));
      logMessage('IO', 'Socket.IO connection disconnected');
    });

    socket.on('connect_error', () => {
      setIoMetrics(p => ({ ...p, status: 'disconnected' }));
      logMessage('IO', 'Socket.IO connection error');
    });

    // 3. Setup Raw WebSocket
    setWsMetrics(p => ({ ...p, status: 'connecting' }));
    const wsConnect = () => {
      const ws = new WebSocket('ws://localhost:3001/ws');
      wsRef.current = ws;

      ws.onopen = () => {
        setWsMetrics(p => ({ ...p, status: 'connected' }));
        logMessage('WS', 'Raw WebSocket Connection established');
      };

      ws.onmessage = (event) => {
        try {
          const data: RealtimeEvent = JSON.parse(event.data);
          if (data.type === 'SYSTEM_STATUS') {
            setSystemStatus(data.payload);
          } else {
            logMessage('WS', `Received Event: ${data.type} (${JSON.stringify(data.payload)})`);
          }
        } catch (err) {
          logMessage('WS', 'Failed to parse incoming event');
        }
      };

      ws.onclose = () => {
        setWsMetrics(p => ({ ...p, status: 'disconnected' }));
        logMessage('WS', 'Raw WebSocket disconnected. Retrying in 3s...');
        setTimeout(wsConnect, 3000);
      };
    };
    wsConnect();

    return () => {
      sse.close();
      socket.disconnect();
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  // REST API request to add todo
  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!todoTitle.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const res = await fetch('http://localhost:3001/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: todoTitle })
      });
      if (res.ok) {
        setTodoTitle('');
      } else {
        const errData = await res.json();
        alert(`Error: ${errData.error?.message}`);
      }
    } catch (e) {
      alert('REST request failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: ProtocolMetrics['status']) => {
    if (status === 'connected') {
      return <span style={{ padding: '4px 8px', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', fontSize: '12px', fontWeight: 'bold' }}>Active</span>;
    }
    if (status === 'connecting') {
      return <span style={{ padding: '4px 8px', borderRadius: '4px', background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', fontSize: '12px', fontWeight: 'bold' }}>Connecting</span>;
    }
    return <span style={{ padding: '4px 8px', borderRadius: '4px', background: 'rgba(239, 108, 108, 0.2)', color: '#f87171', fontSize: '12px', fontWeight: 'bold' }}>Offline</span>;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      {/* Header Panel */}
      <div className="glass-panel pulse-glow" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h2 style={{ fontSize: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Radio className="gradient-text" style={{ stroke: 'url(#violet-cyan)' }} /> 
            Панель сравнения Realtime протоколов
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
            Изменение данных отправляется через REST API. Сервер транслирует изменения по всем 3 каналам.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-glass)', padding: '10px 16px', borderRadius: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Клиенты на сервере</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--accent-secondary)' }}>{systemStatus.clientsCount}</div>
          </div>
          <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-glass)', padding: '10px 16px', borderRadius: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Аптайм сервера</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--accent-primary)' }}>{systemStatus.uptime}s</div>
          </div>
          <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-glass)', padding: '10px 16px', borderRadius: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Heap Memory</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--accent-success)' }}>{systemStatus.memoryUsage} MB</div>
          </div>
        </div>
      </div>

      {/* Interactive Todo Generator */}
      <div className="glass-panel" style={{ background: 'rgba(15, 23, 42, 0.4)' }}>
        <h3 style={{ fontSize: '18px', marginBottom: '15px', color: 'var(--text-primary)' }}>Имитировать действие пользователя (REST POST /api/todos)</h3>
        <form onSubmit={handleAddTodo} style={{ display: 'flex', gap: '12px' }}>
          <input 
            type="text" 
            placeholder="Что нужно сделать? (минимум 3 символа)" 
            value={todoTitle}
            onChange={(e) => setTodoTitle(e.target.value)}
            disabled={isSubmitting}
            style={{ flex: 1 }}
          />
          <button className="btn btn-primary" type="submit" disabled={isSubmitting || todoTitle.trim().length < 3}>
            {isSubmitting ? 'Отправка...' : 'Отправить REST запрос'}
            <Send size={16} />
          </button>
        </form>
      </div>

      {/* Side-by-side protocols */}
      <div className="grid-cols-3">
        {/* WebSocket */}
        <div className={`glass-panel ${wsMetrics.status === 'connected' ? 'glass-panel-active' : ''}`}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Wifi size={20} color="#8b5cf6" />
              1. Raw WebSocket
            </h4>
            {getStatusBadge(wsMetrics.status)}
          </div>
          <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-glass)', paddingBottom: '6px' }}>
              <span>Получено событий:</span>
              <strong style={{ color: 'var(--text-primary)' }}>{wsMetrics.eventCount}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '6px' }}>
              <span>Последнее событие:</span>
              <strong style={{ color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }}>{wsMetrics.lastEvent}</strong>
            </div>
          </div>
          <div style={{ background: '#090d16', borderRadius: '8px', padding: '12px', height: '200px', overflowY: 'auto' }}>
            <div style={{ fontSize: '11px', color: 'var(--accent-primary)', fontWeight: 'bold', marginBottom: '8px', borderBottom: '1px solid rgba(139, 92, 246, 0.2)', paddingBottom: '4px' }}>LOGS HISTORY</div>
            {wsMetrics.logs.length === 0 ? (
              <span style={{ color: 'var(--text-disabled)', fontSize: '12px' }}>Ожидание подключения...</span>
            ) : (
              wsMetrics.logs.map((log, idx) => (
                <div key={idx} className="mono" style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', lineBreak: 'anywhere' }}>{log}</div>
              ))
            )}
          </div>
        </div>

        {/* Socket.IO */}
        <div className={`glass-panel ${ioMetrics.status === 'connected' ? 'glass-panel-active' : ''}`} style={{ borderColor: ioMetrics.status === 'connected' ? 'var(--accent-secondary)' : '', boxShadow: ioMetrics.status === 'connected' ? '0 0 20px var(--accent-secondary-glow)' : '' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={20} color="#06b6d4" />
              2. Socket.IO
            </h4>
            {getStatusBadge(ioMetrics.status)}
          </div>
          <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-glass)', paddingBottom: '6px' }}>
              <span>Получено событий:</span>
              <strong style={{ color: 'var(--text-primary)' }}>{ioMetrics.eventCount}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '6px' }}>
              <span>Последнее событие:</span>
              <strong style={{ color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }}>{ioMetrics.lastEvent}</strong>
            </div>
          </div>
          <div style={{ background: '#090d16', borderRadius: '8px', padding: '12px', height: '200px', overflowY: 'auto' }}>
            <div style={{ fontSize: '11px', color: 'var(--accent-secondary)', fontWeight: 'bold', marginBottom: '8px', borderBottom: '1px solid rgba(6, 182, 212, 0.2)', paddingBottom: '4px' }}>LOGS HISTORY</div>
            {ioMetrics.logs.length === 0 ? (
              <span style={{ color: 'var(--text-disabled)', fontSize: '12px' }}>Ожидание подключения...</span>
            ) : (
              ioMetrics.logs.map((log, idx) => (
                <div key={idx} className="mono" style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', lineBreak: 'anywhere' }}>{log}</div>
              ))
            )}
          </div>
        </div>

        {/* SSE */}
        <div className={`glass-panel ${sseMetrics.status === 'connected' ? 'glass-panel-active' : ''}`} style={{ borderColor: sseMetrics.status === 'connected' ? 'var(--accent-success)' : '', boxShadow: sseMetrics.status === 'connected' ? '0 0 20px rgba(16, 185, 129, 0.2)' : '' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Network size={20} color="#10b981" />
              3. Server-Sent Events (SSE)
            </h4>
            {getStatusBadge(sseMetrics.status)}
          </div>
          <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-glass)', paddingBottom: '6px' }}>
              <span>Получено событий:</span>
              <strong style={{ color: 'var(--text-primary)' }}>{sseMetrics.eventCount}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '6px' }}>
              <span>Последнее событие:</span>
              <strong style={{ color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }}>{sseMetrics.lastEvent}</strong>
            </div>
          </div>
          <div style={{ background: '#090d16', borderRadius: '8px', padding: '12px', height: '200px', overflowY: 'auto' }}>
            <div style={{ fontSize: '11px', color: 'var(--accent-success)', fontWeight: 'bold', marginBottom: '8px', borderBottom: '1px solid rgba(16, 185, 129, 0.2)', paddingBottom: '4px' }}>LOGS HISTORY</div>
            {sseMetrics.logs.length === 0 ? (
              <span style={{ color: 'var(--text-disabled)', fontSize: '12px' }}>Ожидание подключения...</span>
            ) : (
              sseMetrics.logs.map((log, idx) => (
                <div key={idx} className="mono" style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', lineBreak: 'anywhere' }}>{log}</div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Detailed Analysis Table */}
      <div className="glass-panel" style={{ overflowX: 'auto' }}>
        <h3 style={{ fontSize: '18px', marginBottom: '15px', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Cpu size={18} /> Сравнение и критерии выбора
        </h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', minWidth: '700px' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border-glass)', textAlign: 'left', color: 'var(--text-primary)' }}>
              <th style={{ padding: '12px 8px' }}>Параметр</th>
              <th style={{ padding: '12px 8px', color: '#8b5cf6' }}>Raw WebSocket</th>
              <th style={{ padding: '12px 8px', color: '#06b6d4' }}>Socket.IO</th>
              <th style={{ padding: '12px 8px', color: '#10b981' }}>SSE (Server-Sent Events)</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-muted)' }}>
              <td style={{ padding: '12px 8px', fontWeight: 'bold', color: 'var(--text-primary)' }}>Направление</td>
              <td style={{ padding: '12px 8px' }}>Дуплекс (Двунаправленный)</td>
              <td style={{ padding: '12px 8px' }}>Дуплекс (Двунаправленный)</td>
              <td style={{ padding: '12px 8px' }}>Полудуплекс (Только от сервера к клиенту)</td>
            </tr>
            <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-muted)' }}>
              <td style={{ padding: '12px 8px', fontWeight: 'bold', color: 'var(--text-primary)' }}>Протокол</td>
              <td style={{ padding: '12px 8px' }}>WS (поверх TCP). Требует рукопожатия</td>
              <td style={{ padding: '12px 8px' }}>Собственный протокол поверх WS или HTTP Long-polling</td>
              <td style={{ padding: '12px 8px' }}>Стандартный HTTP / HTTP/2</td>
            </tr>
            <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-muted)' }}>
              <td style={{ padding: '12px 8px', fontWeight: 'bold', color: 'var(--text-primary)' }}>Подключение из коробки</td>
              <td style={{ padding: '12px 8px' }}>Да (браузерный API `WebSocket`)</td>
              <td style={{ padding: '12px 8px' }}>Нет (требует библиотек на клиенте и сервере)</td>
              <td style={{ padding: '12px 8px' }}>Да (браузерный API `EventSource`)</td>
            </tr>
            <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-muted)' }}>
              <td style={{ padding: '12px 8px', fontWeight: 'bold', color: 'var(--text-primary)' }}>Авто-реконнект</td>
              <td style={{ padding: '12px 8px' }}>Нет (ручная реализация)</td>
              <td style={{ padding: '12px 8px' }}>Да (встроенный с экспоненциальным бэкоффом)</td>
              <td style={{ padding: '12px 8px' }}>Да (встроенный автоматический реконнект)</td>
            </tr>
            <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-muted)' }}>
              <td style={{ padding: '12px 8px', fontWeight: 'bold', color: 'var(--text-primary)' }}>Работа через Proxy/Firewall</td>
              <td style={{ padding: '12px 8px' }}>Может блокироваться корпоративными прокси</td>
              <td style={{ padding: '12px 8px' }}>Обходит благодаря запасному HTTP Long-polling</td>
              <td style={{ padding: '12px 8px' }}>Отлично (обычный HTTP трафик)</td>
            </tr>
            <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-muted)' }}>
              <td style={{ padding: '12px 8px', fontWeight: 'bold', color: 'var(--text-primary)' }}>Основные плюсы</td>
              <td style={{ padding: '12px 8px', color: '#a78bfa' }}>Максимальная скорость, минимальный оверхед, нет сторонних зависимостей.</td>
              <td style={{ padding: '12px 8px', color: '#22d3ee' }}>Авто-реконнект, комнаты/комнаты вещания, фолбек на лонг-пуллинг.</td>
              <td style={{ padding: '12px 8px', color: '#34d399' }}>Работает поверх HTTP/2, простой API, авто-реконнект, не нагружает порты.</td>
            </tr>
            <tr style={{ color: 'var(--text-muted)' }}>
              <td style={{ padding: '12px 8px', fontWeight: 'bold', color: 'var(--text-primary)' }}>Когда использовать</td>
              <td style={{ padding: '12px 8px' }}>Высоконагруженные чаты, игры, биржевые котировки (где критичен пинг).</td>
              <td style={{ padding: '12px 8px' }}>Сложные энтерпрайз приложения с чатами, групповым редактированием документов.</td>
              <td style={{ padding: '12px 8px' }}>Ленты новостей, уведомления, дашборды мониторинга, подписка на логи.</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Learning resources card */}
      <div className="glass-panel" style={{ background: 'rgba(139, 92, 246, 0.03)', borderColor: 'rgba(139, 92, 246, 0.2)' }}>
        <h3 style={{ fontSize: '16px', marginBottom: '10px', color: 'var(--text-primary)' }}>📚 Ресурсы для углубленного изучения:</h3>
        <ul style={{ paddingLeft: '20px', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--text-muted)' }}>
          <li>
            <a href="https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API" target="_blank" rel="noreferrer" style={{ color: 'var(--accent-primary)', textDecoration: 'none', fontWeight: 'bold' }}>MDN WebSocket API</a> — руководство по нативному протоколу WebSocket.
          </li>
          <li>
            <a href="https://socket.io/docs/v4/" target="_blank" rel="noreferrer" style={{ color: 'var(--accent-secondary)', textDecoration: 'none', fontWeight: 'bold' }}>Socket.IO Official Documentation</a> — всё о комнатах, пространствах имен и стратегиях фолбеков.
          </li>
          <li>
            <a href="https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events" target="_blank" rel="noreferrer" style={{ color: 'var(--accent-success)', textDecoration: 'none', fontWeight: 'bold' }}>MDN Server-Sent Events</a> — особенности создания однонаправленных каналов событий по обычному HTTP.
          </li>
        </ul>
      </div>


      <svg width="0" height="0">
        <linearGradient id="violet-cyan" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
      </svg>
    </div>
  );
}
