import React, { useState } from 'react';
import { Layers, HelpCircle, AlertTriangle, PlayCircle, Code } from 'lucide-react';

interface PatternData {
  id: string;
  name: string;
  problem: string;
  harm: string;
  code: string;
  demoComponent: React.ComponentType;
}

// Demo Components for each pattern

// 1. Container / Presenter Demo
function PresenterComponent({ data, loading }: { data: string[]; loading: boolean }) {
  if (loading) return <span style={{ color: 'var(--text-muted)' }}>Загрузка списка пользователей...</span>;
  return (
    <ul style={{ paddingLeft: '20px' }}>
      {data.map((user, i) => <li key={i} style={{ color: 'var(--accent-secondary)' }}>{user}</li>)}
    </ul>
  );
}

function ContainerPresenterDemo() {
  const [users, setUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchUsers = () => {
    setLoading(true);
    setTimeout(() => {
      setUsers(['Дмитрий (Dev)', 'Анна (QA)', 'Алексей (Product)']);
      setLoading(false);
    }, 1000);
  };

  return (
    <div>
      <button className="btn btn-secondary" onClick={fetchUsers} style={{ marginBottom: '10px' }} disabled={loading}>
        Загрузить данные (Имитация Container)
      </button>
      <PresenterComponent data={users} loading={loading} />
    </div>
  );
}

// 2. HOC Demo
function withLogger<P extends object>(WrappedComponent: React.ComponentType<P>) {
  return function WithLoggerComponent(props: P) {
    const [log, setLog] = useState<string[]>([]);
    const triggerAction = () => {
      setLog(prev => [`Кликнут в ${new Date().toLocaleTimeString()}`, ...prev].slice(0, 3));
    };
    return (
      <div style={{ border: '1px dashed var(--border-glass)', padding: '10px', borderRadius: '8px' }}>
        <WrappedComponent {...props} onClick={triggerAction} />
        {log.length > 0 && (
          <div style={{ marginTop: '6px', fontSize: '12px', color: 'var(--accent-success)' }}>
            HOC Logs: {log.join(' | ')}
          </div>
        )}
      </div>
    );
  };
}

const SimpleButton = ({ onClick }: { onClick?: () => void }) => (
  <button className="btn btn-primary" onClick={onClick}>Кликни меня (HOC Target)</button>
);
const ButtonWithLogger = withLogger(SimpleButton);

// 3. Render Props Demo
interface MouseTrackerProps {
  render: (position: { x: number; y: number }) => React.ReactNode;
}
function MouseTracker({ render }: MouseTrackerProps) {
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setCoords({
      x: Math.round(e.clientX - rect.left),
      y: Math.round(e.clientY - rect.top)
    });
  };
  return (
    <div 
      onMouseMove={handleMouseMove}
      style={{ height: '120px', border: '1px solid var(--border-glass)', borderRadius: '8px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#090d16', cursor: 'crosshair' }}
    >
      <span style={{ color: 'var(--text-disabled)' }}>Двигайте мышь здесь</span>
      {render(coords)}
    </div>
  );
}

function RenderPropsDemo() {
  return (
    <MouseTracker render={({ x, y }) => (
      <div style={{ position: 'absolute', bottom: '10px', right: '10px', fontSize: '12px', color: 'var(--accent-secondary)' }} className="mono">
        X: {x}, Y: {y}
      </div>
    )} />
  );
}

// 4. Custom Hook Demo
function useCounter(initial = 0) {
  const [count, setCount] = useState(initial);
  const increment = () => setCount(c => c + 1);
  const decrement = () => setCount(c => c - 1);
  return { count, increment, decrement };
}

function CustomHookDemo() {
  const { count, increment, decrement } = useCounter(10);
  return (
    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
      <button className="btn btn-secondary" onClick={decrement}>-</button>
      <span className="mono" style={{ fontSize: '20px', minWidth: '40px', textAlign: 'center' }}>{count}</span>
      <button className="btn btn-secondary" onClick={increment}>+</button>
    </div>
  );
}

