import PasswordDerivator from './password-derivator'

import forge from 'node-forge'
import KeypairWorker from 'worker-loader!./rsa_keypair_generator.worker';
import PromiseWorker from 'promise-worker'

class Pbkdf2Rsa extends PasswordDerivator {

  keypairPromise() {
    let _this=this;
    console.log(_this);
    return _this.memoise("keypairPromise",()=>{
      let {password,params} = _this;
      var worker = new KeypairWorker();
      var promiseWorker = new PromiseWorker(worker);

      return promiseWorker.postMessage({password:password,params:params}).then(function (skp) {
        return {
          publicKey: forge.pki.publicKeyFromPem(skp.publicKeyPem),
          privateKey: forge.pki.privateKeyFromPem(skp.privateKeyPem)
        }
      })
    })
  }

  encodedChallengeSignaturePromise(challenge) {
    let _this = this;

    console.log(_this);
    return new Promise(function (resolve) {
      console.log(_this);
      return _this.keypairPromise(password).then((keypair)=>{
        let md = forge.md[challenge.digestAlgorithm].create();
        md.update(challenge.value, 'utf8');
        let signature = keypair.privateKey.sign(md);
        let encodedSignature = forge.util.encode64(signature);

        _this.debugOutput = {
          keypair:   {
            pubKeyPem:  forge.pki.publicKeyToPem(keypair.publicKey, 100000),
            privKeyPem: forge.pki.privateKeyToPem(keypair.privateKey, 100000)
          },
          signature: {
            value:   signature,
            encoded: encodedSignature
          }
        };

        resolve(encodedSignature);
      })
    })
  }
}
export default Pbkdf2Rsa;
