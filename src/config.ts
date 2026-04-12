declare global {
  interface Window {
    __CONFIG__: {
      BFF_HOST: string;
    };
  }
}

export const BFF_HOST = window.__CONFIG__.BFF_HOST;
