import forge from 'node-forge'

class AuthSessionManager {

  constructor(password, _algorithm, params) {
    this.password = password;
    this.params = params;
  }

  passwordHashPromise(){
    if (this._passwordHashPromise) {
      return this._passwordHashPromise
    }
    console.log("Set Hash");
    let {password} = this;
    let {encodedSalt, iterations, messageDigestAlgorithm, hashSize} = this.params;
    this._passwordHashPromise = new Promise((resolve) => {
      let salt = forge.util.decode64(encodedSalt);
      let hash=forge.pkcs5.pbkdf2(password, salt, iterations, hashSize, messageDigestAlgorithm);
      console.log("Hash : ", hash);
      resolve(hash)
    });
    return this._passwordHashPromise
  }

  keypairPromise() {
    let {keySize, primeGeneratorAlgorithm} = this.params;
    if (this._keypairPromise) {
      return this._keypairPromise
    }
    console.log("Set keypairPromise");
    this._keypairPromise = this.passwordHashPromise().then((seed)=>{
      console.log("pnrgSeed :", seed);
      let buffer=forge.util.createBuffer(seed, 'raw');
      let prng = forge.random.createInstance();
      prng.seedFileSync = function(needed) {
        // get 'needed' number of random bytes from hash
        return buffer.getBytes(needed);
      };
      return new Promise((resolve)=> {
        console.time("generateKeyPair");
        forge.pki.rsa.generateKeyPair({
          bits:     keySize,
          prng:      prng,
          algorithm:  primeGeneratorAlgorithm,
          workers:   -1
        }, (_err, keypair) => {
          console.log("KeyPair :",keypair);
          resolve(keypair)
        });
      });

    }, function (reason) {
      console.log(reason);
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