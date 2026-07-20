import React, { useState } from 'react';
import { ShieldCheck, Info, XCircle, CheckCircle } from 'lucide-react';

interface SolidPrinciple {
  key: string;
  name: string;
  definition: string;
  testabilityImpact: string;
  badCode: string;
  goodCode: string;
}

const solidPrinciples: SolidPrinciple[] = [
  {
    key: 's',
    name: 'S - Single Responsibility (Единственная ответственность)',
    definition: 'Компонент должен решать только одну задачу. Он не должен одновременно заниматься фетчингом данных, бизнес-логикой, сложным форматированием и рендерингом UI.',
    testabilityImpact: 'Легко тестировать чистые презентационные компоненты (пропсы на вход -> DOM на выход) и хуки с бизнес-логикой отдельно. В спагетти-компоненте придется мокать fetch, таймеры и окружение.',
    badCode: `// 🔴 НАРУШЕНИЕ: Компонент сам фетчит, форматирует и рендерит
function UserProfile() {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    fetch('/api/user/1').then(r => r.json()).then(setUser);
  }, []);

  if (!user) return <div>Загрузка...</div>;
  const formattedDate = new Date(user.registeredAt).toLocaleDateString();

  return (
    <div>
      <h3>{user.name.toUpperCase()}</h3>
      <p>Зарегистрирован: {formattedDate}</p>
    </div>
  );
}`,
    goodCode: `// 🟢 СОБЛЮДЕНИЕ: Логика вынесена в хук, отображение - в чистый компонент
// 1. Хук данных (легко мокать в тестах)
function useUser(id) {
  const [user, setUser] = useState(null);
  useEffect(() => {
    fetch(\`/api/user/\${id}\`).then(r => r.json()).then(setUser);
  }, [id]);
  return { user, loading: !user };
}

// 2. Презентационный компонент (простейшие тесты)
function UserProfileCard({ name, registeredAt }) {
  const formattedDate = new Date(registeredAt).toLocaleDateString();
  return (
    <div>
      <h3>{name.toUpperCase()}</h3>
      <p>Зарегистрирован: {formattedDate}</p>
    </div>
  );
}`
  },
  {
    key: 'o',
    name: 'O - Open/Closed (Открытость / Закрытость)',
    definition: 'Компоненты должны быть открыты для расширения, но закрыты для модификации. Не нужно переписывать внутренний код компонента каждый раз, когда меняются требования.',
    testabilityImpact: 'Если компонент расширяем через composition (children/slots), мы пишем один тест на базовый функционал. При жестких if/else приходится тестировать все новые ветки.',
    badCode: `// 🔴 НАРУШЕНИЕ: Изменение базового компонента под новые фичи
function Button({ text, type, showSearchIcon, showArrowIcon }) {
  return (
    <button>
      {showSearchIcon && <SearchIcon />}
      {text}
      {showArrowIcon && <ArrowIcon />}
    </button>
  );
}`,
    goodCode: `// 🟢 СОБЛЮДЕНИЕ: Декларативное расширение через composability
function Button({ children, ...props }) {
  return (
    <button {...props}>
      {children}
    </button>
  );
}

// Использование: расширяем кнопку иконками снаружи, не трогая код кнопки
<Button><SearchIcon /> Поиск</Button>
<Button>Далее <ArrowIcon /></Button>`
  },
  {
    key: 'l',
    name: 'L - Liskov Substitution (Подстановка Барбары Лисков)',
    definition: 'Дочерние/расширенные компоненты должны сохранять контракты и поведение родительских классов/тегов, не ломая ожидания пользователя.',
    testabilityImpact: 'Позволяет писать общие тестовые сценарии для группы схожих компонентов. Если кастомный инпут не поддерживает стандартный `onChange`, существующие тесты форм упадут.',
    badCode: `// 🔴 НАРУШЕНИЕ: Кастомный инпут ломает стандартный контракт input тега
function CustomInput({ customValue, onUserType }) {
  // Компонент переопределяет стандартные пропсы value/onChange на свои,
  // что делает невозможным его интеграцию в стандартные библиотеки форм
  return <input value={customValue} onChange={e => onUserType(e.target.value)} />;
}`,
    goodCode: `// 🟢 СОБЛЮДЕНИЕ: Расширяем и сохраняем оригинальный HTMLInput контракт
interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

function CustomInput({ label, ...inputProps }: Props) {
  // Работает со всеми стандартными пропсами (ref, type, disabled, onChange и т.д.)
  return (
    <div>
      <label>{label}</label>
      <input {...inputProps} />
    </div>
  );
}`
  },
  {
    key: 'i',
    name: 'I - Interface Segregation (Разделение интерфейса)',
    definition: 'Компоненты не должны зависеть от пропсов и методов, которые они не используют. Избегайте передачи избыточных объектов данных.',
    testabilityImpact: 'Для написания теста не нужно конструировать огромный фейковый объект пользователя с 50 свойствами. Достаточно передать 2 необходимых пропса.',
    badCode: `// 🔴 НАРУШЕНИЕ: Компонент требует весь объект User для рендеринга только аватарки
interface User {
  id: string;
  name: string;
  avatarUrl: string;
  email: string;
  roles: string[];
  billingAddress: any; // ... и т.д.
}

function Avatar({ user }: { user: User }) {
  return <img src={user.avatarUrl} alt={user.name} />;
}`,
    goodCode: `// 🟢 СОБЛЮДЕНИЕ: Сужение контракта до минимума необходимых данных
interface AvatarProps {
  imageUrl: string;
  altText: string;
}

function Avatar({ imageUrl, altText }: AvatarProps) {
  return <img src={imageUrl} alt={altText} />;
}`
  },
  {
    key: 'd',
    name: 'D - Dependency Inversion (Инверсия зависимостей)',
    definition: 'Компоненты должны зависеть от абстракций (интерфейсов, контекстов, пропсов), а не от конкретных реализаций API-клиентов или глобальных хранилищ.',
    testabilityImpact: 'Позволяет тестировать компонент в полной изоляции. Мы можем легко прокинуть фейковый (mock) сервис через пропсы или Context, не обращаясь к реальной сети/базе.',
    badCode: `// 🔴 НАРУШЕНИЕ: Компонент намертво завязан на конкретный класс http API
import { myApiClient } from '../shared/api';

function PostList() {
  const [posts, setPosts] = useState([]);
  
  useEffect(() => {
    // Невозможно подменить источник данных в тестах без глобального monkey-patching
    myApiClient.get('/posts').then(setPosts);
  }, []);

  return <div>{/* Рендер постов */}</div>;
}`,
    goodCode: `// 🟢 СОБЛЮДЕНИЕ: Источник данных абстрагирован
// 1. Через пропсы (или контекст провайдера)
function PostList({ fetchMethod }: { fetchMethod: () => Promise<Post[]> }) {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetchMethod().then(setPosts);
  }, [fetchMethod]);

  return <ul>{posts.map(p => <li key={p.id}>{p.title}</li>)}</ul>;
}

// Тестирование становится элементарным:
// <PostList fetchMethod={() => Promise.resolve([{ id: 1, title: 'Test Post' }])} />`
  }
];

