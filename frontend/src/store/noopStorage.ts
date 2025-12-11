/**
 * A no-operation storage engine for redux-persist
 * Used as a fallback when localStorage is not available (e.g., server-side rendering)
 */

export const createNoopStorage = () => {
  return {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getItem: (_key: string) => {
      return Promise.resolve(null);
    },
    setItem: (_key: string, value: unknown) => {
      return Promise.resolve(value);
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    removeItem: (_key: string) => {
      return Promise.resolve();
    }
  };
};

export default createNoopStorage; 