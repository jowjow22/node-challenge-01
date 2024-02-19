import fs from "node:fs";
import { parse } from "csv-parse";
import http from "node:http";

const server = http.createServer(async (req, res) => {
  const parser = fs.createReadStream(`./src/example.csv`).pipe(
    parse({
      bom: false,
      columns: true,
    })
  );
  for await (const record of parser) {
    const data = JSON.stringify(record);
    console.log(data);
    const options = {
      hostname: "localhost",
      port: 3333,
      path: "/tasks",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: data,
    };
    const req = http.request(options);
    req.on("error", (error) => {
      console.error(error);
    });
    req.write(data);
    req.end();
  }

  return res.end("Tasks created from CSV file");
});

server.listen(3334);
