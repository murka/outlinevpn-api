import https from 'node:https'
import nodefetch, { RequestInfo, RequestInit, Headers } from 'node-fetch'
import type {
    User,
    Server,
    DataUsageByUser,
    ServerMetrics
} from "./types"

const fetch = (url: RequestInfo, init?: RequestInit) => nodefetch(url, { ...init, agent: new https.Agent({ rejectUnauthorized: false }) })


export default class OutlineVPN {
    apiUrl: string
    constructor(apiUrl: string) {
        this.apiUrl = apiUrl
    }

    public async getServer(): Promise<Server> {
        const response = await fetch(`${this.apiUrl}/server`)
        const json = await response.json()
        return json
    }

    public async renameServer(name: string): Promise<boolean> {
        const response = await fetch(`${this.apiUrl}/name`, {
            method: 'PUT',
            headers: new Headers({ 'Content-Type': 'application/json' }),
            body: JSON.stringify({ name })
        })

        return response.ok
    }

    public async setDefaultDataLimit(bytes: number): Promise<boolean> {
        const response = await fetch(`${this.apiUrl}/server/access-key-data-limit`, {
            method: 'PUT',
            headers: new Headers({ 'Content-Type': 'application/json' }),
            body: JSON.stringify({ limit: { bytes } })
        })

        return response.ok
    }

    public async deleteDefaultDataLimit(): Promise<boolean> {
        const response = await fetch(`${this.apiUrl}/server/access-key-data-limit`, {
            method: 'DELETE'
        })

        return response.ok
    }

    public async setHostnameForAccessKeys(hostname: string): Promise<boolean> {
        const response = await fetch(`${this.apiUrl}/server/hostname-for-access-keys`, {
            method: 'PUT',
            headers: new Headers({ 'Content-Type': 'application/json' }),
            body: JSON.stringify({ hostname })
        })

        return response.ok
    }

    public async setPortForNewAccessKeys(port: number): Promise<boolean> {
        const response = await fetch(`${this.apiUrl}/server/port-for-new-access-keys`, {
            method: 'PUT',
            headers: new Headers({ 'Content-Type': 'application/json' }),
            body: JSON.stringify({ port })
        })

        return response.ok
    }

    public async getDataUsage(): Promise<DataUsageByUser> {
        const response = await fetch(`${this.apiUrl}/metrics/transfer`)
        const json = await response.json()
        return json
    }

    public async getShareMetrics(): Promise<ServerMetrics> {
        const response = await fetch(`${this.apiUrl}/metrics/enabled`)
        const json = await response.json()
        return json
    }

    public async setShareMetrics(metricsEnabled: boolean): Promise<boolean> {
        const response = await fetch(`${this.apiUrl}/metrics/enabled`, {
            method: 'PUT',
            headers: new Headers({ 'Content-Type': 'application/json' }),
            body: JSON.stringify({ metricsEnabled })
        })

        return response.ok
    }

    public async getUsers(): Promise<User[]> {
        const response = await fetch(`${this.apiUrl}/access-keys`)
        const { accessKeys } = await response.json()
        return accessKeys
    }

    public async getUser(id: string): Promise<User|null> {
        const response = await fetch(`${this.apiUrl}/access-keys/${id}`)
        if(response.ok) {
            const json = await response.json()
            return json
        } else {
            return null
        }
    }

    public async createUser(): Promise<User> {
        const response = await fetch(`${this.apiUrl}/access-keys`, {
            method: 'POST'
        })

        const json = await response.json()
        return json
    }

    public async deleteUser(id: string): Promise<boolean> {
        const response = await fetch(`${this.apiUrl}/access-keys/${id}`, {
            method: 'DELETE'
        })

        return response.ok
    }

    public async renameUser(id: string, name: string): Promise<boolean> {
        const response = await fetch(`${this.apiUrl}/access-keys/${id}/name`, {
            method: 'PUT',
            headers: new Headers({ 'Content-Type': 'application/json' }),
            body: JSON.stringify({ name })
        })

        return response.ok
    }

    public async addDataLimit(id: string, bytes: number): Promise<boolean> {
        const response = await fetch(`${this.apiUrl}/access-keys/${id}/data-limit`, {
            method: 'PUT',
            headers: new Headers({ 'Content-Type': 'application/json' }),
            body: JSON.stringify({ limit: { bytes } })
        })

        return response.ok
    }

    public async deleteDataLimit(id: string): Promise<boolean> {
        const response = await fetch(`${this.apiUrl}/access-keys/${id}/data-limit`, {
            method: 'DELETE'
        })

        return response.ok
    }

    public async getTransferredData(): Promise<number> {
        const response = await fetch(`${this.apiUrl}/metrics/transfer`)
        const json = await response.json()
        return json
    }

    public async disableUser(id: string): Promise<boolean> {
        return await this.addDataLimit(id, 0)
    }

    public async enableUser(id: string): Promise<boolean> {
        return await this.deleteDataLimit(id)
    }

}