export default function SolidPage() {
  const [activeTab, setActiveTab] = useState('s');

  const principle = solidPrinciples.find(p => p.key === activeTab)!;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      {/* Header Panel */}
      <div className="glass-panel" style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
        <ShieldCheck size={36} color="var(--accent-success)" />
        <div>
          <h2 style={{ fontSize: '24px' }}>SOLID принципы в React</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
            Как написание SOLID кода снижает хрупкость приложения и делает юнит-тестирование простым и безболезненным.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-glass)', gap: '10px' }}>
        {solidPrinciples.map(p => (
          <button
            key={p.key}
            onClick={() => setActiveTab(p.key)}
            style={{
              padding: '12px 20px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === p.key ? '3px solid var(--accent-success)' : '3px solid transparent',
              color: activeTab === p.key ? 'var(--text-primary)' : 'var(--text-muted)',
              fontWeight: activeTab === p.key ? 'bold' : 'normal',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)'
            }}
          >
            {p.name.split(' ')[0]}
          </button>
        ))}
      </div>

      {/* Details Container */}
      <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <h3 style={{ fontSize: '20px', color: 'var(--text-primary)', marginBottom: '6px' }}>{principle.name}</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
            <Info size={16} style={{ flexShrink: 0, marginTop: '2px', color: 'var(--accent-secondary)' }} />
            {principle.definition}
          </p>
        </div>

        {/* Testability Highlight */}
        <div style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px dashed rgba(16, 185, 129, 0.3)', padding: '15px', borderRadius: '10px' }}>
          <h4 style={{ fontSize: '14px', color: '#34d399', marginBottom: '4px' }}>Влияние на тестируемость (Testability Impact):</h4>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{principle.testabilityImpact}</p>
        </div>

        {/* Code comparison grid */}
        <div className="grid-cols-2">
          {/* Violating Code */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: 'var(--accent-error)' }}>
              <XCircle size={16} /> Нарушение паттерна (Violating code)
            </h4>
            <pre className="mono" style={{ background: '#180a0a', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '16px', borderRadius: '8px', fontSize: '11px', color: '#fca5a5', overflowX: 'auto', minHeight: '300px' }}>
              <code>{principle.badCode}</code>
            </pre>
          </div>

          {/* SOLID Refactored */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: 'var(--accent-success)' }}>
              <CheckCircle size={16} /> SOLID Рефакторинг (Clean code)
            </h4>
            <pre className="mono" style={{ background: '#0a1811', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '16px', borderRadius: '8px', fontSize: '11px', color: '#a7f3d0', overflowX: 'auto', minHeight: '300px' }}>
              <code>{principle.goodCode}</code>
            </pre>
          </div>
        </div>
      </div>

      {/* Learning resources card */}
      <div className="glass-panel" style={{ background: 'rgba(16, 185, 129, 0.03)', borderColor: 'rgba(16, 185, 129, 0.2)', marginTop: '24px' }}>
        <h3 style={{ fontSize: '16px', marginBottom: '10px', color: 'var(--text-primary)' }}>📚 Ресурсы для углубленного изучения SOLID:</h3>
        <ul style={{ paddingLeft: '20px', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--text-muted)' }}>
          <li>
            <a href="https://dev.to/chinedu/solid-principles-in-react-applications-a-practical-guide-2g45" target="_blank" rel="noreferrer" style={{ color: 'var(--accent-primary)', textDecoration: 'none', fontWeight: 'bold' }}>SOLID Principles in React</a> — отличное руководство по декомпозиции компонентов с примерами кода.
          </li>
          <li>
            <a href="https://medium.com/dailyjs/applying-solid-principles-in-react-14905d9c5377" target="_blank" rel="noreferrer" style={{ color: 'var(--accent-secondary)', textDecoration: 'none', fontWeight: 'bold' }}>Applying SOLID in React (Medium)</a> — разбор влияния пяти основных принципов на гибкость и сопровождаемость фронтенд-кода.
          </li>
        </ul>
      </div>
    </div>

  );
}
