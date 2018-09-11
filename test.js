import delay from 'delay';
import timeSpan from 'time-span';
import pWaveringWaitFor from '.';

const runAllPromises = () =>
  new Promise((resolve) => process.nextTick(() => resolve(true)));

describe('pWaveringWaitFor', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  test('waits for condition', async () => {
    jest.useRealTimers();
    const ms = 200;
    const end = timeSpan();

    await pWaveringWaitFor(async () => {
      await delay(ms);
      return true;
    });

    expect(end() > ms - 20).toBe(true);
  });

  test('rejects promise if condition rejects or throws', async () => {
    await expect(
      pWaveringWaitFor(async () => {
        throw new Error('foo');
      }),
    ).rejects.toThrow('foo');
  });

  test('waits random time between min and max', async () => {
    let run = 0;
    const minInterval = 100;
    const maxInterval = 300;

    const promise = pWaveringWaitFor(
      () => {
        if (++run <= 3) {
          return Promise.resolve(false);
        }
        return Promise.resolve(true);
      },
      {
        maxInterval,
        minInterval,
      },
    );

    await runAllPromises();
    jest.runOnlyPendingTimers();
    await runAllPromises();
    jest.runOnlyPendingTimers();
    await runAllPromises();
    jest.runOnlyPendingTimers();

    await promise;

    expect(setTimeout).toHaveBeenCalledTimes(3);
    expect(setTimeout.mock.calls[0][1]).toBeGreaterThanOrEqual(minInterval);
    expect(setTimeout.mock.calls[0][1]).toBeLessThanOrEqual(maxInterval);

    expect(setTimeout.mock.calls[1][1]).toBeGreaterThanOrEqual(minInterval);
    expect(setTimeout.mock.calls[1][1]).toBeLessThanOrEqual(maxInterval);

    expect(setTimeout.mock.calls[2][1]).toBeGreaterThanOrEqual(minInterval);
    expect(setTimeout.mock.calls[2][1]).toBeLessThanOrEqual(maxInterval);
  });

  test('waits no longer than `timeout` milliseconds before rejecting', async () => {
    const maxWait = 100;

    expect(
      pWaveringWaitFor(
        async () => {
          await delay(200);
          return true;
        },
        {
          timeout: maxWait,
        },
      ),
    ).rejects.toThrow();

    jest.advanceTimersByTime(300);
  });
});
