
const {Docker} = require('node-docker-api')

const docker = new Docker({ socketPath: '/var/run/docker.sock' })

console.log('getting containers...')

async function docker_container_list() {
    return new Promise((resolve, reject) => {
        docker.container.list()
            .then(function (containers) {
                console.log(containers)
                const container_list = []
                for (let i = 0; i < containers.length; i++) {
                    container_list.push({
                        id: containers[i].data.Id,
                        name: containers[i].data.Names[0],
                        image: containers[i].data.Image,
                        state: containers[i].data.State,
                        status: containers[i].data.Status
                    })
                }
                console.table(container_list)

                resolve(container_list)
            })
            .catch(function (err) {
                console.log(err)
                reject(err)
            })
    })
}

async function restart_container(id) {
    console.log('restarting container: ' + id)
    return new Promise((resolve, reject) => {
        docker.container.get(id)
            .then(function (container) {
                container.restart()
                    .then(function () {
                        console.log('Restarted container: ' + id)
                        resolve(true)
                    })
                    .catch(function (err) {
                        console.log(err)
                        reject(err)
                    })
            })
            .catch(function (err) {
                console.log(err)
                reject(err)
            })
    })
}

async function main() {
    const container_list = await docker_container_list()

    console.log(container_list)
    for (let i = 0; i < container_list.length; i++) {
        if (container_list[i].name.includes('cam')) {
            await restart_container(container_list[i].id)
            docker_container_list()
            process.exit(0)
            break
        }
    }
}

main()