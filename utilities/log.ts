import { Client, ContentType, ContentEncoding } from "@axiomhq/axiom-node";

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

export { axiom, ContentType, ContentEncoding, log };
