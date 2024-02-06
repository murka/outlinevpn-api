### Outline VPN API

Nodejs Client package for [Jigsaw-Code/outline-server](https://github.com/Jigsaw-Code/outline-server)

GitHub: [github.com/murka/outlinevpn-api](https://github.com/murka/outlinevpn-api)  
NPM: [npm.im/outlinevpn-api](https://npm.im/outlinevpn-api)


Example:
```ts
import { OutlineVPN } from 'outlinevpn-api'

const outlinevpn = new OutlineVPN({
    apiUrl: process.env.OUTLINE_API_URL,
    fingerprint: process.env.OUTLINE_API_FINGERPRINT
})

async function main() {
    const users = await outlinevpn.getUsers()
    console.log(users)
}

main()
```
