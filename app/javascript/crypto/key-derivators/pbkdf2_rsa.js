import forge from 'node-forge'

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

  buildPrngFormHash(hash) {
    let buffer = forge.util.createBuffer(hash, 'raw');
    let prng = forge.random.createInstance();
    prng.seedFileSync = function (needed) {
      // get 'needed' number of random bytes from hash
      return buffer.getBytes(needed);
      //return forge.util.fillString("a",needed)
    };
    return prng
  }

  buildKeypairFromPrng(prng) {
    let {keySize, primeGeneratorAlgorithm} = this.params;
    return forge.pki.rsa.generateKeyPair({
      bits:      keySize,
      prng:      prng,
      algorithm: primeGeneratorAlgorithm
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

      console.time("buildPrngFormHash");
      let prng = _this.buildPrngFormHash(hash);
      console.timeEnd("buildPrngFormHash");

      console.time("buildKeypairFromPrng");
      let keypair = _this.buildKeypairFromPrng(prng);
      console.timeEnd("buildKeypairFromPrng");

      console.time("signWithKeypair");
      let signature = _this.signWithKeypair(keypair, challenge);
      console.timeEnd("signWithKeypair");

      let encodedSignature = forge.util.encode64(signature);
      _this.debugOutput = {
        hash:      {
          value:   hash,
          encoded: forge.util.encode64(hash)
        },
        prng:      prng,
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
  }
}
export default Pbkdf2Rsa;
