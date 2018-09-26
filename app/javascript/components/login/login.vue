<template>
    <div>
        <div id="login-wrapper">
            <form-wizard
                    title="Login"
                    subtitle="PoC Challenge-Response Authentication"
                    color="#2f4b83"
                    error-color="#2f4b83"
                    @on-loading="setLoading">
                <tab-content
                        title="Identification"
                        icon="ti-user"
                        transition="fade"
                        :before-change="afterIdentTab">
                    <vue-form-generator
                            :schema="schemaIdentifier"
                            :model="credentials"
                            ref="identTabForm"/>
                </tab-content>
                <tab-content title="Authentification"
                             icon="ti-lock"
                             :before-change="afterAuthentTab">
                    <vue-form-generator
                            :schema="schemaPassword"
                            :model="credentials"
                            ref="authentTabForm"/>
                </tab-content>
            </form-wizard>
        </div>
        <div class="loader" v-if="isLoading"></div>
        <login-debugger
                :keyDerivationOptions="keyDerivationOptions"
                :challenge="challenge"
                :keypairRsa="keyPair"
                :encodedSignature="encodedSignature"/>
    </div>
</template>

<script>
  import {FormWizard, TabContent} from 'vue-form-wizard'
  import VueFormGenerator from "vue-form-generator";

  import LoginDebugger from './login-debugger'

  import api from "../../api"

  import * as schemas from "./login-schemas"

  import forge from 'node-forge'

  import 'vue-form-wizard/dist/vue-form-wizard.min.css'
  import "vue-form-generator/dist/vfg.css"

  import AuthSessionManager from '../../crypto/auth_session_manager'

  export default {
    name: "login",
    components: {
      FormWizard,
      TabContent,
      LoginDebugger,
      "vue-form-generator": VueFormGenerator.component
    },
    data: function () {
      return {
        credentials: {
          identifier: null,
          password:   null
        },
        isLoading: false,
        challenge: {
          encoded64: null,
        },
        keyDerivationOptions: {
          encodedSalt:    null,
          algorithm:      null,
          iterations:     null,
          message_digest: null
        },
        encodedSignature: null,
        keyPair: null,
        ...schemas
      }
    },
    computed:{
      salt(){return this.keyDerivationOptions.encodedSalt&&forge.util.decode64(this.keyDerivationOptions.encodedSalt)},
      challengeBytes(){return this.challenge.encoded64&&forge.util.decode64(this.challenge.encoded64)},
    },
    methods:{
      setLoading(v){this.isLoading=v},
      validateIdentTab(){return this.$refs.identTabForm.validate()},
      validateAuthentTab(){return this.$refs.authentTabForm.validate()},
      afterIdentTab(){
        if(!this.validateIdentTab()){return false}
        return api.login.retrieveAuthOptionsFor(this.credentials.id).then((response)=>{
          this.keyDerivationOptions=response.keyDerivationOption;
          this.challenge=response.challenge;
          return true
        })
      },
      afterAuthentTab(){
        if(!this.validateAuthentTab()){return false}
        let _this = this;
        let authManager = new AuthSessionManager(this.credentials.password, this.salt, this.challengeBytes);
        authManager.keypairPromise().then((keypair) => {
          _this.keyPair=keypair;
        });

        return authManager.signaturePromise().then((signBytes) => {
            _this.encodedSignature = forge.util.encode64(signBytes);
            return true
        });
      }
    }
  }
</script>

<style scoped>
    #login-wrapper {
        max-width: 500px;
        margin: auto;
        border: solid #2f4b83 10px;
    }

    .fade-enter-active, .fade-leave-active {
        transition: opacity .5s;
    }

    .fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */
    {
        opacity: 0;
    }

    /* This is a css loader. It's not related to vue-form-wizard */
    .loader,
    .loader:after {
        border-radius: 50%;
        width: 10em;
        height: 10em;
    }
    .loader {
        margin: 60px auto;
        font-size: 10px;
        position: relative;
        text-indent: -9999em;
        border-top: 1.1em solid rgba(255, 255, 255, 0.2);
        border-right: 1.1em solid rgba(255, 255, 255, 0.2);
        border-bottom: 1.1em solid rgba(255, 255, 255, 0.2);
        border-left: 1.1em solid #e74c3c;
        -webkit-transform: translateZ(0);
        -ms-transform: translateZ(0);
        transform: translateZ(0);
        -webkit-animation: load8 1.1s infinite linear;
        animation: load8 1.1s infinite linear;
    }
    @-webkit-keyframes load8 {
        0% {
            -webkit-transform: rotate(0deg);
            transform: rotate(0deg);
        }
        100% {
            -webkit-transform: rotate(360deg);
            transform: rotate(360deg);
        }
    }
    @keyframes load8 {
        0% {
            -webkit-transform: rotate(0deg);
            transform: rotate(0deg);
        }
        100% {
            -webkit-transform: rotate(360deg);
            transform: rotate(360deg);
        }
    }
</style>