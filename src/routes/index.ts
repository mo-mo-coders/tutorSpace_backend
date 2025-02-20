import { Router } from 'express';
import studentRouter from './studentRouter';
import tutorRouter from './tutorRouter';

const appRouter= Router();

appRouter.use("/student",studentRouter);
appRouter.use("/tutor",tutorRouter);

export default appRouter;