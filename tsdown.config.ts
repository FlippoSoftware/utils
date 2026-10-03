import { defineConfig } from 'tsdown';

export default defineConfig({
    entry: {
        index: 'src/index.ts',
        clamp: 'src/clamp.ts',
        areArraysEqual: 'src/areArraysEqual.ts',
        contains: 'src/contains.ts',
        createEventEmitter: 'src/createEventEmitter.ts',
        detectBrowser: 'src/detectBrowser.ts',
        formatNumber: 'src/formatNumber.ts',
        getPseudoElementBounds: 'src/getPseudoElementBounds.ts',
        getTarget: 'src/getTarget.ts',
        isElementDisabled: 'src/isElementDisabled.ts',
        isOverflowElement: 'src/isOverflowElement.ts',
        noop: 'src/noop.ts',
        owner: 'src/owner.ts',
        randomId: 'src/randomId.ts',
        set: 'src/set.ts'
    },
    format: ['esm', 'cjs'],
    dts: true,
    clean: true,
    platform: 'neutral',
    exports: true
});
