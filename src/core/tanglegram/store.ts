import type { ConnectionStyle, TanglegramConnection, TanglegramTarget } from "./types";

export type TanglegramStoreState = {
  connections: TanglegramConnection[];
  selectedConnectionIndex: number | null;
  defaultStyle: ConnectionStyle;
};

export const createTanglegramStore = (initial?: Partial<TanglegramStoreState>) => {
  const state: TanglegramStoreState = {
    connections: initial?.connections ?? [],
    selectedConnectionIndex: initial?.selectedConnectionIndex ?? null,
    defaultStyle: initial?.defaultStyle ?? { color: "#2563eb", width: 2, opacity: 0.7 },
  };

  const connectionExists = (leftKey: string, rightKey: string): boolean => {
    return state.connections.some((c) => c.left.key === leftKey && c.right.key === rightKey);
  };

  const setConnections = (connections: TanglegramConnection[]) => {
    state.connections = connections;
    if (state.selectedConnectionIndex != null && state.selectedConnectionIndex >= state.connections.length) {
      state.selectedConnectionIndex = state.connections.length > 0 ? state.connections.length - 1 : null;
    }
  };

  const clear = () => setConnections([]);

  const select = (index: number | null) => {
    if (index == null) {
      state.selectedConnectionIndex = null;
      return;
    }
    state.selectedConnectionIndex = index >= 0 && index < state.connections.length ? index : null;
  };

  const removeAt = (index: number) => {
    if (index < 0 || index >= state.connections.length) return null;
    const removed = state.connections[index];
    state.connections.splice(index, 1);
    if (state.selectedConnectionIndex === index) {
      state.selectedConnectionIndex = null;
    } else if (state.selectedConnectionIndex != null && state.selectedConnectionIndex > index) {
      state.selectedConnectionIndex -= 1;
    }
    return removed;
  };

  const addConnection = (left: TanglegramTarget, right: TanglegramTarget): boolean => {
    if (connectionExists(left.key, right.key)) return false;
    state.connections.push({ left, right, style: { ...state.defaultStyle } });
    state.selectedConnectionIndex = state.connections.length - 1;
    return true;
  };

  const updateSelectedStyle = (patch: Partial<ConnectionStyle>) => {
    const idx = state.selectedConnectionIndex;
    if (idx == null) return false;
    const conn = state.connections[idx];
    if (!conn) return false;
    conn.style = { ...conn.style, ...patch };
    return true;
  };

  const setDefaultStyle = (patch: Partial<ConnectionStyle>) => {
    state.defaultStyle = { ...state.defaultStyle, ...patch };
  };

  return {
    state,
    connectionExists,
    setConnections,
    clear,
    select,
    removeAt,
    addConnection,
    updateSelectedStyle,
    setDefaultStyle,
  };
};

