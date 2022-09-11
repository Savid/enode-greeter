import { collectDefaultMetrics, Counter, register } from 'prom-client';

class Metrics {
  static collectDefaultMetrics = collectDefaultMetrics;

  static status = new Counter({
    name: 'enode_greeter_status_total',
    help: 'The total number of status from enodes',
  });

  static statusFailed = new Counter({
    name: 'enode_greeter_status_failed_total',
    help: 'The total number of failed status from enodes',
    labelNames: ['error'],
  });

  static remoteGets = new Counter({
    name: 'enode_greeter_remote_get_total',
    help: 'The total number of get requests to remote',
  });

  static remoteGetsFailed = new Counter({
    name: 'enode_greeter_remote_get_failed_total',
    help: 'The total number of failed get requests to remote',
  });

  static remoteGetEnodes = new Counter({
    name: 'enode_greeter_remote_get_enodes_total',
    help: 'The total number of enodes gotten from remote',
  });

  static remoteSends = new Counter({
    name: 'enode_greeter_remote_send_total',
    help: 'The total number of sent requests to remote',
  });

  static remoteSendsFailed = new Counter({
    name: 'enode_greeter_remote_send_failed_total',
    help: 'The total number of failed sent requests to remote',
  });

  static remoteSendStatuses = new Counter({
    name: 'enode_greeter_remote_send_statuses_total',
    help: 'The total number of statuses sent to remote',
  });

  static async metrics() {
    return register.metrics();
  }

  static nowMicro() {
    const [secs, nano] = process.hrtime();
    return Math.floor(secs * 1000000 + nano / 1000);
  }
}

Metrics.collectDefaultMetrics({ register });

export default Metrics;
