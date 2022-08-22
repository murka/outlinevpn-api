## Outline VPN API

Nodejs Client package for [Jigsaw-Code/outline-server](https://github.com/Jigsaw-Code/outline-server)

GitHub: [github.com/murka/outlinevpn-api](https://github.com/murka/outlinevpn-api)


Example:
```ts
import OutlineVPN from 'outlinevpn-api'

const outlinevpn = new OutlineVPN(process.env.OUTLINE_API_URL)

async function main() {
    const users = outlinevpn.getUsers()
    console.log(users)
}

main()
```

```ts
interface User {
    id: string,
    name: string,
    password: string,
    port: number,
    method: string,
    accessUrl: string
}
```
# getUsers(): Promise<User[]>
```ts
await outlinevpn.getUsers()
```

# getUser(id: string): Promise<User|null>
```ts
await outlinevpn.getUser("1984")
```

# disableUser(id: string): Promise<boolean>
### This is a custom method, not specified in outline server
```ts
await outlinevpn.disableUser("1984")
```

# enableUser(id: string): Promise<boolean>
### This is a custom method, not specified in outline server
```ts
await outlinevpn.enableUser("1984")
```

# createUser(): Promise<User>
```ts
await outlinevpn.createUser()
```

# deleteUser(id: string): Promise<boolean>
```ts
await outlinevpn.deleteUser("1984")
```

# renameUser(id: string, name: string): Promise<boolean>
```ts
await outlinevpn.renameUser("1984", "George Orwell")
```

# addDataLimit(id: string, bytes: number): Promise<boolean>
```ts
await outlinevpn.addDataLimit("1984", 1984e8)
```

# getTransferredData(): Promise<number>
```ts
await outlinevpn.getTransferredData()
```
