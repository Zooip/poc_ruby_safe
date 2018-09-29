<template>
    <div>
        <div id="login-wrapper" v-bind:class="errorMessage ? 'form-error' : 'form-ok'">
            <form-wizard
                    title="Login"
                    subtitle="PoC Challenge-Response Authentication"
                    color="#2f4b83"
                    error-color="#ae1221"
                    @on-loading="setLoading">
                <tab-content
                        title="Identification"
                        icon="ti-user"
                        transition="fade"
                        :before-change="afterIdentTab">
                    <p>
                      Provide your ID so we can retrieve your key derivation parameters and assign you a challenge.
                    </p>
                    <p>
                        TIP : Use "user1" for RSA signature<br/>
                        Use "user2" for Ed25519 signature (much faster but don't provide encryption)
                    </p>
                    <vue-form-generator
                            :schema="schemaIdentifier"
                            :model="credentials"
                            ref="identTabForm"/>
                </tab-content>
                <tab-content title="Authentification"
                             icon="ti-lock"
                             :before-change="afterAuthentTab">
                    <p>
                        Now provide your password. This way, you can generate a RSA keypair and propose a challenge response.
                    </p>
                    <p>
                        DEBUG : KeyPair may take up to 20 secs to generate ... just wait ...
                    </p>
                    <p>
                        TIP : Use "password" for testing
                    </p>
                    <vue-form-generator
                            :schema="schemaPassword"
                            :model="credentials"
                            ref="authentTabForm"/>
                </tab-content>
            </form-wizard>
            <div class="error-message">{{errorMessage}}</div>
        </div>
        <div class="loader" v-if="isLoading"></div>

        <login-debugger
                :keyDerivator="passwordDerivator"
                :challenge="challenge"
                :authManagerDebugOutput="authManagerDebugOutput"/>
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
        credentials:            {
          identifier: null,
          password:   null
        },
        isLoading:              false,
        errorMessage:           null,
        challenge:              {
          value: null,
        },
        encodedSignature:       null,
        passwordDerivator:      {
          algorithm: null,
          params:    {
            encodedSalt:             null,
            iterations:              null,
            messageDigestAlgorithm:  null,
            hashSize:                null,
            keySize:                 null,
            primeGeneratorAlgorithm: null,
          }
        },
        authManagerDebugOutput: {
          hash:      {
            value:   null,
            encoded: null
          },
          prng:      null,
          keypair:   {
            pubKeyPem:  null,
            privKeyPem: null
          },
          signature: {
            value:   null,
            encoded: null
          }
        },
        ...schemas
      }
    },
    methods:{
      setLoading(v){this.isLoading=v},
      validateIdentTab(){return this.$refs.identTabForm.validate()},
      validateAuthentTab(){return this.$refs.authentTabForm.validate()},
      afterIdentTab(){
        this.errorMessage=null;
        if(!this.validateIdentTab()){return false}
        return api.login.identify(this.credentials.identifier).then((response)=>{
          this.passwordDerivator= response.passwordDerivator;
          this.challenge = response.challenge;
          return true
        },(errorMessage)=>{
          this.errorMessage=errorMessage;
          return false;
        })
      },
      afterAuthentTab() {
        if (!this.validateAuthentTab()) {
          return false
        }
        let _this = this;
        this.errorMessage = null;

        let authManager = new AuthSessionManager(_this.credentials.password, _this.passwordDerivator, _this.challenge);
        console.log("authManager : ", authManager);

        return authManager.encodedSignaturePromise().then(
          (encodedSignature) => {
            _this.authManagerDebugOutput = authManager.signer.debugOutput;

            api.login.authentify({
              identifier:       _this.credentials.identifier,
              encodedSignature: encodedSignature,
              challenge:        _this.challenge.value
            }).then((status) => {
              alert(status);
              return (true)
            }, (errorMessage) => {
              _this.errorMessage = errorMessage;
              return (false)
            })
          },
          (error) => {
            console.log("Error during Sign : ", error);
            return (false)
          }
        ).catch((error) => {
          console.log("Error catched during Sign : ", error);
          return (false)
        })
      }
    }
  }
</script>

<style scoped>

    .error-message{
        font-size: 1.1em;
        text-align: center;
        width: 100%;
        color: #ae1221;
    }

    #login-wrapper {
        max-width: 500px;
        margin: auto;
        border-style: solid;
        border-width: 10px;
        border-color: #2f4b83;

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