// 5. Compound Components Demo
const AccordionContext = React.createContext<{ activeKey: string; setActiveKey: (key: string) => void } | null>(null);

function Accordion({ children }: { children: React.ReactNode }) {
  const [activeKey, setActiveKey] = useState('');
  return (
    <AccordionContext.Provider value={{ activeKey, setActiveKey }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>{children}</div>
    </AccordionContext.Provider>
  );
}

function AccordionItem({ eventKey, children }: { eventKey: string; children: React.ReactNode }) {
  return <div style={{ border: '1px solid var(--border-glass)', borderRadius: '6px', overflow: 'hidden' }}>{children}</div>;
}

function AccordionHeader({ eventKey, title }: { eventKey: string; title: string }) {
  const context = React.useContext(AccordionContext);
  if (!context) throw new Error('AccordionHeader must be used inside Accordion');
  const isOpen = context.activeKey === eventKey;
  return (
    <div 
      onClick={() => context.setActiveKey(isOpen ? '' : eventKey)}
      style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between' }}
    >
      <span>{title}</span>
      <span>{isOpen ? '▲' : '▼'}</span>
    </div>
  );
}

function AccordionBody({ eventKey, children }: { eventKey: string; children: React.ReactNode }) {
  const context = React.useContext(AccordionContext);
  if (!context) throw new Error('AccordionBody must be used inside Accordion');
  const isOpen = context.activeKey === eventKey;
  if (!isOpen) return null;
  return <div style={{ padding: '10px', borderTop: '1px solid var(--border-glass)', fontSize: '14px', color: 'var(--text-muted)' }}>{children}</div>;
}

function CompoundComponentsDemo() {
  return (
    <Accordion>
      <AccordionItem eventKey="1">
        <AccordionHeader eventKey="1" title="Секция 1: Описание" />
        <AccordionBody eventKey="1">Это скрытый контент первой секции аккордеона, управляемый через Context.</AccordionBody>
      </AccordionItem>
      <AccordionItem eventKey="2">
        <AccordionHeader eventKey="2" title="Секция 2: Подробности" />
        <AccordionBody eventKey="2">Здесь находятся дополнительные детали, рендеринг которых полностью декларативен.</AccordionBody>
      </AccordionItem>
    </Accordion>
  );
}

// 6. Controlled vs Uncontrolled Components Demo
function ControlledUncontrolledDemo() {
  const [controlledVal, setControlledVal] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const [uncontrolledVal, setUncontrolledVal] = useState('');

  const readUncontrolled = () => {
    if (inputRef.current) {
      setUncontrolledVal(inputRef.current.value);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
      <div>
        <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Controlled Input (updates state on type):</label>
        <input value={controlledVal} onChange={e => setControlledVal(e.target.value)} placeholder="Ввод..." />
        <span style={{ fontSize: '12px', color: 'var(--accent-primary)' }}>State: "{controlledVal}"</span>
      </div>
      <div>
        <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Uncontrolled Input (uses ref):</label>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input ref={inputRef} placeholder="Ввод..." />
          <button className="btn btn-secondary" onClick={readUncontrolled}>Прочесть ref</button>
        </div>
        <span style={{ fontSize: '12px', color: 'var(--accent-secondary)' }}>Val: "{uncontrolledVal}"</span>
      </div>
    </div>
  );
}

// 7. State Reducer Pattern Demo
interface ToggleState {
  on: boolean;
}
type ToggleAction = { type: 'TOGGLE' } | { type: 'RESET' };

function toggleReducer(state: ToggleState, action: ToggleAction): ToggleState {
  switch (action.type) {
    case 'TOGGLE':
      return { on: !state.on };
    case 'RESET':
      return { on: false };
    default:
      return state;
  }
}

interface CustomToggleProps {
  reducer?: (state: ToggleState, action: ToggleAction) => ToggleState;
}

function StateReducerDemo({ reducer = toggleReducer }: CustomToggleProps) {
  // Имитация инверсии контроля через кастомный редьюсер
  const [clicks, setClicks] = useState(0);
  const [state, dispatch] = React.useReducer((s: ToggleState, a: ToggleAction) => {
    // Пользовательское ограничение: не разрешать включать после 4 кликов
    const nextState = reducer(s, a);
    if (a.type === 'TOGGLE' && clicks >= 4) {
      return { on: false }; // Игнорируем стандартный переход, принудительно выключаем
    }
    return nextState;
  }, { on: false });

  const handleToggle = () => {
    setClicks(c => c + 1);
    dispatch({ type: 'TOGGLE' });
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '8px' }}>
        <button className="btn btn-primary" onClick={handleToggle}>Переключить</button>
        <button className="btn btn-secondary" onClick={() => { dispatch({ type: 'RESET' }); setClicks(0); }}>Сброс</button>
        <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Кликов: {clicks}</span>
      </div>
      <div>
        Статус: {state.on ? (
          <span style={{ color: 'var(--accent-success)', fontWeight: 'bold' }}>ВКЛЮЧЕН</span>
        ) : (
          <span style={{ color: 'var(--accent-error)', fontWeight: 'bold' }}>ВЫКЛЮЧЕН (Лимит кликов: 4)</span>
        )}
      </div>
    </div>
  );
}

