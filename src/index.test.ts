import { describe, it, beforeEach, expect } from 'vitest';
import request from 'supertest';
import express from 'express';
import { Server } from 'http';

// Import the app logic from index.ts
import * as appModule from './index';

// Helper to get the Express app from the module
const getApp = () => {
  // Re-create the app for each test to reset state
  const app = express();
  app.use(express.json());
  // Copy routes from the main app
  app.get('/todos', appModule.app._router.stack.find((r: any) => r.route && r.route.path === '/todos').route.stack[0].handle);
  app.post('/todos', appModule.app._router.stack.find((r: any) => r.route && r.route.path === '/todos' && r.route.methods.post).route.stack[0].handle);
  return app;
};

describe('Todo API', () => {
  let app: express.Express;

  beforeEach(() => {
    app = appModule.app;
    // Reset todos array
    appModule.todos.length = 0;
  });

  it('GET /todos should return an empty array initially', async () => {
    const res = await request(app).get('/todos');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('POST /todos should add a new todo and return it', async () => {
    const todo = {
      summary: 'Test summary',
      author: 'Test author',
      completed: false
    };
    const res = await request(app).post('/todos').send(todo);
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject(todo);
    // Should be in the list now
    const getRes = await request(app).get('/todos');
    expect(getRes.body.length).toBe(1);
    expect(getRes.body[0]).toMatchObject(todo);
  });

  it('POST /todos should require summary, author, and completed', async () => {
    const res = await request(app).post('/todos').send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it('POST /todos should accept all optional fields', async () => {
    const todo = {
      summary: 'Full',
      author: 'Author',
      description: 'Desc',
      imageUrl: 'http://img',
      category: 'Cat',
      completed: true
    };
    const res = await request(app).post('/todos').send(todo);
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject(todo);
  });
});
