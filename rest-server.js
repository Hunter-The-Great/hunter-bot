const fastify = require("fastify")({ logger: false });

const start = async (client) => {
    fastify.post("/reminders", async (request) => {
        if (request.body.key !== process.env.KEY) {
            return "Invalid key.";
        }

        const { uid, content } = request.body;
        const user = await client.users.fetch(uid);
        await user.send(content);
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
