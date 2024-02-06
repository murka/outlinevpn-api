import fetchWithPin from './fetch'
import type {
    User,
    Server,
    DataUsageByUser,
    ServerMetrics,
    HttpRequest,
    Options
} from "./types"

class OutlineVPN {
    apiUrl: string
    fingerprint: string
    timeout?: number
    constructor(options: Options) {
        this.apiUrl = options.apiUrl
        this.fingerprint = options.fingerprint
        this.timeout = options.timeout
    }

    private async fetch(req: HttpRequest) {
        return await fetchWithPin(req, this.fingerprint, this.timeout)
    }

    public async getServer(): Promise<Server> {
        const response = await this.fetch({ url: `${this.apiUrl}/server`, method: 'GET' })
        if(response.ok) {
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

        if(response.ok) {
            const json = JSON.parse(response.body)
            return json
        } else {
            throw new Error('No server found')
        }
    }

    public async getDataUserUsage(id: string): Promise<number> {
        const { bytesTransferredByUserId } = await this.getDataUsage()

        const userUsage = bytesTransferredByUserId[id]

        if(userUsage) {
            return userUsage
        } else {
            throw new Error('No user found, check metrics is enabled')
        }
    }

    public async getShareMetrics(): Promise<ServerMetrics> {
        const response = await this.fetch({ url: `${this.apiUrl}/metrics/enabled`, method: 'GET' })

        if(response.ok) {
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

        if(response.ok) {
            const json = JSON.parse(response.body)
            return json
        } else {
            throw new Error('No server found')
        }
    }

    public async getUsers(): Promise<User[]> {
        const response = await this.fetch({ url: `${this.apiUrl}/access-keys`, method: 'GET' })

        if(response.ok) {
            const { accessKeys } = JSON.parse(response.body)
            return accessKeys
        } else {
            throw new Error('No server found')
        }
    }

    public async getUser(id: string): Promise<User|null> {
        const response = await fetch(`${this.apiUrl}/access-keys/${id}`)
        if(response.ok) {
            const json = await response.json()
            return json
        }

        return null
    }

    public async createUser(): Promise<User> {
        const response = await this.fetch({
            url: `${this.apiUrl}/access-keys`,
            method: 'POST'
        })

        if(response.ok) {
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

export { OutlineVPN };