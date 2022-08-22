### Outline VPN API

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
