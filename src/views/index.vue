<template>
  <div class="index">
    <Header></Header>
    <router-view ></router-view>
  </div>
</template>
<script>
// @ is an alias to /src
import Header from "@/components/Commonhead"
export default {
  name: 'index',
  components: {
    Header,
  },
  methods:{}
}
</script>