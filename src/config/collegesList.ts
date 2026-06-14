import { readCSV } from "../config/insertDataIntoModules.js";

const read_data = await readCSV("./public/Colleges.csv");

export default read_data;