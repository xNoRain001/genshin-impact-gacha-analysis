<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="glossy">
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          @click="leftDrawerOpen = !leftDrawerOpen"
          aria-label="Menu"
          icon="menu"
        />

        <q-toolbar-title>
          抽卡分析
        </q-toolbar-title>

        <div>原神工具箱 v1.0.0</div>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      class="bg-grey-2"
    >
      <q-list>
        <q-item-label header>原神工具箱</q-item-label>
        <q-item clickable tag="a" target="_blank" href="https://quasar.dev">
          <q-item-section avatar>
            <q-icon name="school" />
          </q-item-section>
          <q-item-section>
            <q-item-label>抽卡分析</q-item-label>
            <q-item-label caption>gacha analysis</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <GachaAnalysis />
    </q-page-container>
  </q-layout>
</template>

<script>
import { ref } from 'vue'
import GachaAnalysis from './components/GachaAnalysis.vue'

export default {
  name: 'LayoutDefault',

  components: {
    GachaAnalysis
  },

  setup () {
    return {
      leftDrawerOpen: ref(false)
    }
  }
}
</script>
