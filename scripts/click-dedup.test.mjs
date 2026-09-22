import test from 'node:test';
import assert from 'node:assert/strict';

test('click deduplication: rapid spam clicks coalesce into single execution', async () => {
  let executions = 0;
  const lock = { current: false };
  const lastTime = { current: 0 };
  const cooldownMs = 2000;

  const handleClick = async () => {
    const now = Date.now();
    if (lock.current || now - lastTime.current < cooldownMs) {
      return false;
    }
    lock.current = true;
    lastTime.current = now;
    executions++;
    await new Promise((resolve) => setTimeout(resolve, 50));
    lock.current = false;
    return true;
  };

  // Simulate 10 rapid spam clicks in 10ms
  const results = await Promise.all([
    handleClick(),
    handleClick(),
    handleClick(),
    handleClick(),
    handleClick(),
    handleClick(),
    handleClick(),
    handleClick(),
    handleClick(),
    handleClick(),
  ]);

  assert.equal(executions, 1, 'Only 1 execution should occur for rapid spam clicks');
  assert.equal(results.filter(Boolean).length, 1, 'Only 1 call should succeed');
});

test('toast debounce: identical messages within 1200ms are ignored', () => {
  const displayedToasts = [];
  const lastToast = { current: { message: '', time: 0 } };

  const notify = (message) => {
    const now = Date.now();
    if (lastToast.current.message === message && now - lastToast.current.time < 1200) {
      return false;
    }
    lastToast.current = { message, time: now };
    displayedToasts.push(message);
    return true;
  };

  // Multiple identical toast calls
  notify('Listing submitted for verification.');
  notify('Listing submitted for verification.');
  notify('Listing submitted for verification.');
  notify('Listing submitted for verification.');

  assert.equal(displayedToasts.length, 1, 'Identical toast spam should be debounced to 1');
  assert.equal(displayedToasts[0], 'Listing submitted for verification.');

  // Different toast message should still go through
  notify('Different notification.');
  assert.equal(displayedToasts.length, 2);
});

test('admin action locks: independent listings can be acted on concurrently while same listing is coalesced', async () => {
  const actionLock = new Set();
  const lastActionTime = {};
  const processed = [];

  const handleAdminAction = async (listingId, action) => {
    const now = Date.now();
    const actionKey = `${action}-${listingId}`;
    if (actionLock.has(actionKey) || (lastActionTime[actionKey] && now - lastActionTime[actionKey] < 2000)) {
      return false;
    }
    actionLock.add(actionKey);
    lastActionTime[actionKey] = now;
    processed.push(actionKey);
    await new Promise((resolve) => setTimeout(resolve, 30));
    actionLock.delete(actionKey);
    return true;
  };

  // Rapid spam clicks on listing-1, and 1 click on listing-2
  await Promise.all([
    handleAdminAction('listing-1', 'approve'),
    handleAdminAction('listing-1', 'approve'),
    handleAdminAction('listing-1', 'approve'),
    handleAdminAction('listing-2', 'approve'),
  ]);

  assert.deepEqual(processed, ['approve-listing-1', 'approve-listing-2']);
});
