import https from 'node:https'
import nodefetch, { RequestInfo, RequestInit } from 'node-fetch'
import { User } from "./types"

const fetch = (url: RequestInfo, init?: RequestInit) => nodefetch(url, { ...init, agent: new https.Agent({ rejectUnauthorized: false }) })

export class OutlineVPN {
    apiUrl: string
    constructor(apiUrl: string) {
        this.apiUrl = apiUrl
    }

    public async getUsers(): Promise<User[]> {
        const response = await fetch(`${this.apiUrl}/access-keys`)
        const { accessKeys } = await response.json()
        return accessKeys
    }

    public async getUser(id: string): Promise<User|null> {
        const users = await this.getUsers()

        const user = users.filter(user => user.id === id)

        if(user.length) {
            return user[0]
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
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name })
        })

        return response.ok
    }

    public async addDataLimit(id: string, bytes: number): Promise<boolean> {
        const response = await fetch(`${this.apiUrl}/access-keys/${id}/data-limit`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
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
