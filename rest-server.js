const fastify = require("fastify")({ logger: false });

const start = async (client) => {
    fastify.post("/reminders", async (request) => {
        console.log(
            request +
                "\n\n\n------------------------------------------------------------------------"
        );
        console.log(request.headers);
        if (
            request.headers["upstash-signature"] !==
            process.env.UPSTASH_SIGNATURE
        ) {
            return "Invalid signature.";
        }

        const { uid, content } = request.body;
        const user = await client.users.fetch(uid);
        await user.send(content);
        return "Acknowledged.";
    });

    try {
        await fastify.listen({ host: "0.0.0.0", port: process.env.PORT });
        console.log("Listening on: " + process.env.PORT);
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

module.exports = {
    start,
};
