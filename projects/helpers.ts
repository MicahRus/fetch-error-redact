import {TextFile, javascript, typescript} from 'projen'

export const eslintRules = {
  'curly': [
    'error',
    'multi',
    'consistent',
  ],
  'semi': [
    'error',
    'never',
  ],
  'object-curly-spacing': 'error',
  'nonblock-statement-body-position': ['error', 'below'],
  'check-file/filename-naming-convention': [
    'error',
    {
      '**/*.{js,ts}': 'CAMEL_CASE',
    },
    {
      ignoreMiddleExtensions: true,
    },
  ],
  'check-file/folder-naming-convention': [
    'error',
    {
      'src/**/': 'CAMEL_CASE',
      'test*/**/': 'CAMEL_CASE',
      'stack*/**/': 'CAMEL_CASE',
    },
  ],
}

const eslintOverrides = {
  files: [
    './projects/helpers.ts',
  ],
  rules: {
    'import/no-extraneous-dependencies': 'off',
  },
}

const eslintOptions = {
  rules: eslintRules,
  plugins: ['check-file'],
  packages: ['eslint-plugin-check-file'],
  overrides: eslintOverrides,
}

export function addEslint(project: typescript.TypeScriptProject): void {
  project.addDevDeps(...eslintOptions.packages)
  project.eslint?.addRules(eslintOptions.rules)
  project.eslint?.addOverride(eslintOptions.overrides)
  project.eslint?.addPlugins(...eslintOptions.plugins)
}

export function addNvmrc(project: javascript.NodeProject, nodeVersion: string): void {
  new TextFile(project, '.nvmrc', {
    lines: [nodeVersion],
  })
}
