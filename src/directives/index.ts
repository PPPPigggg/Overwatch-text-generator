import type { Directive, App } from "vue"
const modules = import.meta.glob(["./**/*.ts", "!./index.ts"], { eager: true })

interface IDirective {
  name: string
  directive: Directive
}

export default {
  install(app: App) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for (const [_, file] of Object.entries(modules)) {
      // @ts-expect-error
      const vFile = file.default as unknown as IDirective
      const vName = vFile.name
      const vDirective = vFile.directive
      app.directive(vName, vDirective)
    }
  },
}
