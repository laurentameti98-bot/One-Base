import express from 'express';
import cors from 'cors';
import { accountsRouter } from './api/accounts.js';
import { contactsRouter } from './api/contacts.js';
import { dealsRouter } from './api/deals.js';
import { activitiesRouter } from './api/activities.js';
import { errorHandler } from './api/errorHandler.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/accounts', accountsRouter);
app.use('/api/contacts', contactsRouter);
app.use('/api/deals', dealsRouter);
app.use('/api/activities', activitiesRouter);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
