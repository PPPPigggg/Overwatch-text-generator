import { defineStore } from "pinia"
interface UserState {
  topEmojis: string[] // 收藏的表情列表
  templateTextList: string[] // 模板文本列表
  knowTip: boolean // 是否显示提示
}

export const useUserStore = defineStore("userState", {
  state: (): UserState => ({
    topEmojis: [
      "000000017112",
      "000000018FD4",
      "000000018FD6",
      "000000018FDF",
      "00000002A9FE",
      "00000002C012",
      "00000002DD21",
      "000000038491",
      "000000038492",
      "000000038493",
      "000000038494",
      "000000038495",
      "000000038497",
      "000000038498",
      "000000038499",
      "00000003849A",
      "00000003849B",
      "00000003849C",
      "00000003849D",
      "00000003849F",
      "0000000384A0",
      "0000000384A1",
      "0000000384A2",
      "0000000384C2",
      "0000000385C3",
      "0000000385C4",
      "0000000385C5",
      "0000000385C6",
      "0000000385C7",
      "0000000385C8",
      "0000000385C9",
      "0000000385CA",
      "0000000386FA",
      "0000000386FB",
      "0000000386FC",
      "0000000386FD",
      "0000000386FE",
      "0000000386FF",
      "000000038700",
      "000000038701",
      "00000003A4DF",
      "00000003A4E0",
      "00000003A4E2",
      "00000003A4E3",
      "00000003A4E4",
      "00000003A4E5",
      "00000003A4E6",
      "00000003A4E7",
      "00000003A4EA",
      "00000003A4EB",
      "00000003A4EE",
      "0000000402CE",
      "00000004447D",
      "000000045C2E",
      "0000000489CF",
      "0000000515F7",
      "0000000544D3",
      "00000006256A",
      "000000062AD8",
    ],
    templateTextList: [],
    knowTip: false,
  }),
  actions: {
    changeEmojis(emojisId: string) {
      if (this.topEmojis.includes(emojisId)) {
        this.topEmojis = this.topEmojis.filter((id) => id !== emojisId)
      } else {
        this.topEmojis.push(emojisId)
      }
    },
    addEmoji(emojiId: string) {
      if (!this.topEmojis.includes(emojiId)) {
        this.topEmojis.push(emojiId)
      }
    },
    removeEmoji(emojiId: string) {
      this.topEmojis = this.topEmojis.filter((id) => id !== emojiId)
    },

    changeTemlateText(text: string) {
      if (this.templateTextList.includes(text)) {
        this.templateTextList = this.templateTextList.filter((t) => t !== text)
      } else {
        this.templateTextList.push(text)
      }
    },
    addTemplateText(text: string) {
      if (!this.templateTextList.includes(text)) {
        this.templateTextList.push(text)
      }
    },
    removeTemplateText(text: string) {
      this.templateTextList = this.templateTextList.filter((t) => t !== text)
    },

    iKnowTip() {
      this.knowTip = true
    },
  },
  /* 持久化存储 */
  persist: true,
})
