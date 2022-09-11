import logger from '@savid/logger';
import pest, { PeerError } from '@savid/rlpx-pest';
import { each } from 'async';

import {
  REMOTE_SEND_ENDPOINT,
  REMOTE_GET_ENDPOINT,
  REMOTE_SECRET,
  REMOTE_SEND_INTERVAL,
  REMOTE_GET_INTERVAL,
  REMOTE_GET_COUNT,
  QUEUE_MAX_LIMIT,
  PARALLEL_GREETS,
  GREET_TIMEOUT,
} from '#app/constants';
import Metrics from '#app/metrics';

interface Status {
  enode: string;
  error?: {
    message: string;
    code?: PeerError['code'];
  };
  data?: Omit<Awaited<ReturnType<typeof pest>>, 'networkId' | 'td'> & {
    networkId: string;
    td: string;
  };
}

export default class Greeter {
  static hydrateInterval: NodeJS.Timeout | undefined;

  static hydrateAbortController: AbortController | undefined;

  static sendInterval: NodeJS.Timeout | undefined;

  static sendAbortController: AbortController | undefined;

  static enodes: string[] = [];

  static statuses: Status[] = [];

  static started = true;

  static init() {
    this.hydrater();
    this.sender();
    this.greeter();
  }

  static async greeter() {
    while (this.started) {
      if (this.enodes.length > 0) {
        // eslint-disable-next-line no-await-in-loop
        await each(this.enodes.splice(0, PARALLEL_GREETS), async (enode) => {
          try {
            const { networkId, td, ...rest } = await pest({
              enode,
              timeout: GREET_TIMEOUT,
            });
            this.statuses.push({
              enode,
              data: {
                ...rest,
                networkId: networkId.toString(),
                td: td.toString(),
              },
            });
            Metrics.status.inc();
          } catch (error) {
            if (error instanceof PeerError) {
              this.statuses.push({
                enode,
                error: {
                  message: error.message,
                  code: error.code,
                },
              });
              Metrics.statusFailed.labels(error.code).inc();
            } else if (error instanceof Error) {
              this.statuses.push({
                enode,
                error: {
                  message: error.message,
                },
              });
              Metrics.statusFailed.labels('unknown').inc();
            }
          }
        });
      }
      // eslint-disable-next-line no-await-in-loop
      await new Promise((resolve) => {
        setTimeout(resolve, 1000);
      });
    }
  }

  static async hydrater() {
    if (this.hydrateInterval) clearInterval(this.hydrateInterval);
    this.hydrateInterval = setInterval(() => this.hydrate(), REMOTE_GET_INTERVAL);
  }

  static async hydrate() {
    if (this.enodes.length > QUEUE_MAX_LIMIT) {
      logger.warn('queue max limit reached', {
        enodesCount: this.enodes.length,
        queueMaxLimit: QUEUE_MAX_LIMIT,
      });
    }
    try {
      this.hydrateAbortController = new AbortController();
      const res = await fetch(`${REMOTE_GET_ENDPOINT}?count=${REMOTE_GET_COUNT}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(REMOTE_SECRET && { Authorization: `Basic ${REMOTE_SECRET}` }),
        },
        signal: this.hydrateAbortController?.signal,
      });
      const json = (await res.json()) as string[];
      Metrics.remoteGets.inc();
      Metrics.remoteGetEnodes.inc(json.length);
      this.enodes.push(...json);
    } catch (error) {
      if (error instanceof Error) {
        logger.error('get error', {
          error: error.toString(),
          stack: error.stack,
        });
      }
      Metrics.remoteGetsFailed.inc();
    }
  }

  static async sender() {
    if (this.sendInterval) clearInterval(this.sendInterval);
    this.sendInterval = setInterval(() => this.send(), REMOTE_SEND_INTERVAL);
  }

  static async send() {
    const statuses = this.statuses.splice(0);
    if (statuses.length) {
      try {
        this.sendAbortController = new AbortController();
        await fetch(REMOTE_SEND_ENDPOINT, {
          method: 'post',
          body: JSON.stringify(statuses),
          headers: {
            'Content-Type': 'application/json',
            ...(REMOTE_SECRET && { Authorization: `Basic ${REMOTE_SECRET}` }),
          },
          signal: this.sendAbortController?.signal,
        });
        Metrics.remoteSends.inc();
        Metrics.remoteSendStatuses.inc(statuses.length);
      } catch (error) {
        if (error instanceof Error) {
          logger.error('send error', {
            error: error.toString(),
            stack: error.stack,
            statusesCount: statuses.length,
          });
        }
        Metrics.remoteSendsFailed.inc();
      }
    }
  }

  static async shutdown() {
    this.started = false;
    this.hydrateAbortController?.abort();
    this.sendAbortController?.abort();
    if (this.hydrateInterval) clearInterval(this.hydrateInterval);
    if (this.sendInterval) clearInterval(this.sendInterval);
  }
}