// Data Array
const patternsList: PatternData[] = [
  {
    id: 'container-presenter',
    name: '1. Container / Presenter',
    problem: 'Разделение бизнес-логики (запросы к API, управление стейтом) и визуального рендеринга (разметка, стили). Позволяет тестировать UI отдельно от данных.',
    harm: 'Устарел с приходом React hooks. Создает лишние файлы, усложняет чтение кода (prop drilling от контейнера к презентеру). Сейчас проще использовать Custom Hooks.',
    demoComponent: ContainerPresenterDemo,
    code: `// Container Component
function UserListContainer() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const fetchUsers = () => { ... };

  return <UserListPresenter data={users} loading={loading} />;
}

// Presenter Component
function UserListPresenter({ data, loading }) {
  if (loading) return <span>Loading...</span>;
  return <ul>{data.map(u => <li>{u}</li>)}</ul>;
}`
  },
  {
    id: 'hoc',
    name: '2. Higher-Order Components (HOC)',
    problem: 'Переиспользование логики компонентов (например, проверка прав доступа, логирование, подписка на сторы) путем оборачивания одного компонента в другой.',
    harm: 'Создает "wrapper hell" в DOM дереве. Может вызывать конфликты имен пропсов (props name collision), неявно пробрасывая свойства, что затрудняет типизацию в TypeScript.',
    demoComponent: ButtonWithLogger,
    code: `// Реализация HOC
function withLogger(WrappedComponent) {
  return function WithLoggerComponent(props) {
    const log = () => console.log('Component rendered');
    return <WrappedComponent {...props} log={log} />;
  };
}

// Использование
const SimpleButton = (props) => <button onClick={props.log}>Click</button>;
const ButtonWithLogger = withLogger(SimpleButton);`
  },
  {
    id: 'render-props',
    name: '3. Render Props',
    problem: 'Шаринг динамического состояния/поведения между компонентами через проп, принимающий функцию рендеринга (альтернатива HOC).',
    harm: 'Приводит к callback-hell в JSX разметке при использовании нескольких провайдеров. Сильно перегружает читаемость шаблонов. Заменен кастомными хуками.',
    demoComponent: RenderPropsDemo,
    code: `// Компонент с Render Prop
function MouseTracker({ render }) {
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  return (
    <div onMouseMove={(e) => setCoords({ x: e.clientX, y: e.clientY })}>
      {render(coords)}
    </div>
  );
}

// Использование
<MouseTracker render={({ x, y }) => <span>X: {x}, Y: {y}</span>} />`
  },
  {
    id: 'custom-hooks',
    name: '4. Custom Hooks',
    problem: 'Современный стандарт React для инкапсуляции и переиспользования логики состояния. Позволяет избавиться от HOC и Render Props.',
    harm: 'Избыточное дробление: создание хуков на каждую микроскопическую операцию захламляет проект. Иногда разработчики шарят состояние через хук, забывая, что каждый вызов хука создает независимый изолированный стейт.',
    demoComponent: CustomHookDemo,
    code: `// Кастомный хук
function useCounter(initial = 0) {
  const [count, setCount] = useState(initial);
  const increment = () => setCount(c => c + 1);
  return { count, increment };
}

// Использование в любом компоненте
const { count, increment } = useCounter(10);`
  },
  {
    id: 'compound-components',
    name: '5. Compound Components',
    problem: 'Создание связанных компонентов, которые неявно делят общее состояние (например, Select и Option, Tabs и Tab, Accordion). Позволяет строить гибкие декларативные UI.',
    harm: 'Связывает дочерние элементы с родителем. Если нарушить иерархию (например, обернуть AccordionHeader во вспомогательный div), контекст сломается. Усложняет DOM.',
    demoComponent: CompoundComponentsDemo,
    code: `const AccordionContext = React.createContext();

function Accordion({ children }) {
  const [active, setActive] = useState('');
  return (
    <AccordionContext.Provider value={{ active, setActive }}>
      {children}
    </AccordionContext.Provider>
  );
}

function AccordionHeader({ eventKey, title }) {
  const { active, setActive } = useContext(AccordionContext);
  return <div onClick={() => setActive(eventKey)}>{title}</div>;
}`
  },
  {
    id: 'controlled-uncontrolled',
    name: '6. Controlled / Uncontrolled',
    problem: 'Управление значениями полей ввода: хранить ли состояние в стейте React (Controlled) для валидации на лету, или брать напрямую из DOM через ref (Uncontrolled) для скорости.',
    harm: 'Контролируемые компоненты тормозят на тяжелых формах (много ререндеров). Неконтролируемые сложно синхронизировать с внешним состоянием или очищать программно.',
    demoComponent: ControlledUncontrolledDemo,
    code: `// Controlled
const [val, setVal] = useState('');
<input value={val} onChange={e => setVal(e.target.value)} />

// Uncontrolled
const inputRef = useRef();
const read = () => console.log(inputRef.current.value);
<input ref={inputRef} />`
  },
  {
    id: 'state-reducer',
    name: '7. State Reducer',
    problem: 'Инверсия контроля состояния (Inversion of Control). Позволяет пользователю компонента передавать свой обработчик состояний (reducer), переопределяя логику переходов.',
    harm: 'Экстремально высокая когнитивная нагрузка. Нужен только в сложных библиотеках UI общего назначения (например, Downshift). В обычном продуктовом коде избыточен.',
    demoComponent: StateReducerDemo,
    code: `function toggleReducer(state, action) {
  switch (action.type) {
    case 'TOGGLE': return { on: !state.on };
    default: return state;
  }
}

// Компонент принимает кастомный reducer и изменяет логику
function CustomToggle({ reducer = toggleReducer }) {
  const [state, dispatch] = useReducer(reducer, { on: false });
  return <button onClick={() => dispatch({ type: 'TOGGLE' })}>Toggle</button>;
}`
  }
];

