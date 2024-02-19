import fs from "node:fs/promises";

const databasePath = new URL("../db.json", import.meta.url);

export class Database {
  #database = {};

  constructor() {
    this.#load();
  }
  async #load() {
    try {
      const file = await fs.readFile(databasePath);
      this.#database = JSON.parse(file);
    } catch (error) {
      this.#persist();
    }
  }

  #persist() {
    fs.writeFile(databasePath, JSON.stringify(this.#database));
  }

  insert(table, data) {
    if (Array.isArray(this.#database[table])) {
      this.#database[table].push(data);
    } else {
      this.#database[table] = [data];
    }
    this.#persist();
    return data;
  }

  select(table, search) {
    let data = this.#database[table] ?? [];

    if (search) {
      data = data.filter((row) => {
        return Object.entries(search).some(([key, value]) => {
          return row[key].includes(value);
        });
      });
    }

    return data;
  }
  delete(table, id) {
    const rowIndex = this.#database[table].findIndex((row) => row.id === id);

    if (rowIndex > -1) {
      this.#database[table].splice(rowIndex, 1);
      this.#persist();
      return;
    }
    throw new Error("Row not found");
  }
  update(table, id, data) {
    const rowIndex = this.#database[table].findIndex((row) => row.id === id);

    if (rowIndex > -1) {
      const oldData = this.#database[table][rowIndex];
      this.#database[table][rowIndex] = {
        ...oldData,
        ...data,
        updated_at: new Date().toISOString(),
      };
      this.#persist();
      return;
    }

    throw new Error("Row not found");
  }
}
