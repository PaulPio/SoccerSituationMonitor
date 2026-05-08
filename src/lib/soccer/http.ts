type HttpJsonOptions = {
  headers?: Record<string, string>;
  revalidateSeconds?: number;
  timeoutMs?: number;
};

export class HttpError extends Error {
  readonly status: number;
  readonly url: string;

  constructor(message: string, status: number, url: string) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.url = url;
  }
}

export async function fetchJson<T>(url: string, options: HttpJsonOptions = {}): Promise<T> {
  const timeoutMs = options.timeoutMs ?? 9000;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        ...(options.headers ?? {}),
      },
      next: options.revalidateSeconds ? { revalidate: options.revalidateSeconds } : undefined,
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new HttpError(`Request failed with status ${response.status}`, response.status, url);
    }

    return (await response.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}
