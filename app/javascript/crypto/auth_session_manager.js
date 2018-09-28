import forge from 'node-forge'

class AuthSessionManager {

  constructor(password, _algorithm, params, challenge) {
    this.password = password;
    this.params = params;
    this.challenge=challenge
  }

  buildHash(){
    let {password} = this;
    let {encodedSalt, iterations, messageDigestAlgorithm, hashSize} = this.params;
    let salt = forge.util.decode64(encodedSalt);
    return forge.pkcs5.pbkdf2(password, salt, iterations, hashSize, messageDigestAlgorithm);
  }

  buildPrngFormHash(hash){
    let buffer=forge.util.createBuffer(hash, 'raw');
    let prng = forge.random.createInstance();
    prng.seedFileSync = function(needed) {
      // get 'needed' number of random bytes from hash
      return buffer.getBytes(needed);
      //return forge.util.fillString("a",needed)
    };
    return prng
  }

  buildKeypairFromPrng(prng){
    let {keySize, primeGeneratorAlgorithm} = this.params;
    return forge.pki.rsa.generateKeyPair({
      bits:     keySize,
      prng:      prng,
      algorithm:  primeGeneratorAlgorithm
    });
  }

  signWithKeypair(keypair){
    let {challenge} = this;
    let md = forge.md.sha256.create()

    md.update(challenge.value, 'utf8');
    return keypair.privateKey.sign(md)
  }

  signatureEncodedPromise() {
    let _this = this;
    return new Promise(function (resolve, reject) {
      console.time("buildHash");
      let hash = _this.buildHash();
      console.timeEnd("buildHash");

      console.time("buildPrngFormHash");
      let prng = _this.buildPrngFormHash(hash);
      console.timeEnd("buildPrngFormHash");

      console.time("buildKeypairFromPrng");
      let keypair = _this.buildKeypairFromPrng(prng);
      console.timeEnd("buildKeypairFromPrng");

      console.time("signWithKeypair");
      let signature = _this.signWithKeypair(keypair);
      console.timeEnd("signWithKeypair");

      let encodedSignature = forge.util.encode64(signature);
      _this.debugOutput = {
        hash:      {
          value:   hash,
          encoded: forge.util.encode64(hash)
        },
        prng:      prng,
        keypair:   {
          value:      keypair,
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

  }

  // masterKeyPromise(){
  //   if (this._masterKeyPromise) {
  //     return this._masterKeyPromise
  //   }
  //
  //   this._masterKeyPromise=new Promise(function(resolve){
  //     resolve(forge.random.getBytesSync(32));
  //   });
  //
  //   return this._masterKeyPromise
  // }
  //
  // encryptedMasterKeyPromise(){
  //   if (this._encryptedMasterKeyPromise) {
  //     return this._encryptedMasterKeyPromise
  //   }
  //
  //   this._encryptedMasterKeyPromise=Promise.all([this.masterKeyPromise(), this.keypairPromise()]).then(function(values){
  //     let [masterKey, keypair] = values;
  //
  //     return new Promise(function (resolve) {
  //       resolve(keypair.publicKey.encrypt(masterKey,'RSA-OAEP', {
  //         md: forge.md.sha256.create()
  //       }));
  //     });
  //   }, (reason) => (console.log(reason)));
  //
  //   return this._encryptedMasterKeyPromise
  // }

}

export default AuthSessionManager;