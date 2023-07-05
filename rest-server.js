const fastify = require("fastify")({ logger: false });
const cors = require("@fastify/cors");

const start = async (client) => {
    await fastify.register(cors, {
        origin: "*",
    });

    fastify.post("/reminders", async (request) => {
        //* -------------------------------------------------------------------------------------------- /reminders
        if (request.body.key !== process.env.KEY) {
            return "Invalid key.";
        }

        const { uid, content } = request.body;
        const user = await client.users.fetch(uid);
        await user.send(content);
        return "Acknowledged.";
    });

    fastify.post("/message", async (request) => {
        //* -------------------------------------------------------------------------------------------- /message
        if (request.body.key !== process.env.MESSAGE_KEY) {
            console.log("Invalid key for /message.");
            return "Invalid key.";
        }
        const { channelID, message } = request.body;

        const channel = await client.channels.fetch(channelID);
        await channel.send(message);
        return "Acknowledged.";
    });

    fastify.post("/gh/:uid", async (request) => {
        //* -------------------------------------------------------------------------------------------- /gh
        const { uid } = request.params;
        console.log(request);
    });

    /* In case Drew ever makes that plugin
    fastify.post("/mc", async (request) => {
        // -------------------------------------------------------------------------------------------- /mc
        if (request.body.key !== process.env.MC_KEY) {
            console.log("Invalid key for /mc.");
            return "Invalid key.";
        }

        const channel = await client.channels.fetch(process.env.MC_CHANNEL_ID);
        if (request.body.type === "join") {
            // -------------------------------------------------------------------------------------------- join
            await channel.send(
                `**${request.body.username}** joined the server.`
            );
        } else if (request.body.type === "leave") {
            // -------------------------------------------------------------------------------------------- leave
            await channel.send(`**${request.body.username}** left the server.`);
        }

        return "Acknowledged.";
    });
    */

    //* running the server
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
