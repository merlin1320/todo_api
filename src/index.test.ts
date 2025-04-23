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

  it('DELETE /todos/:id should delete a todo by id', async () => {
    // Add a todo first
    const todo = {
      summary: 'Delete me',
      author: 'Author',
      completed: false
    };
    const postRes = await request(app).post('/todos').send(todo);
    const todoId = postRes.body.id;
    // Delete the todo
    const delRes = await request(app).delete(`/todos/${todoId}`);
    expect(delRes.status).toBe(200);
    expect(delRes.body).toMatchObject(todo);
    // Should be empty now
    const getRes = await request(app).get('/todos');
    expect(getRes.body).toEqual([]);
  });

  it('DELETE /todos/:id should return 404 for invalid id', async () => {
    const res = await request(app).delete('/todos/invalid-id');
    expect(res.status).toBe(404);
    expect(res.body.error).toBeDefined();
  });

  it('POST /todos/:id should update the completed field', async () => {
    const todo = {
      summary: 'Complete me',
      author: 'Author',
      completed: false
    };
    const postRes = await request(app).post('/todos').send(todo);
    const todoId = postRes.body.id;
    // Update completed to true
    const updateRes = await request(app)
      .post(`/todos/${todoId}`)
      .send({ completed: true });
    expect(updateRes.status).toBe(200);
    expect(updateRes.body.completed).toBe(true);
    // Confirm in GET
    const getRes = await request(app).get('/todos');
    expect(getRes.body[0].completed).toBe(true);
  });

  it('POST /todos/:id should return 404 for invalid id', async () => {
    const res = await request(app)
      .post('/todos/invalid-id')
      .send({ completed: true });
    expect(res.status).toBe(404);
    expect(res.body.error).toBeDefined();
  });

  it('POST /todos/:id should return 400 for missing/invalid completed', async () => {
    const todo = {
      summary: 'Incomplete',
      author: 'Author',
      completed: false
    };
    const postRes = await request(app).post('/todos').send(todo);
    const todoId = postRes.body.id;
    // Missing completed
    const res1 = await request(app)
      .post(`/todos/${todoId}`)
      .send({});
    expect(res1.status).toBe(400);
    // Invalid completed
    const res2 = await request(app)
      .post(`/todos/${todoId}`)
      .send({ completed: 'notabool' });
    expect(res2.status).toBe(400);
  });

  it('OPTIONS /todos should return 200 and CORS headers', async () => {
    const res = await request(app).options('/todos');
    expect(res.status).toBe(200);
    expect(res.headers['access-control-allow-origin']).toBe('*');
  });

  it('OPTIONS /todos/:id should return 200 and CORS headers', async () => {
    const res = await request(app).options('/todos/someid');
    expect(res.status).toBe(200);
    expect(res.headers['access-control-allow-origin']).toBe('*');
  });

  it('GET / should return Hello, Todos!', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.text).toContain('Hello, Todos!');
  });

  it('POST /todos should handle unexpected errors and return 400', async () => {
    // Simulate an error inside the try block by making todos.push throw
    const originalPush = appModule.todos.push;
    appModule.todos.push = () => { throw new Error('Simulated error'); };
    const todo = {
      summary: 'Error case',
      author: 'Author',
      completed: false
    };
    const res = await request(app).post('/todos').send(todo);
    expect(res.status).toBe(400);
    expect(res.body.error).toContain('Invalid request body');
    // Restore original push
    appModule.todos.push = originalPush;
  });
});
