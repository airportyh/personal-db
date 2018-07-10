<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  margin: auto;
  max-width: 780px;
}
body {
  padding: 30px;
}

label {
  font-weight: bold;
}

.link-like {
  color: #666;
  text-decoration: underline;
  cursor: pointer;
}

.link-like:hover {
  color: black;
}

.nav-link {
  margin-right: 10px;
}

input[type=text], input[type=password], select {
    font-size: 100%;
}
</style>
