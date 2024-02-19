import { Database } from "./middlewares/database.js";
import { randomUUID } from "node:crypto";
import { buildRoutePath } from "./utils/build-route-path.js";

const database = new Database();

export const routes = [
  {
    method: "GET",
    path: buildRoutePath("/tasks"),
    handler: (req, res) => {
      const { search } = req.query;

      const tasks = database.select(
        "tasks",
        search
          ? {
              title: search,
              description: search,
            }
          : null
      );

      return res.end(JSON.stringify(tasks));
    },
  },
  {
    method: "POST",
    path: buildRoutePath("/tasks"),
    handler: (req, res) => {
      const { title, description } = req.body;

      if (!title || !description) {
        return res.writeHead(400).end("Title and description are required");
      }

      const task = {
        id: randomUUID(),
        title,
        description,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        completed_at: null,
      };

      database.insert("tasks", task);

      return res.writeHead(201).end("Task created");
    },
  },
  {
    method: "PUT",
    path: buildRoutePath("/tasks/:id"),
    handler: (req, res) => {
      const { title, description } = req.body;
      const { id } = req.params;

      if (!title || !description) {
        return res.writeHead(400).end("Title and description are required");
      }

      const task = {
        title,
        description,
      };

      try {
        database.update("tasks", id, task);
      } catch (error) {
        return res.writeHead(404).end(error.message);
      }

      return res.writeHead(201).end("Task updated");
    },
  },
  {
    method: "PATCH",
    path: buildRoutePath("/tasks/:id/complete"),
    handler: (req, res) => {
      const { id } = req.params;

      const task = {
        completed_at: new Date().toISOString(),
      };

      try {
        database.update("tasks", id, task);
      } catch (error) {
        return res.writeHead(404).end(error.message);
      }

      return res.writeHead(201).end("Task updated");
    },
  },
  {
    method: "DELETE",
    path: buildRoutePath("/tasks/:id"),
    handler: (req, res) => {
      const { id } = req.params;

      try {
        database.delete("tasks", id);
      } catch (error) {
        return res.writeHead(404).end(error.message);
      }

      return res.writeHead(204).end("Task deleted");
    },
  },
];
