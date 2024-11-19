"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createActor = exports.canisterId = void 0;
Object.defineProperty(exports, "idlFactory", {
  enumerable: true,
  get: function () {
    return _ic_siwe_providerDid.idlFactory;
  }
});
var _agent = require("@dfinity/agent");
var _ic_siwe_providerDid = require("./ic_siwe_provider.did.js");
// Imports and re-exports candid interface

/* CANISTER_ID is replaced by webpack based on node environment
 * Note: canister environment variable will be standardized as
 * process.env.CANISTER_ID_<CANISTER_NAME_UPPERCASE>
 * beginning in dfx 0.15.0
 */
const canisterId = exports.canisterId = process.env.CANISTER_ID_IC_SIWE_PROVIDER;
const createActor = (canisterId, options = {}) => {
  const agent = options.agent || new _agent.HttpAgent({
    ...options.agentOptions
  });
  if (options.agent && options.agentOptions) {
    console.warn("Detected both agent and agentOptions passed to createActor. Ignoring agentOptions and proceeding with the provided agent.");
  }

  // Fetch root key for certificate validation during development
  if (process.env.DFX_NETWORK !== "ic") {
    agent.fetchRootKey().catch(err => {
      console.warn("Unable to fetch root key. Check to ensure that your local replica is running");
      console.error(err);
    });
  }

  // Creates an actor with using the candid interface and the HttpAgent
  return _agent.Actor.createActor(_ic_siwe_providerDid.idlFactory, {
    agent,
    canisterId,
    ...options.actorOptions
  });
};
exports.createActor = createActor;
