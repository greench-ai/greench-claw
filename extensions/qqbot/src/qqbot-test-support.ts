import type { NexisClawConfig } from "NexisClaw/plugin-sdk/config-contracts";

export function makeQqbotSecretRefConfig(): NexisClawConfig {
  return {
    channels: {
      qqbot: {
        appId: "123456",
        clientSecret: {
          source: "env",
          provider: "default",
          id: "QQBOT_CLIENT_SECRET",
        },
      },
    },
  } as NexisClawConfig;
}

export function makeQqbotDefaultAccountConfig(): NexisClawConfig {
  return {
    channels: {
      qqbot: {
        defaultAccount: "bot2",
        accounts: {
          bot2: { appId: "123456" },
        },
      },
    },
  } as NexisClawConfig;
}
