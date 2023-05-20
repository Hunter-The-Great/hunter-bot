const fastify = require("fastify")({ logger: false });
const cors = require("@fastify/cors");

const start = async (client) => {
    await fastify.register(cors, {
        origin: "*",
    });

    fastify.post("/reminders", async (request) => {
        if (request.body.key !== process.env.KEY) {
            return "Invalid key.";
        }

        const { uid, content } = request.body;
        const user = await client.users.fetch(uid);
        await user.send(content);
        return "Acknowledged.";
    });

    fastify.post("/message", async (request) => {
        if (request.body.key !== process.env.MESSAGE_KEY) {
            return "Invalid key.";
        }

        const { channelID, message } = request.body;
        console.log("channelID: " + channelID + "\nmessage: " + message);
        //TODO discord stuff
        return "Acknowledged.";
    });

    try {
        fastify.listen({ host: "0.0.0.0", port: process.env.PORT });
        console.log("Listening on: " + process.env.PORT);
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

module.exports = {
    start,
};
