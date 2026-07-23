export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const fetcher = (url: string) =>
  fetch(`${BASE_PATH}${url}`).then((res) => res.json());
