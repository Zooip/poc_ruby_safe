import forge from 'node-forge'
import KeypairWorker from 'worker-loader!./rsa_keypair_generator.worker';
import PromiseWorker from 'promise-worker'
import Worker from "./rsa_keypair_generator.worker";


class Pbkdf2Rsa {
  constructor(params) {
    const _this=this;
    this.params = {};
    const keys = [
      "encodedSalt",
      "iterations",
      "messageDigestAlgorithm",
      "hashSize",
      "keySize",
      "primeGeneratorAlgorithm"
    ];

    keys.forEach(function (key) {
      _this.params[key] = params[key]
    })
  }

  buildHash(password) {
    let {encodedSalt, iterations, messageDigestAlgorithm, hashSize} = this.params;
    let salt = forge.util.decode64(encodedSalt);
    return forge.pkcs5.pbkdf2(password, salt, iterations, hashSize, messageDigestAlgorithm);
  }

  buildKeypairPromise(hash) {
    let {params} = this;
    var worker = new KeypairWorker();
    var promiseWorker = new PromiseWorker(worker);

    return promiseWorker.postMessage({seed:hash,params:params}).then(function (skp) {
      return {
        publicKey: forge.pki.publicKeyFromPem(skp.publicKeyPem),
        privateKey: forge.pki.privateKeyFromPem(skp.privateKeyPem)
      }
    }).catch(function (error) {
      console.log("something went wrong ...", error)
    });
  }

  signWithKeypair(keypair, challenge) {
    let md = forge.md.sha256.create();
    md.update(challenge.value, 'utf8');
    return keypair.privateKey.sign(md)
  }

  encodedSignaturePromise(password, challenge) {
    let _this = this;
    return new Promise(function (resolve, reject) {
      console.time("buildHash");
      let hash = _this.buildHash(password);
      console.timeEnd("buildHash");

      console.time("buildKeypair");
      return _this.buildKeypairPromise(hash).then((keypair)=>{
        console.timeEnd("buildKeypair");

        console.time("signWithKeypair");
        let signature = _this.signWithKeypair(keypair, challenge);
        console.timeEnd("signWithKeypair");

        let encodedSignature = forge.util.encode64(signature);
        _this.debugOutput = {
          hash:      {
            value:   hash,
            encoded: forge.util.encode64(hash)
          },
          keypair:   {
            pubKeyPem:  forge.pki.publicKeyToPem(keypair.publicKey, 100000),
            privKeyPem: forge.pki.privateKeyToPem(keypair.privateKey, 100000)
          },
          signature: {
            value:   signature,
            encoded: encodedSignature
          }
        };

        console.log("AuthSessionManager debug output : ", _this.debugOutput);
        resolve(encodedSignature);
      })
    })
  }
}
export default Pbkdf2Rsa;
