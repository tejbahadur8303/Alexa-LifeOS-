import type { ContextSnapshot, ContextChange } from '../../mcp-server/src/models/types.js';
export declare class ChangeDetector {
    detectDifferences(previous: ContextSnapshot | null, current: ContextSnapshot): ContextChange[];
}
export declare const changeDetector: ChangeDetector;
