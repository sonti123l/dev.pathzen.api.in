import csv from "csv-parser";
import fs from "fs";

const data_analyst = [
  "Step 1: Python Programming language",
  "Step 2: Mathematics & Statistics",
  "Step 3: Data Libraries",
  "Step 4: Visualization",
  "Step 5: SQL",
  "Step 6: Projects"
];

export function readCSV(filePath: string): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const results: any[] = [];

    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", () => resolve(results))
      .on("error", (err) => reject(err));
  });
}
