import { AsyncLocalStorage } from "node:async_hooks";

const renderingContext = new AsyncLocalStorage<{ active: boolean }>();
let pendingRender: Promise<void> = Promise.resolve();

// DOM globals are shared across saves. Keep them owned by one render until its
// callback and file output finish, and let later saves proceed after failures.
export default function serializeChartRendering(
  render: () => Promise<void>,
): Promise<void> {
  if (renderingContext.getStore()?.active) {
    return Promise.reject(
      new Error("saveChart() cannot be called from inside a chart function."),
    );
  }

  const currentRender = pendingRender.then(() => {
    const context = { active: true };
    return renderingContext.run(context, async () => {
      try {
        await render();
      } finally {
        context.active = false;
      }
    });
  });
  pendingRender = currentRender.catch(() => {});
  return currentRender;
}
