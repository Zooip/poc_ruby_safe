<template>
  <vue-form-generator
          :schema="registrationSchema"
          :model="model"
          />
</template>

<script>

  import registrationSchema from './registration-schemas'
  import VueFormGenerator from "vue-form-generator";

  export default {
    name: "registration",
    components: {
      "vue-form-generator": VueFormGenerator.component
    },
    data: function(){
      return {
        model:{
          identifier: null,
          password: null,
          name: null,
          algorithm: "pbkdf2/rsa",
          algorithmParams: {
            salt: null,
            iterations: 3000,
            message_digest_algorithm: 'sha256',
            hash_size: 1024,
            key_Size: 2048,
            prime_generator_algorithm: 'PRIMEINC',
          }
        },
        ...registrationSchema
      }
    }
  }
</script>

<style scoped>

</style>