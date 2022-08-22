import { fetch, setGlobalDispatcher, Agent } from "undici"
import type {
    User,
    Server,
    DataUsageByUser,
    ServerMetrics
} from "./types"

export default class OutlineVPN {
    apiUrl: string
    constructor(apiUrl: string) {
        this.apiUrl = apiUrl
        setGlobalDispatcher(new Agent({
            connect: {
                rejectUnauthorized: false
            }
        }))
    }

    public async getServer() {
        const response = await fetch(`${this.apiUrl}/server`)
        const json = await response.json()
        return json as Server
    }

    public async renameServer(name: string)  {
        const response = await fetch(`${this.apiUrl}/name`, {
            method: 'PUT',
            headers: new Headers({ 'Content-Type': 'application/json' }),
            body: JSON.stringify({ name })
        })

        return response.ok
    }

    public async setDefaultDataLimit(bytes: number) {
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

    public async getDataUsage() {
        const response = await fetch(`${this.apiUrl}/metrics/transfer`)
        const json = await response.json()
        return json as DataUsageByUser
    }

    public async getShareMetrics() {
        const response = await fetch(`${this.apiUrl}/metrics/enabled`)
        const json = await response.json()
        return json as ServerMetrics
    }

    public async setShareMetrics(metricsEnabled: boolean): Promise<boolean> {
        const response = await fetch(`${this.apiUrl}/metrics/enabled`, {
            method: 'PUT',
            headers: new Headers({ 'Content-Type': 'application/json' }),
            body: JSON.stringify({ metricsEnabled })
        })

        return response.ok
    }

    public async getUsers() {
        const response = await fetch(`${this.apiUrl}/access-keys`)
        const json = await response.json() as { accessKeys: User[] }
        return json?.accessKeys ?? []
    }

    // Rewrite to /access-keys/:id if https://github.com/Jigsaw-Code/outline-server/pull/1142 has been merged.
    public async getUser(id: string): Promise<User|null> {
        const users = await this.getUsers()

        const user = users.filter(user => user.id === id)

        if(user.length) {
            return user[0]
        } else {
            return null
        }
    }

    public async createUser() {
        const response = await fetch(`${this.apiUrl}/access-keys`, {
            method: 'POST'
        })

        const json = await response.json()
        return json as User
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

    public async getTransferredData() {
        const response = await fetch(`${this.apiUrl}/metrics/transfer`)
        const json = await response.json()
        return json as number
    }

    public async disableUser(id: string) {
        return await this.addDataLimit(id, 0)
    }

    public async enableUser(id: string) {
        return await this.deleteDataLimit(id)
    }

}
