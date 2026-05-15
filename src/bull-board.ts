import { createBullBoard } from '@bull-board/api';
import { ExpressAdapter } from '@bull-board/express';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { Queue } from 'bull';

// export a reusable adapter
export const serverAdapter = new ExpressAdapter();

serverAdapter.setBasePath('/admin/queues');

export const createBoard = (queues: Queue[]) => {
  createBullBoard({
    queues: queues.map((q) => new BullAdapter(q)),
    serverAdapter,
  });
};