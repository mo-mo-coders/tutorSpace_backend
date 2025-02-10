import multer, { memoryStorage } from "multer";


const storage = memoryStorage();

const singleUpload = multer({ storage }).single("file");

export default singleUpload;