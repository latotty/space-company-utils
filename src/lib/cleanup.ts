interface CleanupWindow {
  cleanupSpaceCompanyRemainingScript?: Function;
}

const cleanupWindow: CleanupWindow = window as any as CleanupWindow;

if (cleanupWindow.cleanupSpaceCompanyRemainingScript) {
  cleanupWindow.cleanupSpaceCompanyRemainingScript();
  delete cleanupWindow.cleanupSpaceCompanyRemainingScript;
}
cleanupWindow.cleanupSpaceCompanyRemainingScript = cleanup;

const cleanupFns: Function[] = [];

function cleanup() {
  cleanupFns.forEach(fn => fn());
}

export const addCleanup = (fn: Function) => cleanupFns.push(fn);
