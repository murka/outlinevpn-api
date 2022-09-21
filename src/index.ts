import fetchWithPin from './fetch'
import type {
    User,
    Server,
    DataUsageByUser,
    ServerMetrics,
    HttpRequest
} from "./types"


export default class OutlineVPN {
    apiUrl: string
    fingerprint: string
    constructor({ apiUrl, fingerprint }: { apiUrl: string, fingerprint: string }) {
        this.apiUrl = apiUrl
        this.fingerprint = fingerprint
    }

    private async fetch(req: HttpRequest) {
        return await fetchWithPin(req, this.fingerprint)
    }

    public async getServer(): Promise<Server> {
        const response = await this.fetch({ url: `${this.apiUrl}/server`, method: 'GET' })
        
        if(response.body) {
            const json = JSON.parse(response.body)
            return json
        } else {
            throw new Error('No server found')
        }
    }

    public async renameServer(name: string): Promise<boolean> {
        const response = await this.fetch({
            url: `${this.apiUrl}/name`,
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name })
        })

        return response.ok
    }

    public async setDefaultDataLimit(bytes: number): Promise<boolean> {
        const response = await this.fetch({
            url: `${this.apiUrl}/server/access-key-data-limit`,
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ limit: { bytes } })
        })

        return response.ok
    }

    public async deleteDefaultDataLimit(): Promise<boolean> {
        const response = await this.fetch({ url: `${this.apiUrl}/server/access-key-data-limit`,
            method: 'DELETE'
        })

        return response.ok
    }

    public async setHostnameForAccessKeys(hostname: string): Promise<boolean> {
        const response = await this.fetch({ url: `${this.apiUrl}/server/hostname-for-access-keys`,
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ hostname })
        })

        return response.ok
    }

    public async setPortForNewAccessKeys(port: number): Promise<boolean> {
        const response = await this.fetch({ url: `${this.apiUrl}/server/port-for-new-access-keys`,
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ port })
        })

        return response.ok
    }

    public async getDataUsage(): Promise<DataUsageByUser> {
        const response = await this.fetch({ url: `${this.apiUrl}/metrics/transfer`, method: 'GET' })

        if(response.body) {
            const json = JSON.parse(response.body)
            return json
        } else {
            throw new Error('No server found')
        }
    }

    public async getShareMetrics(): Promise<ServerMetrics> {
        const response = await this.fetch({ url: `${this.apiUrl}/metrics/enabled`, method: 'GET' })

        if(response.body) {
            const json = JSON.parse(response.body)
            return json
        } else {
            throw new Error('No server found')
        }
    }

    public async setShareMetrics(metricsEnabled: boolean): Promise<boolean> {
        const response = await this.fetch({ url: `${this.apiUrl}/metrics/enabled`,
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ metricsEnabled })
        })

        if(response.body) {
            const json = JSON.parse(response.body)
            return json
        } else {
            throw new Error('No server found')
        }
    }

    public async getUsers(): Promise<User[]> {
        const response = await this.fetch({ url: `${this.apiUrl}/access-keys`, method: 'GET' })

        if(response.body) {
            const { accessKeys } = JSON.parse(response.body)
            return accessKeys
        } else {
            throw new Error('No server found')
        }
    }

    // Rewrite to /access-keys/:id if https://github.com/Jigsaw-Code/outline-server/pull/1142 has been merged.
    public async getUser(id: string): Promise<User|null> {
        const users = await this.getUsers()

        for (const user of users) {
            if(user.id === id) {
                return user
            }
        }

        return null
    }

    public async createUser(): Promise<User> {
        const response = await this.fetch({
            url: `${this.apiUrl}/access-keys`,
            method: 'POST'
        })

        if(response.body) {
            const json = JSON.parse(response.body)
            return json
        } else {
            throw new Error('No server found')
        }
    }

    public async deleteUser(id: string): Promise<boolean> {
        const response = await this.fetch({
            url: `${this.apiUrl}/access-keys/${id}`,
            method: 'DELETE'
        })

        return response.ok
    }

    public async renameUser(id: string, name: string): Promise<boolean> {
        const response = await this.fetch({
            url: `${this.apiUrl}/access-keys/${id}/name`,
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name })
        })

        return response.ok
    }

    public async addDataLimit(id: string, bytes: number): Promise<boolean> {
        const response = await this.fetch({
            url: `${this.apiUrl}/access-keys/${id}/data-limit`,
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ limit: { bytes } })
        })

        return response.ok
    }

    public async deleteDataLimit(id: string): Promise<boolean> {
        const response = await this.fetch({
            url: `${this.apiUrl}/access-keys/${id}/data-limit`,
            method: 'DELETE'
        })

        return response.ok
    }

    public async disableUser(id: string): Promise<boolean> {
        return await this.addDataLimit(id, 0)
    }

    public async enableUser(id: string): Promise<boolean> {
        return await this.deleteDataLimit(id)
    }

}
