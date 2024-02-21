import {javascript, typescript} from 'projen'
import {NodePackageManager} from 'projen/lib/javascript'
import {addEslint, addNvmrc} from './projects/helpers'

const nodeVersion = '20.9.0'

const project = new typescript.TypeScriptAppProject({
  defaultReleaseBranch: 'main',
  name: 'fetch-error-redact',
  description: 'Library to redact sensitive information from Fetch errors. This can be used as an response interceptor for fetch instances, or can be used standalone.',
  projenrcTs: true,
  packageManager: NodePackageManager.PNPM,
  minNodeVersion: nodeVersion,
  releaseToNpm: true,
  release: true,
  publishTasks: true,
  docgen: true,
  majorVersion: 1,
  stale: true,
  authorName: 'Micah Rus',
  repository: 'https://github.com/MicahRus/fetch-error-redact',
  depsUpgradeOptions: {
    workflowOptions: {
      labels: ['auto-approve'],
    },
  },
  tsconfig: {
    compilerOptions: {
      target: 'ES2019',
      lib: ['ES2019'],
    },
  },
  keywords: [
    'typescript',
    'projen',
    'mondo',
    'fetch',
    'error',
    'redact',
  ],
  npmAccess: javascript.NpmAccess.PUBLIC,
  // deps: [],
  // devDeps: [],
})

addNvmrc(project, nodeVersion)
addEslint(project)

project.synth()
