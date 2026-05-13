declare global {
  const d3: any;
  const bootstrap: any;
  const Vue: any;

  interface Window {
    jspdf?: any;
    normalTree?: any;
    circleTree?: any;
    unrootedTree?: any;
    __tvbot_node_style_api?: any;
    __tvbot_export_prep_worker?: Worker;
    __tvbot_export_prep_seq?: number;
    openWorkspaceModal?: any;
    selectWorkspaceTree?: any;
  }
}

export {};
