import { resolveApprovalOverGateway } from "NexisClaw/plugin-sdk/approval-gateway-runtime";
import type { ExecApprovalReplyDecision } from "NexisClaw/plugin-sdk/approval-runtime";
import type { NexisClawConfig } from "NexisClaw/plugin-sdk/config-contracts";
import { isApprovalNotFoundError } from "NexisClaw/plugin-sdk/error-runtime";

export { isApprovalNotFoundError };

export async function resolveMatrixApproval(params: {
  cfg: NexisClawConfig;
  approvalId: string;
  decision: ExecApprovalReplyDecision;
  senderId?: string | null;
  gatewayUrl?: string;
}): Promise<void> {
  await resolveApprovalOverGateway({
    cfg: params.cfg,
    approvalId: params.approvalId,
    decision: params.decision,
    senderId: params.senderId,
    gatewayUrl: params.gatewayUrl,
    clientDisplayName: `Matrix approval (${params.senderId?.trim() || "unknown"})`,
  });
}