export default function PatternsPage() {
  const [selectedPatternId, setSelectedPatternId] = useState(patternsList[0].id);

  const selectedPattern = patternsList.find(p => p.id === selectedPatternId)!;
  const DemoComponent = selectedPattern.demoComponent;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      <div className="glass-panel" style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
        <Layers size={36} color="var(--accent-primary)" />
        <div>
          <h2 style={{ fontSize: '24px' }}>7 паттернов проектирования в React</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
            Интерактивный разбор ключевых шаблонов проектирования, решаемых проблем и негативных последствий их оверинжиниринга.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '24px' }}>
        {/* Navigation Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {patternsList.map(pattern => (
            <button
              key={pattern.id}
              onClick={() => setSelectedPatternId(pattern.id)}
              className="btn"
              style={{
                justifyContent: 'flex-start',
                textAlign: 'left',
                background: selectedPatternId === pattern.id ? 'var(--accent-primary-glow)' : 'rgba(255,255,255,0.02)',
                borderColor: selectedPatternId === pattern.id ? 'var(--accent-primary)' : 'var(--border-glass)',
                color: selectedPatternId === pattern.id ? 'var(--text-primary)' : 'var(--text-muted)'
              }}
            >
              {pattern.name}
            </button>
          ))}
        </div>

        {/* Content Viewer */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '20px', color: 'var(--accent-secondary)' }}>{selectedPattern.name}</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '15px', borderRadius: '8px', borderLeft: '3px solid var(--accent-secondary)' }}>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: 'var(--text-primary)', marginBottom: '4px' }}>
                <HelpCircle size={16} color="var(--accent-secondary)" /> Какую проблему решает?
              </h4>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{selectedPattern.problem}</p>
            </div>

            <div style={{ background: 'rgba(239, 68, 68, 0.05)', padding: '15px', borderRadius: '8px', borderLeft: '3px solid var(--accent-error)' }}>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: '#fca5a5', marginBottom: '4px' }}>
                <AlertTriangle size={16} color="var(--accent-error)" /> Когда приносит вред?
              </h4>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{selectedPattern.harm}</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '10px' }}>
            {/* Interactive Demo */}
            <div>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: 'var(--text-primary)', marginBottom: '10px' }}>
                <PlayCircle size={16} color="var(--accent-success)" /> Интерактивное демо:
              </h4>
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-glass)', minHeight: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <DemoComponent />
              </div>
            </div>

            {/* Code Snippet */}
            <div>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: 'var(--text-primary)', marginBottom: '10px' }}>
                <Code size={16} color="var(--accent-primary)" /> Пример реализации:
              </h4>
              <pre className="mono" style={{ background: '#090d16', padding: '15px', borderRadius: '8px', border: '1px solid var(--border-glass)', fontSize: '11px', color: '#c9d1d9', overflowX: 'auto', maxHeight: '180px' }}>
                <code>{selectedPattern.code}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>

      {/* Learning resources card */}
      <div className="glass-panel" style={{ background: 'rgba(139, 92, 246, 0.03)', borderColor: 'rgba(139, 92, 246, 0.2)', marginTop: '24px' }}>
        <h3 style={{ fontSize: '16px', marginBottom: '10px', color: 'var(--text-primary)' }}>📚 Ресурсы для углубленного изучения паттернов:</h3>
        <ul style={{ paddingLeft: '20px', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--text-muted)' }}>
          <li>
            <a href="https://www.patterns.dev/react/" target="_blank" rel="noreferrer" style={{ color: 'var(--accent-primary)', textDecoration: 'none', fontWeight: 'bold' }}>Patterns.dev (React Design Patterns)</a> — лучший интерактивный визуальный учебник по шаблонам проектирования в JavaScript и React.
          </li>
          <li>
            <a href="https://kentcdodds.com/blog/compound-components-with-react-hooks" target="_blank" rel="noreferrer" style={{ color: 'var(--accent-secondary)', textDecoration: 'none', fontWeight: 'bold' }}>Kent C. Dodds - Compound Components</a> — детальное практическое руководство по созданию составных компонентов с использованием React Context.
          </li>
          <li>
            <a href="https://react.dev/learn/reusing-logic-with-custom-hooks" target="_blank" rel="noreferrer" style={{ color: 'var(--accent-success)', textDecoration: 'none', fontWeight: 'bold' }}>Official React Docs: Reusing Logic</a> — официальное руководство по созданию пользовательских хуков состояния.
          </li>
        </ul>
      </div>
    </div>

  );
}
