import DataUriParser from "datauri/parser.js";
import { extname } from "path";

const getDataUri = (file:any) => {
  const parser = new DataUriParser();
  const extName = extname(file.originalname).toString();
  return parser.format(extName, file.buffer);
};

export default getDataUri;