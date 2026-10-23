//#region src/kernel/history.d.ts
interface Identified {
  id: string;
}
type InvertibleOp<E extends Identified> = {
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
//#endregion
export { Identified, InvertibleOp };
//# sourceMappingURL=history.d.cts.map