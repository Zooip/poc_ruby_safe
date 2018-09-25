<template>
  <div id="app">
    <h1>POC Deterministic RSA key pair generation</h1>
    <div>
      Password :
      <input v-model="password">
    </div>
    <div>
      Challenge :
      <input v-model="challenge">
    </div>
    <div>
      <h3>Random Salt</h3>
      {{encodedSalt}}
    </div>
    <div>
      <h3>RSA Public key</h3>
      {{publicKeyPem}}
    </div>
    <div>
      <h3>RSA Private key</h3>
      {{privateKeyPem}}
    </div>
    <div>
      <h3>Challenge Signature</h3>
      {{encodedSignature}}
    </div>
    <div>
      <h3>Random AES-256 Master key</h3>
      {{encodedMasterKey}}
    </div>
    <div>
      <h3>Encrypted Master key</h3>
      {{encodedEncryptedMasterKey}}
    </div>
    <div>
      <h3>Decrypted Master key</h3>
      {{encodedDecryptedMasterKey}}
    </div>
  </div>
</template>

<script>

  import forge from "node-forge"
  import AuthSessionManager from './crypto/auth_session_manager'

  console.log(forge);

  export default {
    data: function () {
      console.log("App Component :",this);
      return {
        password: "SomePassword",
        salt: forge.random.getBytesSync(64),
        challenge: "Sign me !",
        initialisationVector: forge.random.getBytesSync(32)
      }
    },
    computed: {
      encodedSalt(){
        return forge.util.bytesToHex(this.salt)
      },
      authSessionManager(){
        return new AuthSessionManager(this.password, this.salt, this.challenge, this.initialisationVector);
      }
    },
    asyncComputed:{
      publicKeyPem: function(){
        return this.authSessionManager.keypairPromise().then((keypair) => (forge.pki.publicKeyToPem(keypair.publicKey)),(reason => (console.log(reason))))
      },
      privateKeyPem: function(){
        return this.authSessionManager.keypairPromise().then((keypair) => (forge.pki.privateKeyToPem(keypair.privateKey)),(reason => (console.log(reason))))
      },
      encodedSignature(){
        return this.authSessionManager.signaturePromise().then((signBytes) => (forge.util.bytesToHex(signBytes)),(reason => (console.log(reason))))
      },
      encodedMasterKey(){
        return this.authSessionManager.masterKeyPromise().then((signBytes) => (forge.util.bytesToHex(signBytes)),(reason => (console.log(reason))))
      },
      encodedEncryptedMasterKey(){
        return this.authSessionManager.encryptedMasterKeyPromise().then((signBytes) => (forge.util.bytesToHex(signBytes)),(reason => (console.log(reason))))
      },
      encodedDecryptedMasterKey(){
        return Promise.all([this.authSessionManager.keypairPromise(), this.authSessionManager.encryptedMasterKeyPromise()]).then(function (values) {
          let [keypair, encrypted] = values;
          return forge.util.bytesToHex(keypair.privateKey.decrypt(encrypted, 'RSA-OAEP', {
            md: forge.md.sha256.create()
          }));
        });
      }
    },
    // watch: {
    //   password: function(val){
    //     let _this=this;
    //     crypto.passwordToRsaKeyPairPromise(val, this.salt).then(function(keypair){
    //       console.log("set data !");
    //       console.log(keypair);
    //       _this.privateKey=keypair.privateKey;
    //       _this.publicKey=keypair.publicKey;
    //     })
    //   }
    // }
}
</script>

<style scoped>
div {
  word-wrap:break-word;
}
</style>

