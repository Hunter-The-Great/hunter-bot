const fastify = require("fastify")({ logger: false });
const { Receiver } = require("@upstash/qstash");

const start = async (client) => {
    fastify.post("/reminders", async (request) => {
        const receiver = new Receiver({
            currentSigningKey: process.env.UPSTASH_SIGNING_KEY,
        });

        const isValid = await receiver.verify({
            signature: request.headers["upstash-signature"],
            body: request.body,
            url: `https://${request.requestContext.domainName}`,
        });

        if (!isValid) {
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
