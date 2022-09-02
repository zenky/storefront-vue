import dts from 'rollup-plugin-dts';

export default [
  {
    input: 'build/src/index.js',
    output: [
      {
        format: 'esm',
        dir: 'dist/esm',
      },
      {
        format: 'cjs',
        dir: 'dist/cjs',
      },
    ],
    external: [
      '@zenky/api',
      '@zenky/events',
      'date-fns',
      'lodash-es',
      'pinia',
      'pusher-js',
      'vue',
    ],
  },
  {
    input: './build/dts/src/index.d.ts',
    output: [{ file: 'dist/zenky.d.ts', format: 'es' }],
    plugins: [dts()],
  },
];
