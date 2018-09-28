import forge from 'node-forge'
import passwordDerivatorRef from './key-derivator-ref'

class Pbkdf2Ed25519 {
  constructor(params) {
    const _this=this;
    this.params = {};
    const keys = [
      "encodedSalt",
      "iterations",
      "messageDigestAlgorithm"
    ];

    keys.forEach(function (key) {
      _this.params[key] = params[key]
    })
  }

  encodedSignaturePromise(password, challenge) {
    let _this = this;
    return new Promise(function (resolve, reject) {
      console.time("buildHash");
      let hash = _this.buildHash(password);
      console.timeEnd("buildHash");

      console.time("buildKeypair");
      let keypair = _this.buildKeypair(hash);
      console.timeEnd("buildKeypair");

      console.time("signWithKeypair");
      let signature = _this.signWithKeypair(keypair, challenge);
      console.timeEnd("signWithKeypair");

      let encodedSignature = signature.toString('base64');
      _this.debugOutput = {
        hash:      {
          value:   hash,
          encoded: forge.util.encode64(hash)
        },
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
      resolve(encodedSignature);
    })
  }

  buildHash(password) {
    let {encodedSalt, iterations, messageDigestAlgorithm} = this.params;
    let salt = forge.util.decode64(encodedSalt);
    return forge.pkcs5.pbkdf2(password, salt, iterations, 32, messageDigestAlgorithm);
  }

  buildKeypair(hash) {
    return forge.pki.ed25519.generateKeyPair({
      seed: hash
    });
  }

  signWithKeypair(keypair, challenge){
    let md = forge.md.sha256.create();
    md.update(challenge.value, 'utf8');
    return forge.pki.ed25519.sign({
      md: md,
      privateKey: keypair.privateKey
    });
  }
}

export default Pbkdf2Ed25519