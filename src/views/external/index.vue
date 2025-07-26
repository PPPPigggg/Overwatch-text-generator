<script lang="ts" setup>
import { IFramePage } from "@/components/iframe-page"
const route = useRoute()

const externalUrl = route.query.url as string
</script>

<template>
  <IFramePage :src="externalUrl" />
</template>

<style lang="scss" scoped></style>
