/* eslint-disable no-console */

/**
 * A wrapper around log. Use this when you mean to have logging in the shipped app.
 * Otherwise, we'll prevent log from getting submitted via a lint rule.
 *
 * @param tag an informative label for categorizing this log
 * @example infoLog("Manifest", "The manifest loaded")
 */
export function infoLog(tag: string, message: any, ...args: any[]) {
  console.log(`[${tag}]`, message, ...args);
}

/**
 * A wrapper around warnLog. Use this when you mean to have logging in the shipped app.
 * Otherwise, we'll prevent warnLog from getting submitted via a lint rule.
 *
 * @param tag an informative label for categorizing this log
 * @example warn("Manifest", "The manifest is out of date")
 */
export function warnLog(tag: string, message: any, ...args: any[]) {
  console.warn(`[${tag}]`, message, ...args);
}

/**
 * A wrapper around errorLog. Use this when you mean to have logging in the shipped app.
 * Otherwise, we'll prevent errorLog from getting submitted via a lint rule.
 *
 * @param tag an informative label for categorizing this log
 * @example error("Manifest", "The manifest failed to load")
 */
export function errorLog(tag: string, message: any, ...args: any[]) {
  console.error(`[${tag}]`, message, ...args);
}

/**
 * A wrapper around console.time. Use this when you mean to have timing in the shipped app.
 * Otherwise, we'll prevent console.time from getting submitted via a lint rule.
 *
 * Unlike the real console.time, this returns a function that is used to end the timer.
 */
export function timer(tag: string) {
  console.time(tag);
  return () => console.timeEnd(tag);
}
