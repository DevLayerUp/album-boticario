export class TimeoutError extends Error {
  constructor(message = "Operação expirou.") {
    super(message);
    this.name = "TimeoutError";
  }
}

/** Rejeita se a promise não resolver dentro do prazo. */
export function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  message?: string,
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new TimeoutError(message));
    }, ms);

    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}
