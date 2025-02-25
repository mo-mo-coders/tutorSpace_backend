import { Router } from 'express';
import studentRouter from './studentRouter';
import tutorRouter from './tutorRouter';
import tutorRequestRouter from './tutorRequestRouter';

const appRouter= Router();

appRouter.use("/student",studentRouter);
appRouter.use("/tutor",tutorRouter);
appRouter.use("/tutorRequest",tutorRequestRouter);

export default appRouter;