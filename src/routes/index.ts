import { Router } from 'express';
import studentRouter from './studentRouter';

const appRouter= Router();

appRouter.use("/student",studentRouter);


export default appRouter;