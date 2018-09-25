import forge from 'node-forge'
import PasswordDerivator from './password_derivator'
import DeterministicRsaKeyPairGenerator
  from './deterministic_rsa_key_pair_generator'

class AuthSessionManager {

  constructor(password, salt, challenge, passwordDerivationParams = {}, rsaKeyPairGeneratorParams = {}) {
    this.password = password;
    this.salt = salt;
    this.challenge = challenge;
    this.passwordDerivationParams = passwordDerivationParams;
    this.rsaKeyPairGeneratorParams = rsaKeyPairGeneratorParams;

    this._keypairPromise = null;
    this._signaturePromise = null;
  }

  keypairPromise() {
    let {passwordDerivationParams, rsaKeyPairGeneratorParams, password, salt} = this
    if (this._keypairPromise) {
      return this._keypairPromise
    }
    ;
    console.log("Set keypairPromise");
    this._keypairPromise = new Promise(function (resolve, _reject) {
      console.time("generateKeyPair");
      let kd = new PasswordDerivator(passwordDerivationParams);
      let rsaGen = new DeterministicRsaKeyPairGenerator(rsaKeyPairGeneratorParams);

      kd.getKey(password, salt, 512, function (seed) {
        rsaGen.generateKeyPair(seed, function (keypair) {
          console.log("resolve Promise with :", keypair);
          console.timeEnd("generateKeyPair");
          resolve(keypair);
        })
      });

    });
    return this._keypairPromise;
  }

  signaturePromise() {
    let {challenge} = this;
    if (this._signaturePromise) {
      return this._signaturePromise
    }
    this._signaturePromise = this.keypairPromise().then(function (keypair) {
      var md = forge.md.sha256.create();
      md.update(challenge, 'utf8');
      console.log("Sha1: ", md);

      return new Promise(function (resolve, reject) {
        console.time("signing");
        console.log("Start Signing");
        let s = keypair.privateKey.sign(md);
        console.timeEnd("signing");

        resolve(s);
      });
    }, function (reason) {
      console.log(reason);
    });
    return this._signaturePromise;
  }

}

export default AuthSessionManager;