import { typescript } from "projen";
const project = new typescript.TypeScriptAppProject({
  defaultReleaseBranch: "main",
  name: "fetch-error-redact",
  projenrcTs: true,
  

  // deps: [],  
  // description: undefined,
  // devDeps: [],  
  // packageName: undefined,
});
project.synth();
