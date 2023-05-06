const { Client, ContentType, ContentEncoding } = require("@axiomhq/axiom-node");
//require("isomorphic-fetch");

const axiom = new Client({
    token: process.env.AXIOM_TOKEN,
    orgId: process.env.AXIOM_ORG_ID,
});

async function log(type, payload) {
    try {
        await axiom.ingestEvents(type, payload);
    } catch (err) {
        console.error("Axiom communications failure:\n", err);
    }
}

module.exports = {
    axiom,
    ContentType,
    ContentEncoding,
    log,
};
