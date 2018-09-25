import forge from 'node-forge'
import PasswordDerivator from './password_derivator'
import DeterministicRsaKeyPairGenerator
  from './deterministic_rsa_key_pair_generator'

class AuthSessionManager {

  constructor(password, salt, challenge, initialisationVector, passwordDerivationParams = {}, rsaKeyPairGeneratorParams = {}) {
    this.password = password;
    this.salt = salt;
    this.challenge = challenge;
    this.initialisationVector=initialisationVector;
    this.passwordDerivationParams = passwordDerivationParams;
    this.rsaKeyPairGeneratorParams = rsaKeyPairGeneratorParams;
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

  masterKeyPromise(){
    if (this._masterKeyPromise) {
      return this._masterKeyPromise
    }

    this._masterKeyPromise=new Promise(function(resolve){
      resolve(forge.random.getBytesSync(32));
    });

    return this._masterKeyPromise
  }

  encryptedMasterKeyPromise(){
    if (this._encryptedMasterKeyPromise) {
      return this._encryptedMasterKeyPromise
    }

    this._encryptedMasterKeyPromise=Promise.all([this.masterKeyPromise(), this.keypairPromise()]).then(function(values){
      let [masterKey, keypair] = values;

      return new Promise(function (resolve) {
        resolve(keypair.publicKey.encrypt(masterKey,'RSA-OAEP', {
          md: forge.md.sha256.create()
        }));
      });
    }, (reason) => (console.log(reason)));

    return this._encryptedMasterKeyPromise
  }

}

export default AuthSessionManager;