<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>

  import Login from "./components/login/login.vue"
  import Registration from "./components/registration/registration"

  export default {
    components: {
      Login,
      Registration
    },
  }
</script>

<style scoped>
  div {
    word-wrap: break-word;
  }
</style>

