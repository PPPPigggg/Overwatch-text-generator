import { defineStore } from "pinia"

export const useSettingStore = defineStore("useSettingStore", {
  state: () => ({
    // 当前主题模式
    themeMode: "light" as "light" | "dark",
  }),
  actions: {
    // 切换主题模式

    setTheme(navTheme: "light" | "dark") {
      if (navTheme === "light") {
        document.body.removeAttribute("arco-theme")
        document.documentElement.classList.remove("dark")
        this.themeMode = "light"
      } else {
        document.body.setAttribute("arco-theme", "dark")
        document.documentElement.classList.add("dark")

        this.themeMode = "dark"
      }
    },
  },
  /* 持久化存储 */
  persist: true,
})
