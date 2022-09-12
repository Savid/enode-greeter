const dev = process.env.NODE_ENV === 'development';

export const LOG_LEVEL: string = process.env.LOG_LEVEL || (dev ? 'debug' : 'warn');

export const PORT_ADMIN: string = process.env.PORT_ADMIN ?? '8081';

export const REMOTE_SEND_ENDPOINT: string =
  process.env.REMOTE_SEND_ENDPOINT ?? 'http://localhost:8080/eth_status';
export const REMOTE_GET_ENDPOINT: string =
  process.env.REMOTE_GET_ENDPOINT ?? 'http://localhost:8080/enodes';
export const { SHARED_SECRET } = process.env;
export const REMOTE_SEND_INTERVAL = !Number.isNaN(Number(process.env.REMOTE_SEND_INTERVAL))
  ? Number(process.env.REMOTE_SEND_INTERVAL)
  : 10_000;
export const REMOTE_GET_INTERVAL = !Number.isNaN(Number(process.env.REMOTE_GET_INTERVAL))
  ? Number(process.env.REMOTE_GET_INTERVAL)
  : 10_000;
export const REMOTE_GET_COUNT = !Number.isNaN(Number(process.env.REMOTE_GET_COUNT))
  ? Number(process.env.REMOTE_GET_COUNT)
  : 100;
export const QUEUE_MAX_LIMIT = !Number.isNaN(Number(process.env.QUEUE_MAX_LIMIT))
  ? Number(process.env.QUEUE_MAX_LIMIT)
  : 1_000;
export const PARALLEL_GREETS = !Number.isNaN(Number(process.env.PARALLEL_GREETS))
  ? Number(process.env.PARALLEL_GREETS)
  : 100;
export const GREET_TIMEOUT = !Number.isNaN(Number(process.env.PARALLEL_GREETS))
  ? Number(process.env.PARALLEL_GREETS)
  : undefined;
