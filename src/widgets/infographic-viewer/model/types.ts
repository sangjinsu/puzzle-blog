export interface SequenceActor {
  id: string;
  label: string;
}

export interface SequenceMessage {
  from: string;
  to: string;
  label: string;
  isResponse?: boolean;
  isSelf?: boolean;
}

export interface FlowNode {
  id: string;
  label: string;
  type: 'process' | 'decision' | 'start' | 'end';
}

export interface FlowEdge {
  from: string;
  to: string;
  label?: string;
}

export interface ERTable {
  name: string;
  columns: { name: string; type: string; pk?: boolean; fk?: boolean }[];
}

export interface ERRelation {
  from: string;
  to: string;
  type: '1:1' | '1:N' | 'N:M';
  label?: string;
}

export interface StateNode {
  id: string;
  label: string;
  isInitial?: boolean;
  isFinal?: boolean;
}

export interface StateTransition {
  from: string;
  to: string;
  label: string;
}

export interface TimelineEvent {
  time: string;
  label: string;
  description?: string;
  color?: string;
}

export interface ComparisonFeature {
  name: string;
  values: Record<string, string | boolean>;
}
