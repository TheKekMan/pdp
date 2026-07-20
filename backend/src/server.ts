import express, { Request, Response, NextFunction } from 'express';
import http from 'http';
import cors from 'cors';
import { WebSocketServer, WebSocket } from 'ws';
import { Server as SocketIOServer } from 'socket.io';
import { Todo, API_ROUTES, RealtimeEvent } from './contracts/api-contract';

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

// =========================================================================
// IN-MEMORY DATABASE
// =========================================================================
let todos: Todo[] = [
  { id: '1', title: 'Понять разницу между WebSocket, Socket.IO и SSE', completed: true, createdAt: new Date().toISOString() },
  { id: '2', title: 'Изучить 7 паттернов React на практических примерах', completed: false, createdAt: new Date().toISOString() },
  { id: '3', title: 'Освоить SOLID принципы в контексте компонентов React', completed: false, createdAt: new Date().toISOString() }
];

// =========================================================================
// REALTIME CONNECTIONS TRACKING
// =========================================================================
let sseClients: Response[] = [];
let activeRawWsCount = 0;
let activeSocketIoCount = 0;

// Broadcast Helper
function broadcast(event: RealtimeEvent) {
  const payloadStr = JSON.stringify(event);

  // 1. SSE Broadcast
  sseClients.forEach(res => {
    res.write(`data: ${payloadStr}\n\n`);
  });

  // 2. Raw WebSocket Broadcast
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payloadStr);
    }
  });

  // 3. Socket.IO Broadcast
  io.emit('realtime-event', event);
}

// Periodic System Status Broadcasting (every 2 seconds)
setInterval(() => {
  const statusEvent: RealtimeEvent = {
    type: 'SYSTEM_STATUS',
    payload: {
      uptime: Math.round(process.uptime()),
      clientsCount: sseClients.length + activeRawWsCount + activeSocketIoCount,
      memoryUsage: Math.round(process.memoryUsage().heapUsed / 1024 / 1024)
    }
  };
  broadcast(statusEvent);
}, 2000);

// =========================================================================
// 1. SERVER-SENT EVENTS (SSE) SETUP
// =========================================================================
app.get(API_ROUTES.REALTIME.SSE, (req: Request, res: Response) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });

  // Отправляем приветственное сообщение
  res.write(`data: ${JSON.stringify({ type: 'SYSTEM_STATUS', payload: { uptime: Math.round(process.uptime()), clientsCount: sseClients.length + 1 + activeRawWsCount + activeSocketIoCount, memoryUsage: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) } })}\n\n`);

  sseClients.push(res);

  req.on('close', () => {
    sseClients = sseClients.filter(client => client !== res);
  });
});

// =========================================================================
// 2. SOCKET.IO SETUP
// =========================================================================
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  activeSocketIoCount++;

  socket.on('disconnect', () => {
    activeSocketIoCount--;
  });
});

// =========================================================================
// 3. RAW WEBSOCKET SETUP
// =========================================================================
const wss = new WebSocketServer({ noServer: true });

wss.on('connection', (ws: WebSocket) => {
  activeRawWsCount++;

  ws.on('close', () => {
    activeRawWsCount--;
  });
});

// Обработка Upgrade запросов для чистого WebSocket
server.on('upgrade', (request, socket, head) => {
  const pathname = new URL(request.url || '', `http://${request.headers.host}`).pathname;

  if (pathname === API_ROUTES.REALTIME.WEBSOCKET) {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  } else {
    // Если это Socket.io, то он обрабатывает апгрейд сам, пропускаем
    if (!pathname.startsWith('/socket.io')) {
      socket.destroy();
    }
  }
});

// =========================================================================
// REST API ROUTING AND CONTROLLERS
// =========================================================================

// Получить все задачи
app.get(API_ROUTES.TODOS.GET_ALL, (req: Request, res: Response) => {
  res.json({ success: true, data: todos });
});

// Создать новую задачу (с валидацией в контроллере для простоты)
app.post(API_ROUTES.TODOS.CREATE, (req: Request, res: Response) => {
  const { title } = req.body;
  if (!title || typeof title !== 'string' || title.trim().length < 3) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Title must be at least 3 characters long' }
    });
  }

  const newTodo: Todo = {
    id: Math.random().toString(36).substring(2, 9),
    title: title.trim(),
    completed: false,
    createdAt: new Date().toISOString()
  };

  todos.push(newTodo);
  
  // Оповещаем все realtime-каналы о создании задачи
  broadcast({ type: 'TODO_CREATED', payload: newTodo });

  res.status(210).json({ success: true, data: newTodo });
});

// Переключить статус задачи
app.post(API_ROUTES.TODOS.TOGGLE, (req: Request, res: Response) => {
  const { id } = req.params;
  const todo = todos.find(t => t.id === id);

  if (!todo) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Todo not found' }
    });
  }

  todo.completed = !todo.completed;

  // Оповещаем все realtime-каналы
  broadcast({ type: 'TODO_TOGGLED', payload: todo });

  res.json({ success: true, data: todo });
});

// Удалить задачу
app.delete(API_ROUTES.TODOS.DELETE, (req: Request, res: Response) => {
  const { id } = req.params;
  const exists = todos.some(t => t.id === id);

  if (!exists) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Todo not found' }
    });
  }

  todos = todos.filter(t => t.id !== id);

  // Оповещаем все realtime-каналы
  broadcast({ type: 'TODO_DELETED', payload: { id } });

  res.json({ success: true, data: { id } });
});

// =========================================================================
// ERROR HANDLING MIDDLEWARE
// =========================================================================
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    success: false,
    error: { code: 'INTERNAL_SERVER_ERROR', message: 'An unexpected error occurred' }
  });
});

// =========================================================================
// START SERVER
// =========================================================================
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`[BACKEND] Server listening on http://localhost:${PORT}`);
  console.log(`[BACKEND] REST API root: http://localhost:${PORT}/api/todos`);
  console.log(`[BACKEND] SSE Endpoint: http://localhost:${PORT}${API_ROUTES.REALTIME.SSE}`);
  console.log(`[BACKEND] Raw WebSocket: ws://localhost:${PORT}${API_ROUTES.REALTIME.WEBSOCKET}`);
  console.log(`[BACKEND] Socket.IO: http://localhost:${PORT}`);
});
