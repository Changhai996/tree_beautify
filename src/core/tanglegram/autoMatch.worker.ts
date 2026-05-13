import { autoMatchPairs } from "./autoMatch";
import type { AutoMatchTargetLite, AutoMatchOptions } from "./autoMatch";

type RequestMessage = {
  id: string;
  left: AutoMatchTargetLite[];
  right: AutoMatchTargetLite[];
  options?: AutoMatchOptions;
};

type ResponseMessage = {
  id: string;
  pairs: { leftKey: string; rightKey: string }[];
};

self.onmessage = (event: MessageEvent<RequestMessage>) => {
  const msg = event.data;
  const pairs = autoMatchPairs(msg.left, msg.right, msg.options);
  const resp: ResponseMessage = { id: msg.id, pairs };
  self.postMessage(resp);
};

