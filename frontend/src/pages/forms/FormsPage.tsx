import React, { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { FormInput, Sparkles, Cpu, AlertCircle, Zap, ShieldAlert, Award } from 'lucide-react';

// =========================================================================
// ZOD SCHEMA (for React Hook Form)
// =========================================================================
const zodSchema = z.object({
  name: z.string().min(3, 'Имя должно быть не менее 3 символов'),
  email: z.string().email('Неверный формат email'),
  password: z.string().min(6, 'Пароль должен быть не менее 6 символов'),
  confirmPassword: z.string().min(6, 'Подтверждение пароля обязательно'),
  age: z.coerce.number().min(18, 'Вам должно быть больше 18 лет').max(100, 'Некорректный возраст'),
  newsletter: z.boolean().optional()
}).refine(data => data.password === data.confirmPassword, {
  message: 'Пароли не совпадают',
  path: ['confirmPassword']
});

type ZodFormData = z.infer<typeof zodSchema>;

// =========================================================================
// YUP SCHEMA (for Formik)
// =========================================================================
const yupSchema = Yup.object().shape({
  name: Yup.string().min(3, 'Имя должно быть не менее 3 символов').required('Имя обязательно'),
  email: Yup.string().email('Неверный формат email').required('Email обязателен'),
  password: Yup.string().min(6, 'Пароль должен быть не менее 6 символов').required('Пароль обязателен'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Пароли не совпадают')
    .required('Подтверждение пароля обязательно'),
  age: Yup.number()
    .typeError('Должно быть числом')
    .min(18, 'Вам должно быть больше 18 лет')
    .max(100, 'Некорректный возраст')
    .required('Возраст обязателен'),
  newsletter: Yup.boolean()
});

export default function FormsPage() {
  const [rhfResult, setRhfResult] = useState<string | null>(null);
  const [formikResult, setFormikResult] = useState<string | null>(null);

  // Render Counters using refs
  const rhfRenderCount = useRef(0);
  const formikRenderCount = useRef(0);

  rhfRenderCount.current++;
  
  // React Hook Form setup
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset: resetRhf
  } = useForm<ZodFormData>({
    resolver: zodResolver(zodSchema),
    mode: 'onChange', // Validate on change to show rendering behavior
    defaultValues: { name: '', email: '', password: '', confirmPassword: '', age: 18, newsletter: false }
  });

  const onRhfSubmit = (data: ZodFormData) => {
    setRhfResult(JSON.stringify(data, null, 2));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      {/* Header Info */}
      <div className="glass-panel" style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
        <Cpu size={36} color="var(--accent-secondary)" />
        <div>
          <h2 style={{ fontSize: '24px' }}>Сравнение React Hook Form + Zod vs Formik + Yup</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
            Обратите внимание на счетчик рендеров ниже. Попробуйте быстро вводить текст в поля ввода обеих форм.
          </p>
        </div>
      </div>

      <div className="grid-cols-2">
        {/* React Hook Form Card */}
        <div className="glass-panel" style={{ borderTop: '4px solid var(--accent-success)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '18px', color: 'var(--accent-success)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Zap size={20} /> React Hook Form + Zod
            </h3>
            <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold' }}>
              Рендеров формы: <span className="mono" style={{ fontSize: '14px' }}>{rhfRenderCount.current}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onRhfSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', color: 'var(--text-muted)' }}>Имя (name)</label>
              <input {...register('name')} placeholder="Иван" />
              {errors.name && <span style={{ color: 'var(--accent-error)', fontSize: '12px', marginTop: '3px', display: 'block' }}>{errors.name.message}</span>}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', color: 'var(--text-muted)' }}>Email</label>
              <input type="email" {...register('email')} placeholder="ivan@example.com" />
              {errors.email && <span style={{ color: 'var(--accent-error)', fontSize: '12px', marginTop: '3px', display: 'block' }}>{errors.email.message}</span>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', color: 'var(--text-muted)' }}>Пароль</label>
                <input type="password" {...register('password')} placeholder="••••••" />
                {errors.password && <span style={{ color: 'var(--accent-error)', fontSize: '12px', marginTop: '3px', display: 'block' }}>{errors.password.message}</span>}
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', color: 'var(--text-muted)' }}>Повторите пароль</label>
                <input type="password" {...register('confirmPassword')} placeholder="••••••" />
                {errors.confirmPassword && <span style={{ color: 'var(--accent-error)', fontSize: '12px', marginTop: '3px', display: 'block' }}>{errors.confirmPassword.message}</span>}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', color: 'var(--text-muted)' }}>Возраст</label>
              <input type="number" {...register('age')} />
              {errors.age && <span style={{ color: 'var(--accent-error)', fontSize: '12px', marginTop: '3px', display: 'block' }}>{errors.age.message}</span>}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0' }}>
              <input type="checkbox" {...register('newsletter')} style={{ width: 'auto' }} id="rhf-news" />
              <label htmlFor="rhf-news" style={{ fontSize: '14px', color: 'var(--text-muted)', cursor: 'pointer' }}>Подписаться на рассылку</label>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Submit (RHF)</button>
              <button type="button" className="btn btn-secondary" onClick={() => { resetRhf(); setRhfResult(null); }}>Сбросить</button>
            </div>
          </form>

          {rhfResult && (
            <div style={{ marginTop: '20px', background: '#090d16', padding: '12px', borderRadius: '8px' }}>
              <div style={{ fontSize: '10px', color: 'var(--accent-success)', fontWeight: 'bold', marginBottom: '6px' }}>SUBMIT DATA:</div>
              <pre className="mono" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{rhfResult}</pre>
            </div>
          )}
        </div>

        {/* Formik Card */}
        <div className="glass-panel" style={{ borderTop: '4px solid var(--accent-primary)' }}>
          <Formik
            initialValues={{ name: '', email: '', password: '', confirmPassword: '', age: 18, newsletter: false }}
            validationSchema={yupSchema}
            validateOnChange={true}
            onSubmit={(values) => {
              setFormikResult(JSON.stringify(values, null, 2));
            }}
          >
            {({ resetForm }) => {
              formikRenderCount.current++;
              return (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '18px', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Award size={20} /> Formik + Yup
                    </h3>
                    <div style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#a78bfa', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold' }}>
                      Рендеров формы: <span className="mono" style={{ fontSize: '14px' }}>{formikRenderCount.current}</span>
                    </div>
                  </div>

                  <Form style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', color: 'var(--text-muted)' }}>Имя (name)</label>
                      <Field name="name" placeholder="Иван" as={({ field }: any) => <input {...field} placeholder="Иван" />} />
                      <ErrorMessage name="name" component="span" style={{ color: 'var(--accent-error)', fontSize: '12px', marginTop: '3px', display: 'block' }} />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', color: 'var(--text-muted)' }}>Email</label>
                      <Field name="email" as={({ field }: any) => <input type="email" {...field} placeholder="ivan@example.com" />} />
                      <ErrorMessage name="email" component="span" style={{ color: 'var(--accent-error)', fontSize: '12px', marginTop: '3px', display: 'block' }} />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', color: 'var(--text-muted)' }}>Пароль</label>
                        <Field name="password" as={({ field }: any) => <input type="password" {...field} placeholder="••••••" />} />
                        <ErrorMessage name="password" component="span" style={{ color: 'var(--accent-error)', fontSize: '12px', marginTop: '3px', display: 'block' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', color: 'var(--text-muted)' }}>Повторите пароль</label>
                        <Field name="confirmPassword" as={({ field }: any) => <input type="password" {...field} placeholder="••••••" />} />
                        <ErrorMessage name="confirmPassword" component="span" style={{ color: 'var(--accent-error)', fontSize: '12px', marginTop: '3px', display: 'block' }} />
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', color: 'var(--text-muted)' }}>Возраст</label>
                      <Field name="age" as={({ field }: any) => <input type="number" {...field} />} />
                      <ErrorMessage name="age" component="span" style={{ color: 'var(--accent-error)', fontSize: '12px', marginTop: '3px', display: 'block' }} />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0' }}>
                      <Field name="newsletter" as={({ field }: any) => <input type="checkbox" {...field} checked={field.value} style={{ width: 'auto' }} id="formik-news" />} />
                      <label htmlFor="formik-news" style={{ fontSize: '14px', color: 'var(--text-muted)', cursor: 'pointer' }}>Подписаться на рассылку</label>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                      <button type="submit" className="btn btn-primary" style={{ flex: 1, background: 'linear-gradient(135deg, var(--accent-primary) 0%, #7c3aed 100%)' }}>Submit (Formik)</button>
                      <button type="button" className="btn btn-secondary" onClick={() => { resetForm(); setFormikResult(null); }}>Сбросить</button>
                    </div>
                  </Form>

                  {formikResult && (
                    <div style={{ marginTop: '20px', background: '#090d16', padding: '12px', borderRadius: '8px' }}>
                      <div style={{ fontSize: '10px', color: 'var(--accent-primary)', fontWeight: 'bold', marginBottom: '6px' }}>SUBMIT DATA:</div>
                      <pre className="mono" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{formikResult}</pre>
                    </div>
                  )}
                </div>
              );
            }}
          </Formik>
        </div>
      </div>

      {/* Comparison Analysis Table */}
      <div className="glass-panel">
        <h3 style={{ fontSize: '18px', marginBottom: '15px', color: 'var(--accent-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldAlert size={18} /> Сравнительный анализ производительности и применения
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '14px', lineHeight: '1.6' }}>
          <p>
            <strong>Почему рендеров у Formik намного больше?</strong><br />
            Formik использует паттерн <em>controlled inputs</em>. Это означает, что при каждом нажатии клавиши состояние родителя обновляется (`setState`), провоцируя рендер всего дерева формы. На больших формах с десятками полей или сложной логикой вычислений это приводит к лагам клавиатурного ввода.
          </p>
          <p>
            <strong>Как React Hook Form решает эту проблему?</strong><br />
            RHF базируется на <em>uncontrolled inputs</em> через рефы (`ref`). Компонент формы регистрирует DOM-узлы. Ввод текста происходит напрямую в DOM, минуя стейт React. Перерисовка компонента происходит только при изменении состояния ошибок валидации или при явной подписке на значение через `watch` / `useWatch`.
          </p>

          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-glass)', textAlign: 'left', color: 'var(--text-primary)' }}>
                <th style={{ padding: '10px 6px' }}>Параметр</th>
                <th style={{ padding: '10px 6px', color: 'var(--accent-success)' }}>React Hook Form + Zod</th>
                <th style={{ padding: '10px 6px', color: 'var(--accent-primary)' }}>Formik + Yup</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-muted)' }}>
                <td style={{ padding: '10px 6px', fontWeight: 'bold', color: 'var(--text-primary)' }}>Модель рендеринга</td>
                <td style={{ padding: '10px 6px' }}>Неконтролируемые (refs), 0 лишних рендеров при вводе</td>
                <td style={{ padding: '10px 6px' }}>Контролируемые (state), рендер на каждое нажатие клавиши</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-muted)' }}>
                <td style={{ padding: '10px 6px', fontWeight: 'bold', color: 'var(--text-primary)' }}>Размер бандла (Gzipped)</td>
                <td style={{ padding: '10px 6px' }}>~8.6 kB (RHF + Zod resolver)</td>
                <td style={{ padding: '10px 6px' }}>~16.4 kB (Formik + Yup)</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-muted)' }}>
                <td style={{ padding: '10px 6px', fontWeight: 'bold', color: 'var(--text-primary)' }}>Типизация TS</td>
                <td style={{ padding: '10px 6px' }}>Отличная (Zod выводит TS-типы напрямую: `z.infer&lt;typeof Schema&gt;`)</td>
                <td style={{ padding: '10px 6px' }}>Удовлетворительная (Yup схемы требуют дублирования интерфейсов вручную)</td>
              </tr>
              <tr style={{ color: 'var(--text-muted)' }}>
                <td style={{ padding: '10px 6px', fontWeight: 'bold', color: 'var(--text-primary)' }}>Вердикт</td>
                <td style={{ padding: '10px 6px', color: '#34d399' }}>Рекомендуется для большинства современных проектов, особенно крупных форм.</td>
                <td style={{ padding: '10px 6px' }}>Допускается в старых проектах или простых формах без требований к высокой производительности.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Learning resources card */}
      <div className="glass-panel" style={{ background: 'rgba(6, 182, 212, 0.03)', borderColor: 'rgba(6, 182, 212, 0.2)', marginTop: '24px' }}>
        <h3 style={{ fontSize: '16px', marginBottom: '10px', color: 'var(--text-primary)' }}>📚 Ресурсы для углубленного изучения форм и валидации:</h3>
        <ul style={{ paddingLeft: '20px', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--text-muted)' }}>
          <li>
            <a href="https://react-hook-form.com/get-started" target="_blank" rel="noreferrer" style={{ color: 'var(--accent-primary)', textDecoration: 'none', fontWeight: 'bold' }}>React Hook Form - Get Started</a> — официальный сайт с интерактивным генератором форм и разбором API.
          </li>
          <li>
            <a href="https://formik.org/docs/overview" target="_blank" rel="noreferrer" style={{ color: 'var(--accent-secondary)', textDecoration: 'none', fontWeight: 'bold' }}>Formik Documentation</a> — официальное руководство по управлению формами через контролируемые компоненты.
          </li>
          <li>
            <a href="https://zod.dev/" target="_blank" rel="noreferrer" style={{ color: 'var(--accent-success)', textDecoration: 'none', fontWeight: 'bold' }}>Zod Schema Validation</a> — справочник по созданию схем валидации Zod и интеграции с TypeScript.
          </li>
        </ul>
      </div>
    </div>

  );
}
