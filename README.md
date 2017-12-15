# miner-api
This is a node application which can run on a miner and display sensor data / uptime.

#installation
1. Install docker CE https://docs.docker.com/engine/installation/ 
2. Build the docker image `docker build -t miner-api/node-web-app . `
3. Now when you run a `docker images -a` you should see miner-api/node-web-app in the list of images.
4. Run the docker container using `docker run -p 8080:8080 -d miner-api/node-web-app` this will start the container
	on port 8080 teh command is stating "docker run on port (-p) 8080 from (:) port 8080 in the container, and push
	it to the background (-d), use the image named (miner-api/node-web-app)
5. This command should return a hash which is the address for the container running. Run a `docker ps` to verify the container is running.
6. Go to 127.0.0.1:8080 and you should see something.

Note: To stop the webapp run `docker stop <name_of_container_from_docker_ps_command>`

Have fun, if you like program please feel free to donate:
ethereum - 0xca04a7ddc565182847246f9e7d305dec14780a1f
bitcoin - 1GHJwcQTiFm8TCUrzs3UnZzYhm6Jq5bxhd
