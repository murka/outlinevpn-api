# Outline VPN API

Badges: [![DeepScan grade](https://deepscan.io/api/teams/19161/projects/22495/branches/665831/badge/grade.svg)](https://deepscan.io/dashboard#view=project&tid=19161&pid=22495&bid=665831)

A Nodejs Client package for managing Outline servers: [Jigsaw-Code/outline-server](https://github.com/Jigsaw-Code/outline-server)

GitHub: [github.com/murka/outlinevpn-api](https://github.com/murka/outlinevpn-api)  
NPM: [npm.im/outlinevpn-api](https://npm.im/outlinevpn-api)

# Usage

```ts
import { OutlineVPN } from "outlinevpn-api";

const client = new OutlineVPN({
  apiUrl: "https://your-server.com/api",
  fingerprint: "your-server-certificate-fingerprint",
});
```

## Server Management

### Get Server Info

```ts
// Returns: Server details including name, ID, metrics status etc.
const server = await client.getServer();
```

### Rename Server

```ts
const success = await client.renameServer("My Server");
```

### Configure Server Settings

#### Set Hostname

```ts
const success = await client.setHostnameForAccessKeys("example.com");
```

#### Set Default Port

```ts
const success = await client.setPortForNewAccessKeys(12345);
```

#### Manage Data Limits

```ts
// Set default data limit for new keys
await client.setDefaultDataLimit(1000000000); // 1GB in bytes

// Remove default data limit
await client.deleteDefaultDataLimit();
```

### Access Key Management

#### List Access Keys

```ts
const accessKeys = await client.getAccessKeys();
```

#### Create Access Key

```ts
// Create with default settings
const key = await client.createAccessKey();

// Create with custom options
const customKey = await client.createAccessKey({
  name: "Custom Key",
  password: "custom-password",
  port: 8388,
});

// Create with specific ID
const keyWithId = await client.createAccessKeyWithId("custom-id", {
  name: "Named Key",
});
```

#### Manage Existing Access Key

```ts
// Get specific key
const key = await client.getAccessKey("key-id");

// Rename key
await client.renameAccessKey("key-id", "New Name");

// Set data limit for key
await client.addDataLimit("key-id", 1000000000); // 1GB

// Remove data limit
await client.deleteDataLimit("key-id");

// Delete key
await client.deleteAccessKey("key-id");
```

## Metrics

### Usage Statistics

```ts
// Get data usage per access key
const usage = await client.getDataUsage();

// Get metrics sharing status
const metrics = await client.getShareMetrics();

// Enable/disable metrics sharing
await client.setShareMetrics(true);
```

## Error Handling

The API throws several types of errors:

```ts
try {
  await client.getAccessKey("non-existent");
} catch (error) {
  if (error instanceof NotFoundError) {
    // Handle 404
  } else if (error instanceof ValidationError) {
    // Handle validation errors
  } else if (error instanceof OutlineError) {
    // Handle other API errors
  }
}
```

# Types

## Server

```ts
interface Server {
  name: string;
  serverId: string;
  metricsEnabled: boolean;
  createdTimestampMs: number;
  portForNewAccessKeys?: number;
  hostnameForAccessKeys?: string;
  accessKeyDataLimit?: {
    bytes: number;
  };
  version?: string;
}
```

## Access Key

```ts
interface AccessKey {
  id: string;
  name: string;
  password: string;
  port: number;
  method: string;
  accessUrl: string;
  limit?: {
    bytes: number;
  };
}
```

# Response Codes

| Code | Description                          |
| ---- | ------------------------------------ |
| 200  | Successful GET request               |
| 201  | Resource created successfully        |
| 204  | Successful operation with no content |
| 400  | Invalid request/parameters           |
| 404  | Resource not found                   |
| 409  | Conflict (e.g., port already in use) |
| 500  | Server error                         |
