export type MatrixManagedDeviceInfo = {
  deviceId: string;
  displayName: string | null;
  current: boolean;
};

export type MatrixDeviceHealthSummary = {
  currentDeviceId: string | null;
  staleNexisClawDevices: MatrixManagedDeviceInfo[];
  currentNexisClawDevices: MatrixManagedDeviceInfo[];
};

const NEXISCLAW_DEVICE_NAME_PREFIX = "NexisClaw ";

export function isNexisClawManagedMatrixDevice(displayName: string | null | undefined): boolean {
  return displayName?.startsWith(NEXISCLAW_DEVICE_NAME_PREFIX) === true;
}

export function summarizeMatrixDeviceHealth(
  devices: MatrixManagedDeviceInfo[],
): MatrixDeviceHealthSummary {
  const currentDeviceId = devices.find((device) => device.current)?.deviceId ?? null;
  const openClawDevices = devices.filter((device) =>
    isNexisClawManagedMatrixDevice(device.displayName),
  );
  return {
    currentDeviceId,
    staleNexisClawDevices: openClawDevices.filter((device) => !device.current),
    currentNexisClawDevices: openClawDevices.filter((device) => device.current),
  };
}
