import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

let clientPromise = null;
let cachedTools = null;

const initClient = async () => {
    const sleeperMcpEntry = require.resolve('sleeper-mcp');
    const transport = new StdioClientTransport({
        command: process.execPath,
        args: [sleeperMcpEntry],
        stderr: 'pipe',
    });
    const client = new Client(
        { name: 'league-page-assistant', version: '1.0.0' },
        { capabilities: {} }
    );
    await client.connect(transport);
    const { tools } = await client.listTools();
    cachedTools = tools;
    return client;
};

export const getMcpClient = () => {
    if (!clientPromise) {
        clientPromise = initClient().catch((err) => {
            clientPromise = null;
            throw err;
        });
    }
    return clientPromise;
};

export const getMcpTools = async () => {
    if (cachedTools) return cachedTools;
    await getMcpClient();
    return cachedTools ?? [];
};

export const callMcpTool = async (name, args) => {
    let client = await getMcpClient();
    try {
        return await client.callTool({ name, arguments: args });
    } catch (err) {
        // Try once more with a fresh connection — child may have died.
        clientPromise = null;
        cachedTools = null;
        client = await getMcpClient();
        return client.callTool({ name, arguments: args });
    }
};
