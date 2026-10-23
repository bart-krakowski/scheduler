//#region src/validation/dependency/shift.d.ts
type DependencyType = 'FS' | 'SS' | 'FF' | 'SF';
interface DependencyLink {
  id: string;
  type: DependencyType;
  lag?: number;
}
//#endregion
export { DependencyLink, DependencyType };
//# sourceMappingURL=shift.d.cts.map