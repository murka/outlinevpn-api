import type {
  AccessKey,
  Server,
  ServerMetrics,
  HttpRequest,
  Options,
  CreateAccessKeyOptions,
  DataUsagePerAccessKey,
} from "./types";
import { NotFoundError, OutlineError, ValidationError } from "./errors";
import fetchWithPin from "./fetch";

class OutlineVPN {
  apiUrl: string;
  fingerprint: string;
  timeout?: number;

  constructor(options: Options) {
    this.apiUrl = options.apiUrl;
    this.fingerprint = options.fingerprint;
  }

  private async fetch(req: HttpRequest) {
    return await fetchWithPin(req, this.fingerprint, this.timeout);
  }

  public async getServer(): Promise<Server> {
    const response = await this.fetch({
      url: `${this.apiUrl}/server`,
      method: "GET",
    });
    if (response.ok) {
      return JSON.parse(response.body);
    } else {
      throw new OutlineError("Failed to get server");
    }
  }

  public async renameServer(name: string): Promise<boolean> {
    const response = await this.fetch({
      url: `${this.apiUrl}/name`,
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    if (response.status === 204) return true;
    if (response.status === 400) {
      throw new ValidationError("Invalid server name");
    }
    throw new OutlineError(`Failed to rename server: ${response.status}`);
  }

  public async setDefaultDataLimit(bytes: number): Promise<boolean> {
    const response = await this.fetch({
      url: `${this.apiUrl}/server/access-key-data-limit`,
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ limit: { bytes } }),
    });

    if (response.status === 204) return true;
    if (response.status === 400) {
      throw new ValidationError("Invalid data limit");
    }
    throw new OutlineError(`Failed to set data limit: ${response.status}`);
  }

  public async deleteDefaultDataLimit(): Promise<boolean> {
    const response = await this.fetch({
      url: `${this.apiUrl}/server/access-key-data-limit`,
      method: "DELETE",
    });

    if (response.status === 204) return true;

    throw new OutlineError(`Failed to delete data limit: ${response.status}`);
  }

  public async setHostnameForAccessKeys(hostname: string): Promise<boolean> {
    const response = await this.fetch({
      url: `${this.apiUrl}/server/hostname-for-access-keys`,
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hostname }),
    });

    if (response.status === 204) return true;
    if (response.status === 400) {
      throw new ValidationError(
        "An invalid hostname or IP address was provided",
      );
    }

    if (response.status === 500) {
      throw new OutlineError(
        "An internal error occurred.  This could be thrown if there were network errors while validating the hostname",
      );
    }
    throw new OutlineError(`Failed to set hostname: ${response.status}`);
  }

  public async setPortForNewAccessKeys(port: number): Promise<boolean> {
    const response = await this.fetch({
      url: `${this.apiUrl}/server/port-for-new-access-keys`,
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ port }),
    });

    if (response.status === 204) return true;
    if (response.status === 400) {
      throw new ValidationError(
        "The requested port wasn't an integer from 1 through 65535, or the request had no port parameter",
      );
    }
    if (response.status === 409) {
      throw new OutlineError(
        "The requested port was already in use by another service",
      );
    }
    throw new OutlineError(`Failed to set port: ${response.status}`);
  }

  public async getShareMetrics(): Promise<ServerMetrics> {
    const response = await this.fetch({
      url: `${this.apiUrl}/metrics/enabled`,
      method: "GET",
    });

    if (response.status === 200) {
      return JSON.parse(response.body);
    }
    throw new OutlineError(`Failed to get share metrics: ${response.status}`);
  }

  public async setShareMetrics(metricsEnabled: boolean): Promise<boolean> {
    const response = await this.fetch({
      url: `${this.apiUrl}/metrics/enabled`,
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ metricsEnabled }),
    });

    if (response.status === 204) return true;
    if (response.status === 400) {
      throw new OutlineError("Invalid request");
    }
    throw new OutlineError(`Failed to set share metrics: ${response.status}`);
  }

  public async getDataUsage(): Promise<DataUsagePerAccessKey> {
    const response = await this.fetch({
      url: `${this.apiUrl}/metrics/transfer`,
      method: "GET",
    });
    if (response.status === 200) {
      return JSON.parse(response.body);
    }
    throw new OutlineError(`Failed to get data usage: ${response.status}`);
  }

  public async getAccessKeys(): Promise<AccessKey[]> {
    const response = await this.fetch({
      url: `${this.apiUrl}/access-keys`,
      method: "GET",
    });

    if (response.status === 200) {
      return JSON.parse(response.body);
    }
    throw new OutlineError(`Failed to get access keys: ${response.status}`);
  }

  public async getAccessKey(id: string): Promise<AccessKey> {
    const response = await this.fetch({
      url: `${this.apiUrl}/access-keys/${id}`,
      method: "GET",
    });

    if (response.status === 200) {
      return JSON.parse(response.body);
    }
    if (response.status === 404) {
      throw new NotFoundError("Access key not found");
    }
    throw new OutlineError(`Failed to get access key: ${response.status}`);
  }

  public async createAccessKey(
    options?: CreateAccessKeyOptions,
  ): Promise<AccessKey> {
    const response = await this.fetch({
      url: `${this.apiUrl}/access-keys`,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: options ? JSON.stringify(options) : undefined,
    });

    if (response.status === 201) {
      return JSON.parse(response.body);
    }
    if (response.status === 400) {
      throw new ValidationError("Invalid access key parameters");
    }
    throw new OutlineError(`Failed to create access key`);
  }

  public async createAccessKeyWithId(
    id: string,
    options?: CreateAccessKeyOptions,
  ): Promise<AccessKey> {
    const response = await this.fetch({
      url: `${this.apiUrl}/access-keys/${id}`,
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: options ? JSON.stringify(options) : undefined,
    });

    if (response.status === 201) {
      return JSON.parse(response.body);
    }

    throw new OutlineError(`Failed to create access key: ${response.status}`);
  }

  public async deleteAccessKey(id: string): Promise<boolean> {
    const response = await this.fetch({
      url: `${this.apiUrl}/access-keys/${id}`,
      method: "DELETE",
    });

    if (response.status === 204) return true;
    if (response.status === 404) {
      throw new NotFoundError("Access key not found");
    }
    throw new OutlineError(`Failed to delete access key: ${response.status}`);
  }

  public async renameAccessKey(id: string, name: string): Promise<boolean> {
    const response = await this.fetch({
      url: `${this.apiUrl}/access-keys/${id}/name`,
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    if (response.status === 204) return true;
    if (response.status === 404) {
      throw new NotFoundError("Access key not found");
    }
    throw new OutlineError(`Failed to rename access key: ${response.status}`);
  }

  public async addDataLimit(id: string, bytes: number): Promise<boolean> {
    const response = await this.fetch({
      url: `${this.apiUrl}/access-keys/${id}/data-limit`,
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ limit: { bytes } }),
    });

    if (response.status === 204) return true;
    if (response.status === 400) {
      throw new ValidationError("Invalid data limit");
    }
    if (response.status === 404) {
      throw new NotFoundError("Access key not found");
    }
    throw new OutlineError(`Failed to add data limit: ${response.status}`);
  }

  public async deleteDataLimit(id: string): Promise<boolean> {
    const response = await this.fetch({
      url: `${this.apiUrl}/access-keys/${id}/data-limit`,
      method: "DELETE",
    });

    if (response.status === 204) return true;
    if (response.status === 404) {
      throw new NotFoundError("Access key not found");
    }
    throw new OutlineError(`Failed to delete data limit: ${response.status}`);
  }
}

export { OutlineVPN };
export * from "./errors";
export * from "./types";
