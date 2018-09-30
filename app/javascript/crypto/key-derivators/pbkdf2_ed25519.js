import forge from 'node-forge'
import PasswordDerivator from './password-derivator'
import KeypairWorker from "./rsa_keypair_generator.worker";
import PromiseWorker from "promise-worker";

class Pbkdf2Ed25519 extends PasswordDerivator {

  keypairPromise() {
    let _this=this;
    console.log(_this);
    return _this.memoise("keypairPromise",()=>{
      let {password,params} = _this;

      return new Promise((resolve) => {
        let {encodedSalt, iterations, messageDigestAlgorithm} = params;
        let salt = forge.util.decode64(encodedSalt);
        let hash = forge.pkcs5.pbkdf2(password, salt, iterations, 32, messageDigestAlgorithm);

        resolve(forge.pki.ed25519.generateKeyPair({
          seed: hash
        }));
      })
    })
  }

  encodedChallengeSignaturePromise(challenge) {
    let _this = this;
    return _this.keypairPromise().then((keypair)=>{

      let md = forge.md.sha256.create();
      md.update(challenge.value, 'utf8');
      let signature = forge.pki.ed25519.sign({
        md: md,
        privateKey: keypair.privateKey
      });

      let encodedSignature = signature.toString('base64');
      _this.debugOutput = {
        keypair:   {
          pubKey64:   keypair.publicKey.toString('base64'),
          privKey64: keypair.privateKey.toString('base64'),
        },
        signature: {
          value:   signature,
          encoded: encodedSignature
        }
      };

      console.log("AuthSessionManager debug output : ", _this.debugOutput);
      return encodedSignature;
    })
  }
}

export default Pbkdf2Ed25519