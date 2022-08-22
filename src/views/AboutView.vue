<template>
  <div class="about">
    <h1>This is an about page</h1>
  </div>
</template>
<script>
  export default({
    data() {
      return {
        name: '张三'
      }
    },
    mounted() {
      console.log("AboutView1")
      console.log("AboutView2")
      console.log("AboutView3")
      console.log("AboutView4")
    },
    methods: {

    }
  })
</script>