//#region src/kernel/types.d.ts
type KernelDateInput = string | Date | number;
interface KernelEvent {
  id: string;
  start: KernelDateInput;
  end: KernelDateInput;
  [key: string]: unknown;
}
interface Viewport {
  start: string;
  end: string;
}
interface KernelConfig {
  [key: string]: unknown;
}
interface IntentOp {
  kind: 'intent';
  intent: string;
  payload: unknown;
}
type ConcreteWriteOp<E extends KernelEvent> = {
  kind: 'add';
  event: E;
} | {
  kind: 'update';
  id: string;
  before: E;
  after: E;
} | {
  kind: 'remove';
  id: string;
  event: E;
};
type WriteOp<E extends KernelEvent> = ConcreteWriteOp<E> | IntentOp;
interface WriteBatch<E extends KernelEvent> {
  reason: string;
  ops: Array<WriteOp<E>>;
  replay?: boolean;
}
interface Conflict {
  code: string;
  message: string;
  eventIds: Array<string>;
  [key: string]: unknown;
}
type WriteResult<E extends KernelEvent> = {
  status: 'committed';
  batch: WriteBatch<E>;
} | {
  status: 'rejected';
  conflicts: Array<Conflict>;
};
interface ProjectionCtx<E extends KernelEvent> {
  events: Array<E>;
  viewport: Viewport;
  config: KernelConfig;
}
interface WriteCtx<E extends KernelEvent> {
  getEvents: () => Array<E>;
  getEvent: (id: string) => E | undefined;
  config: KernelConfig;
}
type ProjectionStage<E extends KernelEvent> = (ctx: ProjectionCtx<E>) => Array<E>;
type TransformStage<E extends KernelEvent> = (batch: WriteBatch<E>, ctx: WriteCtx<E>) => WriteBatch<E>;
type ValidateStage<E extends KernelEvent> = (batch: WriteBatch<E>, ctx: WriteCtx<E>) => Array<Conflict>;
type ProjectionStageName = 'recurrence-expand' | 'clip-to-viewport' | 'filter' | 'layout';
type WriteTransformStageName = 'history-materialize' | 'resize-materialize' | 'recurrence-materialize' | 'schedule' | 'emit';
type WriteValidateStageName = 'availability-validate' | 'constraint-validate' | 'duration-validate' | 'dependency-validate';
type ProjectionModuleStageName = Exclude<ProjectionStageName, 'clip-to-viewport'>;
type Contribution<E extends KernelEvent> = {
  pipeline: 'projection';
  stage: ProjectionModuleStageName;
  priority?: number;
  run: ProjectionStage<E>;
} | {
  pipeline: 'write';
  kind: 'transform';
  stage: WriteTransformStageName;
  priority?: number;
  run: TransformStage<E>;
} | {
  pipeline: 'write';
  kind: 'validate';
  stage: WriteValidateStageName;
  priority?: number;
  run: ValidateStage<E>;
};
type RangeExtender<E extends KernelEvent> = (op: WriteOp<E>, config: KernelConfig) => Viewport | null;
interface ModuleApiCtx<E extends KernelEvent> {
  write: (input: WriteOp<E> | Array<WriteOp<E>>, reason?: string) => WriteResult<E>;
  project: (viewport: Viewport) => Array<E>;
  getEvents: () => Array<E>;
  getEvent: (id: string) => E | undefined;
  config: KernelConfig;
}
interface Module<E extends KernelEvent, TApi = object> {
  name: string;
  contributions: Array<Contribution<E>>;
  requires?: ReadonlyArray<string>;
  getRequiredRange?: RangeExtender<E>;
  api?: (ctx: ModuleApiCtx<E>) => TApi;
}
type ModuleApi<TModule> = TModule extends {
  api?: (...args: Array<never>) => infer TApi;
} ? TApi : object;
//#endregion
export { ConcreteWriteOp, Conflict, Contribution, IntentOp, KernelConfig, KernelDateInput, KernelEvent, Module, ModuleApi, ModuleApiCtx, ProjectionCtx, ProjectionModuleStageName, ProjectionStage, ProjectionStageName, RangeExtender, TransformStage, ValidateStage, Viewport, WriteBatch, WriteCtx, WriteOp, WriteResult, WriteTransformStageName, WriteValidateStageName };
//# sourceMappingURL=types.d.cts.map